
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Check } from "react-native-feather";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TurnExpertScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="flex-1 justify-start items-center">

       

        <View className="flex-1 w-full justify-center items-start">

          <View className="pb-[80px] w-full justify-center items-center ">
            <WisdomLogo width={90} height={90} color={iconColor}/>
            <View className="px-4 py-2 rounded-full bg-[#fcfcfc] dark:bg-[#323131]">
              <Text className="font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('expert_label')}</Text>
            </View>
          </View>

          <View className="mx-8 flex-row justify-center">
            <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{t('whats_included')}</Text>
            <Text numberOfLines={1} className="flex-1 font-inter-medium  text-[14px] text-[#979797]">{'-'.repeat(25)}</Text>
          </View>

          <View className="mt-8 mx-10 flex-row justify-start items-center">
            <View className="p-1 rounded-full bg-[#444343] dark:bg-[#f2f2f2] justify-center items-center">
              <Check width={15} height={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#272626': '#f2f2f2'}/>
            </View>
            <Text className="ml-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('expert_benefit_discount')}</Text>
          </View>

          <View className="mt-5 mx-10 flex-row justify-start items-center">
            <View className="p-1 rounded-full bg-[#444343] dark:bg-[#f2f2f2] justify-center items-center">
              <Check width={15} height={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#272626': '#f2f2f2'}/>
            </View>
            <Text className="ml-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('expert_benefit_unlimited')}</Text>
          </View>

          <View className="mt-5 mx-10 flex-row justify-start items-center">
            <View className="p-1 rounded-full bg-[#444343] dark:bg-[#f2f2f2] justify-center items-center">
              <Check width={15} height={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#272626': '#f2f2f2'}/>
            </View>
            <Text className="ml-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('expert_benefit_visibility')}</Text>
          </View>

          <View className="mt-5 mx-10 flex-row justify-start items-center">
            <View className="p-1 rounded-full bg-[#444343] dark:bg-[#f2f2f2] justify-center items-center">
              <Check width={15} height={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#272626': '#f2f2f2'}/>
            </View>
            <Text className="ml-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('expert_benefit_quality_seal')}</Text>
          </View>

          <View className="mt-5 mx-10 flex-row justify-start items-center">
            <View className="p-1 rounded-full bg-[#444343] dark:bg-[#f2f2f2] justify-center items-center">
              <Check width={15} height={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#272626': '#f2f2f2'}/>
            </View>
            <Text className="ml-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('expert_benefit_bonus')}</Text>
          </View>

        </View>

        <View className="mb-3 justify-center items-center">
            <TouchableOpacity 
              onPress={() => navigation.navigate('ExpertPlans')} 
              className="bg-[#323131] dark:bg-[#fcfcfc] w-[320px] h-[55px] rounded-full items-center justify-center" 
              style={{
                opacity: 1,
                shadowColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6, 
                shadowRadius: 10,
                elevation: 10,
              }} >
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('explore_plans')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()}>
             <Text className="mt-4 text-[13px] font-inter-semibold text-[#979797] text-center">{t('cancel')}</Text>
            </TouchableOpacity>    
        </View>
        
      </View>
    </SafeAreaView>
  );
}