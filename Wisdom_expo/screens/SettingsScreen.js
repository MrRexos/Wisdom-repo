
import React, {useState, useEffect, useCallback} from 'react';
import { Text, View, Button, Switch, Platform, StatusBar, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storeDataLocally, getDataLocally } from '../utils/asyncStorage';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Share, Edit3, Settings, Bell, MapPin, UserPlus, Info, Star, Instagram, Link } from "react-native-feather";
import {KeyIcon ,ChevronRightIcon, ArrowsRightLeftIcon} from 'react-native-heroicons/outline';
import GiftCardIcon from '../assets/GiftCard';
import ExpertIcon from '../assets/Expert';
import CashStackIcon from '../assets/CashStack';
import SuticasePlusIcon from '../assets/SuitcasePlus';



const Sections = [
  {
    items: [
      {id: 'account', icon: KeyIcon, label:'Account', type: 'select'},
      {id: 'preferences', icon: Settings, label:'Preferences', type: 'select', link: 'Preferences'},
      {id: 'notifications', icon: Bell, label:'Notifications', type: 'toggle'},
      {id: 'directions', icon: MapPin, label:'Directions', type: 'select'},
      {id: 'payments', icon: CashStackIcon, label:'Payments and refunds', type: 'select'},
    ]
  },
  {
    items: [
      {id: 'provideService', icon: SuticasePlusIcon, label:'Provide service', type: 'select'},
      {id: 'switchProfessionalVersion', icon: ArrowsRightLeftIcon, label:'Switch to professional version', type: 'select'},
      {id: 'becomeExpert', icon: ExpertIcon, label:'Become an expert', type: 'select'},
    ]
  },
  {
    items: [
      {id: 'giftCard', icon: GiftCardIcon, label:'Gift card', type: 'select'},
      {id: 'inviteProfessionals', icon: UserPlus, label:'Invite professionals', type: 'select'},
    ]
  },
  {
    items: [
      {id: 'help', icon: Info, label:'Help', type: 'select'},
      {id: 'rateUs', icon: Star, label:'Rate us', type: 'select'},
      {id: 'shareApp', icon: Share, label:'Share app', type: 'select'},
      {id: 'followInsta', icon: Instagram, label:'Follow us in Instagram', type: 'select'},
    ]
  },
];


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
  const userObject = {
    userToken: false,
    email: '',
    name: '',
    surname: '',
    username: '',
    profileImage: null,
    selectedLanguage: '',
    allowNotis: null,
  };

  const logOut = async () => {
    await storeDataLocally('user', JSON.stringify(userObject));
    navigation.navigate('GetStarted');
  };

  const handleToggleAllowNotis = async (value) => {
    const userData = await getDataLocally('user');
    if (userData) {
      const user = JSON.parse(userData);
      user.allowNotis = value; 
      await storeDataLocally('user', JSON.stringify(user));
      setAllowNotis(value);
      setForm({...form, notifications: value});
    } else {
      console.log('No user found in AsyncStorage');
    }
  }
  
  const loadUserData = async () => {
    const userData = await getDataLocally('user');
    if (userData) {
      user = JSON.parse(userData);
      setImage({ uri: user.profileImage });
      setName(user.name);
      setSurname(user.surname);
      setUsername(user.username);
      setAllowNotis(user.allowNotis);
      setForm({ notifications: user.allowNotis });
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      
      <ScrollView className="flex-1 px-6 pt-[55] gap-y-9">
        <View className="flex-row justify-between">
          <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
              Profile
          </Text>
          <TouchableOpacity className="h-[43] w-[43] rounded-full items-center justify-center bg-[#fcfcfc] dark:bg-[#323131]">
            <Share height={22} strokeWidth={1.7} color={iconColor}/>
          </TouchableOpacity>
        </View>
        <View className="justify-between flex-row items-center px-2">
          <View className="justify-start flex-row"> 
            <TouchableOpacity >
              <Image source={image ? { uri: image.uri } : require('../assets/defaultProfilePic.jpg')} className="w-[75] h-[75] rounded-full bg-slate-500" />
            </TouchableOpacity>
            <View className="justify-center px-3 gap-y-1 " >
              <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{name} {surname}</Text>
              <Text className="font-inter-medium text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">@{username}</Text>
            </View>

          </View>
          <Edit3 height={20} strokeWidth={1.7} color={iconColor}/>
        </View>
        
        {Sections.map(({items}, sectionIndex) => (
          <View key={sectionIndex} style={{borderRadius: 12, overflow: 'hidden'}}>
            {items.map(({label, id, type, link, icon: Icon}, index) => (
              <View key={id} className="pl-5  bg-[#fcfcfc]  dark:bg-[#323131]" >
                <TouchableOpacity onPress={() => {['select', 'link'].includes(type) && navigation.navigate(link)}} >
                  <View className=" flex-row items-center justify-start ">
                    <Icon  color={iconColor} strokeWidth={1.5} className="mr-4" style={{ transform: [{ scale: 1 }]}} ></Icon>
                    <View className="h-[45] flex-1 flex-row items-center justify-start pr-[14] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{borderTopWidth: 1}, index===0 && {borderTopWidth: 0 }]}>                   
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
        <View className="justify-center items-center">
          <TouchableOpacity 
                  onPress={logOut}
                  className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-[320] h-[55] rounded-full items-center justify-center" >
                      <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">Log out</Text>
          </TouchableOpacity>
          <Text className="pt-4 pb-[85] text-[#e0e0e0] dark:text-[#3d3d3d]">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}