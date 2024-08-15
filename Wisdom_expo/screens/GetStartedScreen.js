
import React from 'react';
import {View, StatusBar,SafeAreaView, Platform,Text, TouchableOpacity} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import WisdomLogo from '../assets/wisdomLogo.svg'
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';


export default function GetStartedScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
  
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-neutral-700 justify-between'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          <View>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                  <View className="flex-row justify-end pt-5 pr-6 opacity-50">
                      <XMarkIcon size={30} color="#f2f2f2" strokeWidth="1.7" />
                  </View> 
              </TouchableOpacity>
              <View className="items-center pt-3 ">
                  <WisdomLogo width={70} height={40} className='fill-black'/>
              </View> 
          </View>
          <View className="justify-center items-center">
              <TouchableOpacity className="bg-[#f2f2f2] w-[320] h-[55] rounded-full items-center justify-center" onPress={() => navigation.navigate('LogOption')}>
                  <Text className="font-inter-semibold text-[15px]text-[#444343] ">{t('get_started')}</Text>
              </TouchableOpacity>
              <View className="w-[250]">
                  <Text className="pt-3 pb-5">
                      <Text className="text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center">By tapping on "Get Started", you agree to our </Text>
                      <Text onPress={() => navigation.navigate('Terms')} className="text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center underline">Terms</Text>
                      <Text className="text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center"> and </Text>
                      <Text onPress={() => navigation.navigate('PrivacyPolicy')} className="text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center underline">Privacy Policy.</Text>
                  </Text>
              </View>
          </View>
      </SafeAreaView>
    );
}
