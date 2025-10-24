import React, { useEffect, useState } from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';


export default function CreateServicePriceTypeScreen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages} = prevParams;
  const [typeSelected, setTypeSelected] = useState(prevParams.priceType === 'budget' ? 1 : prevParams.priceType === 'fix' ? 2 : 0);
  const [priceType, setPriceType] = useState(prevParams.priceType || 'hour');

  const {
    isEditing,
    hasChanges,
    saving,
    requestBack,
    handleSave,
    confirmVisible,
    handleConfirmSave,
    handleDiscardChanges,
    handleDismissConfirm,
  } = useServiceFormEditing({ prevParams, currentValues: { priceType }, t });

  const options  = [
    {
        label: t('price_per_hour'),
        type: 'hour',
        description: t('service_charged_hourly'),
    },
    {
        label: t('price_according_to_budget'),
        type: 'budget',
        description: t('price_by_professional_budget'),
    },
    {
        label: t('fixed_price'),
        type: 'fix',
        description: t('non_negotiable_price'),
    },
  ]
  

  const inputChanged = (text) => {
    setTitle(text);
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        
        <View className="flex-1 px-6 pt-5 pb-6">

            <ServiceFormHeader
              onBack={requestBack}
              onSave={handleSave}
              showSave={isEditing && hasChanges}
              saving={saving}
            />

            <View className=" justify-center items-center ">
              <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('price_type')}</Text>
            </View>

            <View className="flex-1 px-5 pt-[80px] justify-start items-start">

                {options.map(({label, type, description}, index) => {
                    const isActive = typeSelected === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {setTypeSelected(index); ; setPriceType(type)}}
                            className={isActive? `mb-5 p-5 w-full justify-start items-start rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-5 p-5 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                            >
                            <View className="flex-row w-full items-center">
                                <View className="mr-5 p-[3px] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                                    {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]"/>)}
                                </View>
                                <Text className={isActive? `font-inter-medium text-[14px] text-center text-[#515150] dark:text-[#d4d4d3]`: `font-inter-medium text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]`}>{label}</Text>
                            </View>
                            <Text className={isActive? `ml-10 mt-1 font-inter-medium text-[14px]  text-[#979797]`: `ml-10 mt-1 font-inter-medium text-[14px] text-[#d4d4d3] dark:text-[#474646]`}>{description}</Text>
                        </TouchableOpacity>
                    );
                })}

            </View>

            <View className="flex-row justify-center items-center">
              
              <TouchableOpacity
              disabled={false}
              onPress={() => navigation.navigate('CreateServiceImages', { prevParams: { ...prevParams, priceType } })}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>

            <TouchableOpacity
              disabled={false}
onPress={() => {priceType==='budget'? navigation.navigate('CreateServiceDiscounts', { prevParams: { ...prevParams, priceType } }) : navigation.navigate('CreateServicePrice', { prevParams: { ...prevParams, priceType } })}}
              style={{opacity: 1}}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>

            </View>
        </View>
        <ServiceFormUnsavedModal
          visible={confirmVisible}
          onSave={handleConfirmSave}
          onDiscard={handleDiscardChanges}
          onDismiss={handleDismissConfirm}
        />
    </SafeAreaView>
  );
}
