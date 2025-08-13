import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronLeftIcon} from 'react-native-heroicons/outline';



export default function CreateService12Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const route = useRoute();
  const {
    title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate,
    experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia, allowAsk
  } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
                </View> 
            </TouchableOpacity>
            <View className="flex-1 justify-center items-start  ">
              <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">{t('remember')}</Text>
              <Text className="font-inter-bold text-[24px] text-[#b6b5b5] dark:text-[#706f6e]">{t('communications_warning')}</Text>
            </View>
            <View className="justify-center items-center">
                <Text className="pb-5">
                      <Text onPress={() => navigation.navigate('Terms')} className="text-[11px] font-inter-medium text-[#b6b5b5] dark:text-[#706f6e] text-center underline">{t('terms')}</Text>
                      <Text className="text-[11px] font-inter-medium text-[#b6b5b5] dark:text-[#706f6e] text-center"> and </Text>
                      <Text onPress={() => navigation.navigate('PrivacyPolicy')} className="text-[11px] font-inter-medium text-[#b6b5b5] dark:text-[#706f6e] text-center underline">{t('policies')}</Text>
                </Text>
                <TouchableOpacity 
                disabled={false}
onPress={() => navigation.navigate('CreateServiceReview', { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia, allowAsk})}
                style={{opacity: 1}}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('accept_wisdom_terms')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}