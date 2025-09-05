
import React, {useState} from 'react';
import {View, StatusBar,SafeAreaView, Platform, Text, Alert, TouchableOpacity, ScrollView} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { useNavigation, useRoute } from '@react-navigation/native';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage.js';
import {XMarkIcon} from 'react-native-heroicons/outline';
import NotificationAskWhite from '../../assets/NotificationAskWhite.svg';
import NotificationAskDark from '../../assets/NotificationAskDark.svg';
import api from '../../utils/api.js';




export default function NotificationAllowScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const route = useRoute();
    const [apiError, setApiError] = useState('');

    let user = {
        token: null,
        id: "", //FALTAAAA
        email: "",
        username: "",
        first_name: "",
        surname: "",
        profile_picture: null,
        joined_datetime: "", 
        is_professional: false,
        language: "", 
        allow_notis: true, 
        money_in_wallet: "0.00",
        professional_started_datetime: null,
        is_expert: false,
        is_verified: false,
        strikes_num: false,
        hobbies: null
    };
  
    const {email, password, firstName, surname, username, image} = route.params;

    console.log(email, password, firstName, surname, username, image);
   
    
    const uploadImage = async () => {
      if (!image) {
        Alert.alert(t('please_select_image_first'));
        return null;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: image.type,
        name: image.fileName,
      });

      try {
        const res = await api.post('/api/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return res.data.url;
      } catch (error) {
        console.error(error.response.data);
      }
      return null;
    };

    const createUser = async (allowNotis) => {
      try {
        const response = await api.post('/api/signup', {
          email: email,
          username: username,
          password: password,
          first_name: firstName,
          surname: surname,
          language: i18n.language,
          allow_notis: allowNotis,
          profile_picture: null
        });
        console.log('User created:', response.data);
        return { id: response.data.userId, token: response.data.token };
        

      } catch (error) {
          if (error.response) {
              console.error('Error response:', error.response.data);
              console.error('Error status:', error.response.status);
          } else if (error.request) {
              console.error('Error request:', error.request);
          } else {
              console.error('Error message:', error.message);
          }
          setApiError('Failed to create user');
      }
    };

    const updateUserProfile = async (imageURL) => {
      try {
        await api.put(`/api/user/${user.id}/profile`, {
          username: username,
          first_name: firstName,
          surname: surname,
          profile_picture: imageURL,
        });
      } catch (error) {
        console.error('Error updating user profile:', error);
      }
    };

    const notAllowPressed = async () => {
      try {
        const result = await createUser(false);
        if (!result) return;
    
        user.id = result.id;
        user.token = result.token;
        user.email = email;
        user.first_name = firstName;
        user.surname = surname;
        user.username = username;
        user.language = i18n.language;
        user.joined_datetime = new Date().toISOString();
        user.allow_notis = false;
        user.profile_picture = null;
    
        await storeDataLocally('user', JSON.stringify(user));
    
        const imageURL = await uploadImage();
        if (imageURL) {
          await updateUserProfile(imageURL);
          user.profile_picture = imageURL;
          await storeDataLocally('user', JSON.stringify(user));
        }
    
        navigation.navigate('HomeScreen');
      } catch (e) {
        console.error('Error en notAllowPressed:', e);
      }
    };

    const allowPressed = async () =>{
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      const result = await createUser(granted);
      if (!result) return;

      user.id = result.id;
      user.token = result.token;
      user.email = email;
      user.first_name = firstName;
      user.surname = surname;
      user.username = username;
      user.language =  i18n.language;
      user.joined_datetime = new Date().toISOString();
      user.allow_notis = granted;
      user.profile_picture = null;

      await storeDataLocally('user', JSON.stringify(user));

      const imageURL = await uploadImage();
      if (imageURL) {
          await updateUserProfile(imageURL);
          user.profile_picture = imageURL;
          await storeDataLocally('user', JSON.stringify(user));
      }

      navigation.navigate('HomeScreen');

  }
  
    return (
      <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="px-5 py-3 w-full flex-1 justify-between">
          <View className="flex-row justify-between">
            <View className="flex-1">
            </View>
            <View className="flex-1 items-center pt-5">
              <WisdomLogo color = {colorScheme === 'dark' ? '#f2f2f2' : '#444343'} width={70} height={40} />
            </View>
            <View className="flex-1 items-end opacity-50">
              <TouchableOpacity onPress={notAllowPressed}>
                <XMarkIcon size={30} color={iconColor} strokeWidth={1.7} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="justify-center items-center ">            
          
            <View className="mt-6 mb-8 items-center">
              
              {colorScheme==='dark'? (
                  <NotificationAskWhite height={320} width={340}/>
                ) : (
                  <NotificationAskDark height={320} width={340}/>
              )}
              <Text className="pt-[60px] absolute font-inter-bold text-[17px] text-[#444343] dark:text-[#f2f2f2] text-cente">Saturday, April 21</Text>
            </View>
            <Text className="font-inter-semibold text-[30px] text-[#444343] dark:text-[#f2f2f2] text-center w-[250px]">{t('stay_informed')}</Text>
            <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5] text-center w-[250px] mt-4">{t('notifications_subtitle')}</Text>
          </View>
          <View className="justify-center items-center pb-4 w-full px-3 ">
                <TouchableOpacity 
                onPress={allowPressed}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">{t('allow')}</Text>
                </TouchableOpacity>
            </View>
          
          
        </View>
      </SafeAreaView>
    );
}