import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getDataLocally } from '../utils/asyncStorage';

export default function WelcomeVideoScreen() {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [token, setToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await getDataLocally('user');
      if (userData) {
        const user = JSON.parse(userData);
        setToken(user.userToken);
        if (user.userToken) {
          navigation.navigate('Loading');
        } else {
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
