
import React, { useState, useEffect } from 'react'
import {View, StatusBar} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { useNavigation } from '@react-navigation/native';
import { getDataLocally, storeDataLocally } from '../../utils/asyncStorage';
import { applyLanguagePreference, detectDeviceLanguage } from '../../utils/language';




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
        let user = null;
        try {
          user = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data', error);
        }

        if (user) {
          setToken(user.token);
          await applyLanguagePreference(user, async (updatedUser) => {
            await storeDataLocally('user', JSON.stringify(updatedUser));
          });

          setTimeout(() => {
            if (user.token) {
              navigation.navigate('HomeScreen');
            } else {
              navigation.navigate('GetStarted');
            }
          }, 1000);
          return;
        }
      }

      const language = detectDeviceLanguage();
      if (language !== i18n.language) {
        await i18n.changeLanguage(language);
      }

      setTimeout(() => {
        navigation.navigate('GetStarted');
      }, 1000);
    };
    loadColorScheme();
    loadUserData();
  }, []);

  return (
    <View className='flex-1 flex-row bg-[#111111] justify-center items-center'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <WisdomLogo  width={100} height={70}/>
    </View>
  );
}