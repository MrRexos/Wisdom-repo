
import React, { useEffect } from 'react'
import {View, StatusBar} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import WisdomLogo from '../assets/wisdomLogo.svg'
import { useNavigation } from '@react-navigation/native';



export default function SettingsScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  
  useEffect(()=>{
    setTimeout(() => {
      navigation.navigate('GetStarted');
    }, 2000);
  },[])

  return (
    <View className='flex-1 flex-row bg-[#272626] justify-center items-center'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <WisdomLogo width={190} height={100}/>
    </View>
  );
}