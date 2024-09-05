
import React, { useState, useEffect } from 'react'
import {View, StatusBar} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { useNavigation } from '@react-navigation/native';
import { getDataLocally } from '../../utils/asyncStorage';




export default function SettingsScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [token, setToken] = useState(false);
  
  useEffect(() => {
    const loadColorScheme = async () => {
      let storedColorScheme = await getDataLocally('colorScheme');
      if (storedColorScheme && storedColorScheme !== colorScheme) {
        toggleColorScheme();
      }
    };
    const loadUserData = async () => {
      const userData = await getDataLocally('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        setToken(user.userToken);
        let language = user.selectedLanguage;
        if (language) {
          i18n.changeLanguage(language);
        };
        setTimeout(() => {
          if (user.userToken) {
            navigation.navigate('HomeScreen');
          } else {
            navigation.navigate('GetStarted');
          }
        }, 1000);
      } else {
        setTimeout(() => {
            navigation.navigate('GetStarted');
        }, 1000);
      };
    };
    loadColorScheme();
    loadUserData();
  }, []);

  return (
    <View className='flex-1 flex-row bg-[#272626] justify-center items-center'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <WisdomLogo  width={190} height={100}/>
    </View>
  );
}