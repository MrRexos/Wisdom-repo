
import React from 'react';
import {View, StatusBar,SafeAreaView, Platform, Text, TouchableOpacity, ScrollView} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import WisdomLogo from '../assets/wisdomLogo.tsx'
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';
import NotificationAskWhite from '../assets/NotificationAskWhite.svg';
import NotificationAskDark from '../assets/NotificationAskDark.svg';



export default function NotificationAllowScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';

    
  
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
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
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
              <Text className="pt-[60] absolute font-inter-bold text-[17px] text-[#444343] dark:text-[#f2f2f2] text-cente">Saturday, April 21</Text>
            </View>
            <Text className="font-inter-semibold text-[30px] text-[#444343] dark:text-[#f2f2f2] text-center w-[250]">Stay informed</Text>
            <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5] text-center w-[250] mt-4">Receive information and reminders of your services</Text>
          </View>
          <View className="justify-center items-center pb-4">
                <TouchableOpacity 
                onPress={() => navigation.navigate('Home')}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-[320] h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">Allow</Text>
                </TouchableOpacity>
            </View>
          
          
        </View>
      </SafeAreaView>
    );
}