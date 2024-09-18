import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronLeftIcon} from 'react-native-heroicons/outline';



export default function CreateService13Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const route = useRoute();
  const {
    title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate,
    experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia
  } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth="2" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-start ml-2 ">
                <Text className="mt-[55] font-inter-bold text-[28px] text-[#444343] dark:text-[#f2f2f2] ">Check your service</Text>
            </View>

            <View className="flex-1">

            </View>

            <View className="justify-center items-center">
                <TouchableOpacity 
                disabled={false}
                onPress={() => navigation.navigate('CreateService13', { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia})}
                style={{
                  opacity: 1,
                  shadowColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, 
                  shadowRadius: 10,
                  elevation: 10,
                }}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Publish service</Text>
                </TouchableOpacity>
            </View>

        </View>
    </SafeAreaView>
  );
}