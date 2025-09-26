
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, Keyboard, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon } from 'react-native-heroicons/outline';
import { Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/solid';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';




export default function EditAccountScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const currentLanguage = i18n.language;
  const [user, setUser] = useState();
  const [email, setEmail] = useState('');
  const [usernameExists, setUsernameExists] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  const getUserData = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUser(user);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getDataLocally('user');
      const user = JSON.parse(userData);
      setUser(user);
      setEmail(user.email);
    };
    fetchUser();
  }, []);

  useRefreshOnFocus(getUserData);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserData();
    setRefreshing(false);
  };

  const inputEmailChanged = (text) => {
    setEmail(text);
    setShowError(false);
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await api.get('/api/check-email', {
        params: {
          email: email,  // Pasas el email como parámetro de consulta
        },
      });

      if (response.data.exists) {
        setErrorMessage(t('email_already_in_use'));
        setShowError(true);
      } else {

        return true;

      }
    } catch (error) {
      console.error('Error al verificar el email:', error);
    }
  };

  const updateAccount = async () => {
    try {
      const response = await api.put(`/api/user/${user.id}/email`, {
        email: email,
      });

      return response.data;

    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  }

  const DonePressed = async () => {

    setEmail(email.trim().toLowerCase());


    if (email.includes('@')) {
      const response = await checkEmailExists(email);
      console.log(response)
      if (response === true) {
        const responseUpdate = await updateAccount();
        user.email = email;
        await storeDataLocally('user', JSON.stringify(user));
        navigation.goBack();
      }
    }
    else {
      setErrorMessage(t('email_not_valid'));
      setShowError(true);
    }

  };

  const deleteAccount = async () => {
    Alert.alert(
      t('are_you_sure_you_want_to_delete_this_account'),
      t('doing_this_will_delete_all_your_data'),
      [
        {
          text: t('cancel'),
          onPress: null,
          style: 'cancel',
        },
        {
          text: t('delete'),
          onPress: async () => {
            try {
              const response = await api.delete(`/api/user/${user.id}`, {
                email: email,
              });

              navigation.navigate('GetStarted');
              return response.data;


            } catch (error) {
              if (error.response) {
                console.error('Error message:', error.message);
              }
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );


  }

  useEffect(() => {
    const originalEmail = user?.email || '';
    setHasChanges(email !== originalEmail);
  }, [email]);



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[95px] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
          <View className="flex-1 ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center  ">
            <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('account')}</Text>
          </View>

          <View className="flex-1 justify-center items-end">
            <TouchableOpacity
              disabled={!hasChanges || !email}
              pointerEvents={hasChanges && email ? 'auto' : 'none'}
              onPress={DonePressed}
              className={`
                  mr-2 justify-center items-center rounded-full px-3 py-2
                  bg-[#E0E0E0] dark:bg-[#3D3D3D]
                  ${hasChanges && email ? '' : 'opacity-0'}
                `}
            >
              <Text className="font-inter-medium text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                Done
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-[75px]" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        <View>
          <Text className="mt-6 mb-2 font-inter-medium text-[15px] text-[#b6b5b5] dark:text-[#706f6e]">{t('email')}</Text>
          <View className="w-full h-[55px] py-2 px-6 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            <TextInput
              placeholder=''
              selectionColor={cursorColorChange}
              placeholderTextColor={placeHolderTextColorChange}
              onChangeText={inputEmailChanged}
              value={email}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
            />
          </View>
          {showError ? (
            <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
          <Text className="font-inter-medium text-[15px] pt-7 text-[#706F6E] dark:text-[#706F6E]">{t('change_password_arrow')}</Text>
        </TouchableOpacity>





        <View className="h-10"></View>
      </ScrollView>

      <TouchableOpacity onPress={deleteAccount} className="justify-center items-center w-full mb-10">
        <Text className="font-inter-semibold text-[15px] text-[#ff633e]/50 ">{t('delete_account')}</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}
