import { View, Text, TouchableOpacity, Platform, NativeModules } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getDataLocally } from '../../utils/asyncStorage';
import * as Font from 'expo-font';

export default function WelcomeVideoScreen() {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [token, setToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();
  

  useEffect(() => {

    const changeDefaultLanguage = () => {
      const deviceLanguage =
          Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale ||
              NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
            : NativeModules.I18nManager.localeIdentifier;
  
      const language = deviceLanguage.split(/[_-]/)[0];
      i18n.changeLanguage(language);
  
      console.log(language);
    };

    const loadUserData = async () => {
      const userData = await getDataLocally('user');
      if (userData) {
        const user = JSON.parse(userData);
        setToken(user.userToken);
        if (user.userToken) {
          navigation.navigate('Loading');
        } else {
          changeDefaultLanguage();
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadUserData();
    
  }, []);

  if (isLoading) {
    // Mientras isLoading es true, la pantalla no se renderiza
    return null;
  }

  return (
    <View className='flex-1 justify-end items-center bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <TouchableOpacity onPress={() => navigation.navigate('Loading')}>
        <Text className='text-[#f2f2f2] font-inter-semibold m-[75]'>{t('skip_intro')}</Text>
      </TouchableOpacity>
    </View>
  );
}
