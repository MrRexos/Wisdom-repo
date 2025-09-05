import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Button, Switch, Platform, StatusBar, SafeAreaView, ScrollView, TouchableOpacity, Image, Linking, RefreshControl, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../utils/api.js';
import * as Notifications from 'expo-notifications';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import eventEmitter from '../../utils/eventEmitter';


import { Share, Edit3, Settings, Bell, MapPin, UserPlus, Info, Star, Instagram, Link } from "react-native-feather";
import { KeyIcon, ChevronRightIcon, ArrowsRightLeftIcon } from 'react-native-heroicons/outline';
import GiftCardIcon from '../../assets/GiftCard';
import ExpertIcon from '../../assets/Expert';
import CashStackIcon from '../../assets/CashStack';
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
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    notifications: false,
  });

  const Sections = [
    {
      items: [
        { id: 'account', icon: KeyIcon, label: t('account'), type: 'select', link: 'EditAccount' },
        { id: 'preferences', icon: Settings, label: t('preferences'), type: 'select', link: 'Preferences' },
        { id: 'notifications', icon: Bell, label: t('notifications'), type: 'toggle' },
        { id: 'directions', icon: MapPin, label: t('directions'), type: 'select', link: 'Directions' },
        { id: 'payments', icon: CashStackIcon, label: t('payments_and_refunds'), type: 'select', link: 'WalletPro' },
      ]
    },
    {
      items: [
        { id: 'provideService', icon: SuticasePlusIcon, label: t('provide_service'), type: 'select', link: 'CreateServiceStart' },
        { id: 'switchClientVersion', icon: ArrowsRightLeftIcon, label: t('switch_to_client_version'), type: 'select', link: 'Home' },
        { id: 'becomeExpert', icon: ExpertIcon, label: t('become_an_expert'), type: 'select', link: 'TurnExpert' },
      ]
    },
    {
      items: [
        { id: 'help', icon: Info, label: t('help'), type: 'select', link: 'Help' },
        { id: 'followInsta', icon: Instagram, label: t('follow_us_in_instagram'), type: 'link', link: 'https://www.instagram.com/wisdom__app/' },
      ]
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        const userData = await getDataLocally('user');
        console.log(userData);

        // Comprobar si userData indica que no hay usuario
        if (userData === '{"token":false}') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'GetStarted' }],
          });
        }
      };

      checkUserData();
    }, [navigation])
  );

  const logOut = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error al limpiar el almacenamiento:', error);
    } finally {
      await storeDataLocally('user', JSON.stringify({ token: false }));
      setTimeout(() => {
        eventEmitter.emit('profileUpdated');
      }, 0);
      navigation.reset({ index: 0, routes: [{ name: 'GetStarted' }] });
    }
  };

  const changeAllowNotis = async (userId, allowNotis) => {
    try {
      const response = await api.put(`/api/user/${userId}/allow_notis`, {
        allow_notis: allowNotis,
      });
      return response.data;
    } catch (error) {
      console.error('Error al llamar a la API:', error.message);
    }
  };

  const updateNotificationsStatus = async (value) => {
    const userData = await getDataLocally('user');
    if (userData) {
      const user = JSON.parse(userData);
      user.allow_notis = value;
      await storeDataLocally('user', JSON.stringify(user));
      setAllowNotis(value);
      setForm({ ...form, notifications: value });
      await changeAllowNotis(user.id, value);
    } else {
      console.log('No user found in AsyncStorage');
    }
  };

  const handleToggleAllowNotis = async (value) => {
    try {
      if (value) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('allow_wisdom_to_send_notifications'),
            t('need_notifications_access'),
            [
              {
                text: t('cancel'),
                style: 'cancel',
                onPress: () => setForm({ ...form, notifications: false })
              },
              {
                text: t('allow'),
                onPress: async () => {
                  const { status: reqStatus } = await Notifications.requestPermissionsAsync();
                  if (reqStatus === 'granted') {
                    await updateNotificationsStatus(true);
                  } else {
                    setForm({ ...form, notifications: false });
                  }
                }
              }
            ]
          );
          return;
        }
      }
      await updateNotificationsStatus(value);
    } catch (error) {
      console.error('Error al actualizar las notificaciones:', error);
    }
  };

  const loadUserData = async () => {
    const userData = await getDataLocally('user');

    if (userData) {
      user = JSON.parse(userData);
      setImage(user.profile_picture);
      setName(user.first_name);
      setSurname(user.surname);
      setUsername(user.username);
      setAllowNotis(user.allow_notis);
      setForm({ notifications: user.allow_notis });
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  useRefreshOnFocus(loadUserData);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <ScrollView className="flex-1 px-6 pt-[55px]" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        <View className='gap-y-9'>
          <View className="flex-row justify-between">
            <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
              {t('profile')}
            </Text>
            <TouchableOpacity className="h-[43px] w-[43px] rounded-full items-center justify-center bg-[#fcfcfc] dark:bg-[#323131]">
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
                        navigation.navigate(link);
                      }
                    }}
                  >
                    <View className=" flex-row items-center justify-start ">
                      <Icon color={iconColor} strokeWidth={1.6} style={{ transform: [{ scale: 1 }] }} ></Icon>
                      <View className="ml-4 py-[10px] flex-1 flex-row items-center justify-start pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{ borderTopWidth: 1 }, index === 0 && { borderTopWidth: 0 }]}>
                        <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                        <View className="flex-1" />

                        {type === 'toggle' && (
                          <Switch
                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                            value={form[id]}
                            onValueChange={(value) => {
                              setForm({ ...form, [id]: value });
                              handleToggleAllowNotis(value);
                            }}
                          />
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
            <Text className="pt-4 pb-[85px] text-[#e0e0e0] dark:text-[#3d3d3d]">{t('version_1_0_3')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}