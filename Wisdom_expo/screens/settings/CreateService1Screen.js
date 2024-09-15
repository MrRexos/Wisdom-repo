import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';



export default function CreateService1Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.pop(1)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>
            <View className="flex-1 justify-center items-start  ">
              <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">Create your service,</Text>
              <Text className="font-inter-bold text-[30px] text-[#b6b5b5] dark:text-[#706f6e]">tell the world what you do</Text>
            </View>
            <View className="justify-center items-center">
                <TouchableOpacity 
                disabled={false}
                onPress={() => navigation.navigate('CreateService2')}
                style={{opacity: 1}}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Start</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}