

import React from 'react';
import {View, StatusBar, SafeAreaView, Platform, Text, TouchableOpacity, Linking} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import WisdomLogo from '../assets/wisdomLogo.tsx'


export default function EmailSendedScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';

    const openMailApp = () => {
        const mailtoUrl = 'mailto:wisdom.helpcontact@gmail.com';
        Linking.openURL(mailtoUrl).catch((err) => {
          console.error('Failed to open mail app:', err);
        });
    };

    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          <View className="px-5 py-3  w-full">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6" />
                </TouchableOpacity>
              </View>
              <View className="items-center pt-3">
                <WisdomLogo color = {colorScheme === 'dark' ? '#f2f2f2' : '#444343'} width={55} height={30} />
              </View>
              <View className="flex-1">
              </View>
            </View>

            <Text className="font-inter-bold text-xl pt-4 text-center text-[#444343] dark:text-[#f2f2f2]">
                Check your Inbox
            </Text>
            <View className="justify-center items-center px-8">
              <Text className="font-inter-medium text-[13px] text-center pt-3 text-[#B6B5B5] dark:text-[#706F6E]">
                We sent an email to xxx so you can pick a new password.
              </Text>
            </View>
            
          </View>
          <View>
            <View className="justify-center items-center ">
                <TouchableOpacity 
                onPress={() => navigation.navigate('NewPassword')}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-[320] h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">Open Mail</Text>
                </TouchableOpacity>
            </View>     
            <Text className="font-inter-medium text-center text-[12px] pt-4 pb-6 text-[#444343] dark:text-[#f2f2f2]">
              <Text>Need help? </Text>
              <Text onPress={openMailApp} className="text-[#444343] dark:text-[#f2f2f2] opacity-60 text-center underline">Contact support</Text>
            </Text>
          </View>
      </SafeAreaView>
    );
}