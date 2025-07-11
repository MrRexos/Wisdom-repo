
import React, {useState, useEffect, useCallback} from 'react';
import { Text, View, Button, Switch, Platform, StatusBar, SafeAreaView, ScrollView, TouchableOpacity, Image, Linking, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import eventEmitter from '../../utils/eventEmitter';


import { Share, Edit3, Settings, Bell, MapPin, UserPlus, Info, Star, Instagram, Link } from "react-native-feather";
import {KeyIcon ,ChevronRightIcon, ArrowsRightLeftIcon} from 'react-native-heroicons/outline';
import GiftCardIcon from '../../assets/GiftCard';
import ExpertIcon from '../../assets/Expert';
import CashStackIcon from '../../assets/CashStack';
import SuticasePlusIcon from '../../assets/SuitcasePlus';




export default function SettingsScreen() {
  
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [allowNotis, setAllowNotis] = useState(null);
  const [form, setForm] = useState({
    notifications: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  

  const Sections = [
    {
      items: [
        {id: 'account', icon: KeyIcon, label: t('account'), type: 'select', link: 'EditAccount'},
        {id: 'preferences', icon: Settings, label: t('preferences'), type: 'select', link: 'Preferences'},
        {id: 'notifications', icon: Bell, label: t('notifications'), type: 'toggle'},
        {id: 'directions', icon: MapPin, label: t('directions'), type: 'select', link: 'Directions'},
        {id: 'payments', icon: CashStackIcon, label: t('payments_and_refunds'), type: 'select', link: 'Wallet'},
      ]
    },
    {
      items: [
        {id: 'provideService', icon: SuticasePlusIcon, label: t('provide_service'), type: 'select', link: 'CreateService1'},
        {id: 'switchProfessionalVersion', icon: ArrowsRightLeftIcon, label: t('switch_to_professional_version'), type: 'select', link: 'Professional'},
        {id: 'becomeExpert', icon: ExpertIcon, label: t('become_an_expert'), type: 'select', link: 'TurnExpert'},
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
        {id: 'help', icon: Info, label: t('help'), type: 'select', link: 'Help'},
        // {id: 'rateUs', icon: Star, label:'Rate us', type: 'select'},
        // {id: 'shareApp', icon: Share, label:'Share app', type: 'select'},
        {id: 'followInsta', icon: Instagram, label: t('follow_us_in_instagram'), type: 'link', link: 'https://www.instagram.com/wisdom__app/'},
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
    let emptyUser = { token: false}
    await storeDataLocally('user', JSON.stringify(emptyUser));
    eventEmitter.emit('profileUpdated');
    navigation.navigate('GetStarted');
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

  const handleToggleAllowNotis = async (value) => {
  try {
    const userData = await getDataLocally('user');
    if (userData) {
      const user = JSON.parse(userData);
      user.allow_notis = value; 
      
      // Actualizar AsyncStorage
      await storeDataLocally('user', JSON.stringify(user));
      
      // Actualizar el estado local
      setAllowNotis(value);
      setForm({...form, notifications: value});
      
      // Llamar a la API para actualizar en el backend
      await changeAllowNotis(user.id, value);
      
    } else {
      console.log('No user found in AsyncStorage');
    }
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
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      
      <ScrollView
        className="flex-1 px-6 pt-[55px]"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={[colorScheme === 'dark' ? '#f2f2f2' : '#434343']} colors={[colorScheme === 'dark' ? '#f2f2f2' : '#434343']}/>}
      >
        <View className='gap-y-9'>
        <View className="flex-row justify-between">
          <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
              {t('profile')}
          </Text>
          <TouchableOpacity className="h-[43px] w-[43px] rounded-full items-center justify-center bg-[#fcfcfc] dark:bg-[#323131]">
            <Share height={22} strokeWidth={1.7} color={iconColor}/>
          </TouchableOpacity>
        </View>

        <View className="justify-between flex-row items-center px-2">
          <View className="justify-start flex-row"> 
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Image source={image ? {uri: image} : require('../../assets/defaultProfilePic.jpg')} style={{resizeMode: 'cover', width: 75, height: 75 }} className="rounded-full bg-slate-500" />
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
            <Edit3 height={20} strokeWidth={1.7} color={iconColor}/>
          </TouchableOpacity>
        </View>
        
        {Sections.map(({items}, sectionIndex) => (
          <View key={sectionIndex} style={{borderRadius: 12, overflow: 'hidden'}}>
            {items.map(({label, id, type, link, icon: Icon}, index) => (
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
                    <Icon  color={iconColor} strokeWidth={1.7} className="mr-4" style={{ transform: [{ scale: 1 }]}} ></Icon>
                    <View className="ml-4 py-[10px] flex-1 flex-row items-center justify-start pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{borderTopWidth: 1}, index===0 && {borderTopWidth: 0 }]}>                   
                      <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                      <View className="flex-1"/>
                      
                      {type==='toggle' && ( 
                        <Switch 
                          style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                          value={form[id]} 
                          onValueChange={(value) => {
                            setForm({...form, [id]:value});
                            handleToggleAllowNotis(value);             
                          }} 
                        />
                      )}

                      {['select', 'link'].includes(type) &&(
                        <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme=='dark'? '#706f6e': '#b6b5b5'}/>
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