import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';



export default function CreateService12Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.pop(12)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>
            <View className="flex-1 justify-center items-start  ">
              <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">Remember</Text>
              <Text className="font-inter- bold text-[24px] text-[#b6b5b5] dark:text-[#706f6e]">all communications and payments must be made through the application, otherwise, you will get strikes that can lead to account suspension and legal violations.</Text>
            </View>
            <View className="justify-center items-center">
                <Text className="pb-5">
                      <Text onPress={() => navigation.navigate('Terms')} className="text-[11px] font-inter-medium text-[#b6b5b5] dark:text-[#706f6e] text-center underline">Terms</Text>
                      <Text className="text-[11px] font-inter-medium text-[#b6b5b5] dark:text-[#706f6e] text-center"> and </Text>
                      <Text onPress={() => navigation.navigate('PrivacyPolicy')} className="text-[11px] font-inter-medium text-[#b6b5b5] dark:text-[#706f6e] text-center underline">Policies</Text>
                </Text>
                <TouchableOpacity 
                disabled={false}
                onPress={() => navigation.navigate('CreateService13')}
                style={{opacity: 1}}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[50] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Accept Wisdom terms</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}