import React, { useState } from 'react';
import {View, StatusBar, Platform, Text, Alert, TouchableOpacity} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { useNavigation, useRoute } from '@react-navigation/native';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage.js';
import {XMarkIcon} from 'react-native-heroicons/outline';
import NotificationAskWhite from '../../assets/NotificationAskWhite.svg';
import NotificationAskDark from '../../assets/NotificationAskDark.svg';
import api from '../../utils/api.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EXPO_GO_PUSH_UNAVAILABLE_MESSAGE,
  isPushNotificationsSupported,
  requestPermissionsAsync as requestNotificationPermissionsAsync,
} from '../../utils/notifications';




export default function NotificationAllowScreen() {
  const insets = useSafeAreaInsets();
    const {colorScheme} = useColorScheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const route = useRoute();
    const { userId = null, isProfessional = false } = route.params || {};
    const [isUpdating, setIsUpdating] = useState(false);

    const persistAllowNotis = async (value) => {
      try {
        if (userId) {
          await api.put(`/api/user/${userId}/allow_notis`, {
            allow_notis: value,
          });
        }

        const storedUser = await getDataLocally('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.allow_notis = value;
          await storeDataLocally('user', JSON.stringify(parsedUser));
        }
      } catch (error) {
        console.error('Error updating allow_notis preference:', error?.response?.data || error);
      }
    };

    const navigateAfterChoice = () => {
      if (isProfessional) {
        navigation.navigate('Professional', { screen: 'Today' });
      } else {
        navigation.navigate('HomeScreen');
      }
    };

    const notAllowPressed = async () => {
      if (isUpdating) return;

      setIsUpdating(true);
      try {
        await persistAllowNotis(false);
        navigateAfterChoice();
      } catch (e) {
        console.error('Error en notAllowPressed:', e);
      } finally {
        setIsUpdating(false);
      }
    };

    const allowPressed = async () =>{
      if (isUpdating) return;

      setIsUpdating(true);
      try {
        if (!isPushNotificationsSupported()) {
          Alert.alert('Push notifications unavailable', EXPO_GO_PUSH_UNAVAILABLE_MESSAGE);
        }

        const { status } = await requestNotificationPermissionsAsync();
        const granted = status === 'granted';

        await persistAllowNotis(granted);
        navigateAfterChoice();
      } catch (error) {
        console.error('Error en allowPressed:', error);
      } finally {
        setIsUpdating(false);
      }
  }
  
    return (
      <View style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="px-5 py-3 w-full flex-1 justify-between">
          <View className="flex-row justify-between">
            <View className="flex-1">
            </View>
            <View className="flex-1 items-center pt-5">
              <WisdomLogo color = {colorScheme === 'dark' ? '#f2f2f2' : '#444343'} width={70} height={40} />
            </View>
            <View className="flex-1 items-end opacity-50">
              <TouchableOpacity onPress={notAllowPressed} disabled={isUpdating}>
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
              <Text className="pt-[60px] absolute font-inter-bold text-[17px] text-[#444343] dark:text-[#f2f2f2] text-center">{t('notification_sample_date')}</Text>
            </View>
            <Text className="font-inter-semibold text-[30px] text-[#444343] dark:text-[#f2f2f2] text-center w-[250px]">{t('stay_informed')}</Text>
            <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5] text-center w-[250px] mt-4">{t('notifications_subtitle')}</Text>
          </View>
          <View className="justify-center items-center pb-4 w-full px-3 ">
                <TouchableOpacity
                onPress={allowPressed}
                disabled={isUpdating}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">{t('allow')}</Text>
                </TouchableOpacity>
            </View>
          
          
        </View>
      </View>
    );
}