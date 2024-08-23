import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getDataLocally } from '../utils/asyncStorage';
import api from '../utils/api';

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

    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setApiError('Failed to load users');
      }
    };

    const createUser = async () => {
      try {
        const response = await api.post('/api/users', {
          first_name: 'John',
          last_name: 'Doe',
          username: 'odddddcddier',
          email: 'john.dode@eqddddddc.com',
          password: 'securepassword',
          profile_picture: 'url_to_picture',
          language: 'en',
          allowNotis: true
        });
        console.log('User created:', response.data);
      } catch (error) {
        console.error('Error creating user:', error);
        setApiError('Failed to create user');
      }
    };

    fetchUsers();
    createUser();
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
