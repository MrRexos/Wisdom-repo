import { View, Text, Switch, Button, TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Navigation from '../navigation/navigation';
import { StatusBar } from 'expo-status-bar';

import { useNavigation } from '@react-navigation/native';
import i18n from '../languages/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';


export default function WelcomeVideoScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslation()

    useEffect(()=>{
      const loadLanguage = async ()=>{
        try{
          const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
          if (selectedLanguage) {
            i18n.changeLanguage(selectedLanguage);
            console.log('data loaded')
          }
        }catch(err){
          console.log(err)
        }
      }
      loadLanguage()
    },[])

    return (
        <View className='flex-1 justify-end items-center bg-[#f2f2f2] dark:bg-[#272626]'>
          <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          <Switch value={colorScheme==='dark'} onChange={toggleColorScheme}/>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text className='text-[#272626] dark:text-[#f2f2f2] font-inter-semibold m-[75]'>{t('skip_intro')}</Text>
          </TouchableOpacity>
      </View>
    )
}