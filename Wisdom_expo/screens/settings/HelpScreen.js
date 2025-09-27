
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image, Linking} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Check } from "react-native-feather";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function HelpScreen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
  const currentLanguage = i18n.language;
  const [userId, setUserId] = useState();
  const [moneyWallet, setMoneyWallet] = useState([]);

  const Sections = [
    {
      items: [
        {id: 'bookings', label: t('faq'), type: 'select', link: 'FAQ'},
        {id: 'terms', label: t('terms'), type: 'select', link: 'Terms'},
        {id: 'privacyPolicy', label: t('privacy_policy_title'), type: 'select', link: 'PrivacyPolicy'},
        {id: 'writeUs', label: t('write_us'), type: 'link', link: 'mailto:wisdom.helpcontact@gmail.com'},
      ]
    },
  ];


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      
      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[90px] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>
            <View className="flex-1 justify-center items-center ">
                <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('help')}</Text>
            </View>
            
            <View className="flex-1"></View>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-[75px] space-y-9">
        
        {Sections.map(({items}, sectionIndex) => (
          <View key={sectionIndex} style={{borderRadius: 12, overflow: 'hidden'}}>
            {items.map(({label, id, type, link}, index) => (
              <View key={id} className="pl-5  bg-[#fcfcfc]  dark:bg-[#323131]" >
                <TouchableOpacity onPress={() => {
                    if (type === 'link') {
                      Linking.openURL(link); 
                    } else if (type === 'select') {
                      navigation.navigate(link);
                    }
                  }} >
                  <View className=" flex-row items-center justify-start ">
                    <View className="py-[10px] flex-1 flex-row items-center justify-start pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{borderTopWidth: 1}, index===0 && {borderTopWidth: 0 }]}>                   
                      <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                      <View className="flex-1"/>

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
        <View className="h-10"></View>
      </ScrollView>
    </SafeAreaView>
  );
}