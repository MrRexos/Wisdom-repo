
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, AppState, Button, Switch, Platform, StatusBar, ScrollView, TouchableOpacity, Image, Linking, RefreshControl, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api, { getTokens, clearTokens } from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import eventEmitter from '../../utils/eventEmitter';
import Message from '../../components/Message';
import * as Notifications from 'expo-notifications';


import { Share, Edit3, Settings, Bell, MapPin, UserPlus, Info, Star, Instagram, Link } from "react-native-feather";
import { KeyIcon, ChevronRightIcon, ArrowsRightLeftIcon } from 'react-native-heroicons/outline';
import GiftCardIcon from '../../assets/GiftCard';
import ExpertIcon from '../../assets/Expert';
import CashStackIcon from '../../assets/CashStack';
import { SafeAreaView } from 'react-native-safe-area-context';
import SuticasePlusIcon from '../../assets/SuitcasePlus';




export default function SettingsScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [allowNotis, setAllowNotis] = useState(null);
  const [form, setForm] = useState({
    notifications: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showSlideMessage, setShowSlideMessage] = useState(false);
  const [showModalMessage, setShowModalMessage] = useState(false);
  const [allowNotisReady, setAllowNotisReady] = useState(false);



  const Sections = [
    {
      items: [
        { id: 'account', icon: KeyIcon, label: t('account'), type: 'select', link: 'EditAccount' },
        { id: 'preferences', icon: Settings, label: t('preferences'), type: 'select', link: 'Preferences' },
        { id: 'notifications', icon: Bell, label: t('notifications'), type: 'toggle' },
        { id: 'directions', icon: MapPin, label: t('directions'), type: 'select', link: 'Directions' },
        { id: 'payments', icon: CashStackIcon, label: t('payments_and_refunds'), type: 'select', link: 'Wallet' },
      ]
    },
    {
      items: [
        { id: 'provideService', icon: SuticasePlusIcon, label: t('provide_service'), type: 'select', link: 'CreateServiceStart' },
        { id: 'switchProfessionalVersion', icon: ArrowsRightLeftIcon, label: t('switch_to_professional_version'), type: 'select', link: 'Professional' },
        // { id: 'becomeExpert', icon: ExpertIcon, label: t('become_an_expert'), type: 'select', link: 'TurnExpert' },
      ]
    },
    // {
    //   items: [
    //     {id: 'giftCard', icon: GiftCardIcon, label:'Gift card', type: 'select'},
    //     {id: 'inviteProfessionals', icon: UserPlus, label:'Invite professionals', type: 'select'},
    //   ]
    // },
    {
      items: [
        { id: 'help', icon: Info, label: t('help'), type: 'select', link: 'Help' },
        // {id: 'rateUs', icon: Star, label:'Rate us', type: 'select'},
        // {id: 'shareApp', icon: Share, label:'Share app', type: 'select'},
        { id: 'followInsta', icon: Instagram, label: t('follow_us_in_instagram'), type: 'link', link: 'https://www.instagram.com/wisdom__app/' },
      ]
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        const userData = await getDataLocally('user');
        console.log(userData);

        if (!userData) {
          return;
        }

        try {
          const user = JSON.parse(userData);
          if (!user?.token) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'GetStarted' }],
            });
          }
        } catch (error) {
          console.error('Failed to parse user data', error);
        }
      };

      checkUserData();
    }, [navigation])
  );

  const logOut = async () => {
    try {

     // 1) Revocar refresh en servidor (si existe) 
     const { refresh } = await getTokens(); 
     if (refresh) { 
       try { await api.post('/api/logout', { refresh_token: refresh }); } catch (e) {} 
     } 
     // 2) Limpiar tokens dedicados 
     await clearTokens(); 
     // 3) (Opcional) Limpiar resto de storage si así lo quieres 
     await AsyncStorage.clear(); 
    } catch (error) {
      console.error('Error al limpiar el almacenamiento:', error);
    } finally {
      const currentLanguage = i18n.language;
      await storeDataLocally(
        'user',
        JSON.stringify({ token: false, language: currentLanguage, selectedLanguage: currentLanguage })
      );
      setTimeout(() => {
        eventEmitter.emit('profileUpdated');
      }, 0);
      navigation.reset({ index: 0, routes: [{ name: 'GetStarted' }] });
    }
  };

  // API para actualizar en tu backend (la tienes ya igual):
  const changeAllowNotis = async (userId, allowNotisValue) => {
    try {
      const response = await api.put(`/api/user/${userId}/allow_notis`, {
        allow_notis: allowNotisValue,
      });
      return response.data;
    } catch (error) {
      console.error('Error al llamar a la API:', error.message);
    }
  };

  // Persistir en AsyncStorage + estado + backend:
  const persistAllowNotis = async (value) => {
    try {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const user = JSON.parse(userData);
      user.allow_notis = value;
      await storeDataLocally('user', JSON.stringify(user));
      setAllowNotis(value);
      setForm(prev => ({ ...prev, notifications: value }));
      await changeAllowNotis(user.id, value);
    } catch (e) {
      console.error('persistAllowNotis error:', e);
    }
  };

  // Sincroniza con el permiso real del SO (llamar al entrar en Settings o al volver a la app)
  const syncAllowNotisFromOS = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const deviceEnabled = status === 'granted';

      const userData = await getDataLocally('user');
      if (!userData) {
        setAllowNotis(deviceEnabled);
        setAllowNotisReady(true);
        return;
      }

      const user = JSON.parse(userData);
      const appValue = !!user.allow_notis;

      // si no cuadra, actualiza app + storage + backend
      if (appValue !== deviceEnabled) {
        await persistAllowNotis(deviceEnabled);
        setAllowNotisReady(true);
      } else {
        setAllowNotis(deviceEnabled);
        setForm(prev => ({ ...prev, notifications: deviceEnabled }));
        setAllowNotisReady(true);
      }
    } catch (e) {
      console.error('syncAllowNotisFromOS error:', e);
      setAllowNotisReady(true);
    }
  };

  // Lanza la sync al enfocar la pantalla de Settings
  useFocusEffect(
    useCallback(() => {
      syncAllowNotisFromOS();
      console.log('syncAllowNotisFromOS');
    }, [])
  );

  // Y también al volver de background (por si el usuario cambió el ajuste en el SO)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncAllowNotisFromOS();
    });
    return () => sub.remove();
  }, []);

  // Handler del switch
  const handleToggleAllowNotis = async (value) => {
    try {
      if (value) {
        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;

        if (status !== 'granted') {
          const req = await Notifications.requestPermissionsAsync();
          finalStatus = req.status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert(
            t('allow_wisdom_to_send_notifications'),
            t('need_notifications_access'),
            [
              { text: t('cancel'), style: 'cancel' },
              { text: t('settings'), onPress: () => Linking.openSettings() },
            ],
            { cancelable: true }
          );
          // revertir visualmente el switch
          setAllowNotis(false);
          setForm(prev => ({ ...prev, notifications: false }));
          return;
        }
      }

      // permisos OK o estamos desactivando: persistir
      await persistAllowNotis(value);
    } catch (e) {
      console.error('Error al actualizar las notificaciones:', e);
      setAllowNotis(prev => !prev);
      setForm(prev => ({ ...prev, notifications: !prev.notifications }));
    }
  };

  const loadUserData = async () => {
    const userData = await getDataLocally('user');

    if (userData) {
      const user = JSON.parse(userData);
      setImage(user.profile_picture);
      setName(user.first_name);
      setSurname(user.surname);
      setUsername(user.username);
      setAllowNotis(user.allow_notis);
      setForm({ notifications: user.allow_notis });
      setAllowNotisReady(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  useRefreshOnFocus(loadUserData);



  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <Message
        type="modal"
        visible={showModalMessage}
        title="Can't share your profile"
        description="We're not sure how to do this yet. You can share your profile manually."
        onConfirm={() => {
          console.log('Missatge confirmat');
        }}
        onCancel={() => {
        }}
        onDismiss={() => setShowModalMessage(false)}
        dismissOnBackdropPress={true}
        showCancelColor={false}
        confirmText="Ok"
        cancelText="Cancel"
      />
      <Message
        type="slide"
        visible={showSlideMessage}
        title="Missatge"
        description="Aquest missatge es deslitzarà des de dalt"
        onDismiss={() => setShowSlideMessage(false)}
        autoHide={true}
        autoHideDelay={2200}
        showCancel={false}
      />

      <ScrollView
        className="flex-1 px-6 pt-[55px]"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colorScheme === 'dark' ? '#f2f2f2' : '#434343'} colors={[colorScheme === 'dark' ? '#f2f2f2' : '#434343']} />}
        showsVerticalScrollIndicator={false}
      >
        <View className='gap-y-9'>
          <View className="flex-row justify-between">
            <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
              {t('profile')}
            </Text>
            <TouchableOpacity onPress={() => setShowModalMessage(prev => !prev)} className="h-[43px] w-[43px] rounded-full items-center justify-center bg-[#fcfcfc] dark:bg-[#323131]">
              <Share height={22} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View className="justify-between flex-row items-center px-2">
            <View className="justify-start flex-row">
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <Image source={image ? { uri: image } : require('../../assets/defaultProfilePic.jpg')} style={{ resizeMode: 'cover', width: 75, height: 75 }} className="rounded-full bg-slate-500" />
              </TouchableOpacity>
              <View className="justify-center px-3 space-y-1 " >
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{name} {surname}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                  <Text className="font-inter-medium text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">@{username}</Text>
                </TouchableOpacity>
              </View>

            </View>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Edit3 height={20} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>

          {Sections.map(({ items }, sectionIndex) => (
            <View key={sectionIndex} style={{ borderRadius: 12, overflow: 'hidden' }}>
              {items.map(({ label, id, type, link, icon: Icon }, index) => (
                <View key={id} className="pl-5  bg-[#fcfcfc]  dark:bg-[#323131]" >
                  <TouchableOpacity
                    disabled={type === 'toggle'}
                    onPress={() => {
                      if (type === 'link' && link) {
                        Linking.openURL(link); // Reemplaza 'yourpage' por tu página de Instagram
                      } else if (type === 'select' && link) {
                        if (link === 'CreateServiceStart') {
                          navigation.navigate('CreateServiceStart', {
                            originScreen: 'HomeScreen',
                            originParams: { screen: 'Settings', params: { screen: 'SettingsScreen' } },
                          });
                        } else {
                          navigation.navigate(link);
                        }
                      }
                    }}
                  >
                    <View className=" flex-row items-center justify-start ">
                      <Icon color={iconColor} strokeWidth={1.6} style={{ transform: [{ scale: 1 }] }} ></Icon>
                      <View className="ml-4 py-[10px] flex-1 flex-row items-center justify-start pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{ borderTopWidth: 1 }, index === 0 && { borderTopWidth: 0 }]}>
                        <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                        <View className="flex-1" />

                        {type === 'toggle' && (
                          <View style={{ width: 50, alignItems: 'flex-end' }}>
                            {allowNotisReady ? (
                              <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                value={!!allowNotis}
                                onValueChange={handleToggleAllowNotis}
                              />
                            ) : (
                              <View style={{ width: 40, height: 24 }} />
                            )}
                          </View>
                        )}

                        {['select', 'link'].includes(type) && (
                          <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme == 'dark' ? '#706f6e' : '#b6b5b5'} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
          <View className="justify-center items-center w-full px-8">
            <TouchableOpacity
              onPress={logOut}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-full h-[55px] rounded-full items-center justify-center" >
              <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('log_out')}</Text>
            </TouchableOpacity>
            <Text className="pt-4 pb-[85px] text-[#e0e0e0] dark:text-[#3d3d3d]">{t('version')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}