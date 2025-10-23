
import React, { useEffect, useState, useCallback, useRef, useMemo} from 'react'
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


export default function ExpertPlansScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
  const [planType, setPlanType] = useState('yearly');
  const [typeSelected, setTypeSelected] = useState(0);

  const options = useMemo(() => ([
    { label: t('expert_plan_option_yearly'), value: 'yearly', price: t('expert_plan_yearly_price') },
    { label: t('expert_plan_option_monthly'), value: 'monthly', price: t('expert_plan_monthly_price') },
  ]), [t]);

  const getNextBillingDate = () => {
    const currentDate = new Date();
    if (planType === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="flex-1">

        <View className="mt-4 px-3 flex-row justify-between items-center ">
            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>
            <View className="flex-1 justify-center items-center ">
                <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('overview')}</Text>
            </View>
            <View className="flex-1"></View>
        </View>

        <View className="mt-1 w-full justify-center items-center ">
            <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">{t('confirm_your_expert_plan')}</Text>
        </View>

        <View className="flex-1 px-10 pt-[80px] justify-start items-start">


            {options.map(({label, value, price}, index) => {
                const isActive = typeSelected === index;
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {setTypeSelected(index); setPlanType(value)}}
                        className={isActive? `mb-3 p-4 pr-7 w-full justify-start items-start rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-3 p-4 pr-7 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                        >
                        { value === 'yearly' && (
                            <View 
                                style={{ position: 'absolute', top: -15, left: '46%'}}
                                className="bg-[#74a450] rounded-full p-[7px]"
                            >
                                <Text className="font-inter-medium text-[11px] text-[#d4d4d3]">{t('save_25_percent')}</Text>
                            </View>
                        )}
                        <View className="flex-row w-full justify-between items-center">
                            <View className="flex-row  items-center">
                                <View className="mr-5 p-[3px] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                                    {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]"/>)}
                                </View>
                                <Text className={isActive? `font-inter-medium text-[14px] text-[#515150] dark:text-[#d4d4d3]`: `font-inter-medium text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{label}</Text>
                            </View>
                            <Text className={isActive? `font-inter-medium text-[14px] text-[#515150] dark:text-[#d4d4d3]`: `font-inter-medium text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{price}</Text>
                        </View>
                        
                    </TouchableOpacity>
                );
            })}


            {planType==='yearly'? (

                <View className="justify-center items-start w-full">

                    <View className="mt-8 flex-row">
                        <Text className="font-inter-medium  text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('subtotal')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{t('expert_plan_yearly_subtotal_amount')}</Text>
                    </View>

                    <View className="mt-6 flex-row">
                        <Text className="font-inter-medium  text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('savings')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="text-[14px] font-inter-semibold text-[#74a450]">{t('expert_plan_yearly_savings_amount')}</Text>
                    </View>


                    <View className="mt-6 mb-6 flex-row">
                        <Text className="font-inter-medium  text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('total')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{t('expert_plan_yearly_total_amount')}</Text>
                    </View>

                </View>

            ) : (

                <View className="justify-center items-start w-full">

                    <View className="mt-8 flex-row">
                        <Text className="font-inter-medium  text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('subtotal')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{t('expert_plan_monthly_subtotal_amount')}</Text>
                    </View>

                    <View className="mt-6 flex-row">
                        <Text className="font-inter-medium  text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('total')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="text-[14px] font-inter-semibold text-[#323131] dark:text-[#fcfcfc]">{t('expert_plan_monthly_total_amount')}</Text>
                    </View>

                </View>
            )}

        </View>

        <View className="mb-3 justify-center items-center">
            <TouchableOpacity onPress={() => navigation.pop(2)} className="bg-[#323131] dark:bg-[#fcfcfc] w-[320px] h-[55px] rounded-full items-center justify-center" >
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue_to_payment')}</Text>
            </TouchableOpacity>
            <View >
             <Text className="mt-4 text-[12px] font-inter-medium text-[#979797]/50 text-center">{t('your_next_bill_will_be_on')} {getNextBillingDate()}</Text>
            </View>    
        </View>

        


        

      </View>
    </SafeAreaView>
  );
}