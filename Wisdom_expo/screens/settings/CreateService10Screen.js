import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';


export default function CreateService10Screen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, finalPrice} = route.params;
  const [typeSelected, setTypeSelected] = useState(1);
  const [allowDiscounts, setAllowDiscounts] = useState(true);
  const [discountRate, setDiscountRate] = useState(10);
  const [discountRateText, setDiscountRateText] = useState('10');


  const options  = [
    {
        label: t('dont_add_discounts'),
        value: false,
    },
    {
        label: t('add_discounts_for_recurrent_bookings'),
        value: true,
    },
  ]
  

  const inputChanged = (text) => {
    setDiscountRateText(text);
    setDiscountRate(parseInt(text));
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        
        <View className="flex-1 px-6 pt-5 pb-6">

            <TouchableOpacity onPress={() => navigation.pop(11)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-center ">
              <Text className="mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('allow_discounts')}</Text>
            </View>

            <View className="flex-1 px-5 pt-[80] justify-start items-start">

                {options.map(({label, value}, index) => {
                    const isActive = typeSelected === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {setTypeSelected(index); setAllowDiscounts(value)}}
                            className={isActive? `mb-5 p-5 pr-7 w-full justify-start items-start rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-5 p-5 pr-7 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                            >
                            <View className="flex-row w-full items-center">
                                <View className="mr-5 p-[3] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                                    {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]"/>)}
                                </View>
                                <Text className={isActive? `font-inter-medium text-[14px] text-[#515150] dark:text-[#d4d4d3]`: `font-inter-medium text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{label}</Text>
                            </View>

                            {index===1 && (
                              <View className="ml-10 mt-3 flex-row">
                                <Text className={isActive? `font-inter-bold text-[14px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>-</Text>
                                <TextInput
                                  placeholder="X"
                                  selectionColor={cursorColorChange}
                                  placeholderTextColor={placeholderTextColorChange}
                                  onChangeText={inputChanged}
                                  editable={false}
                                  value={discountRateText}
                                  keyboardType="numeric"
                                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                                  className={isActive? `font-inter-bold text-[14px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}
                                />
                                <Text className={isActive? `font-inter-bold text-[14px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>%</Text>
                                <Text numberOfLines={1} className={isActive? `font-inter-medium flex-1 text-[14px] text-[#979797] `: `font-inter-medium flex-1 text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{'.'.repeat(80)}</Text>
                                <Text className={isActive? `font-inter-semibold text-[14px] text-[#979797] `: `font-inter-semibold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{finalPrice? finalPrice-(finalPrice*0.1).toFixed(1): 'X'} €</Text>
                              </View>
                            )}
                             
                        </TouchableOpacity>
                    );
                })}

            </View>

            <View className="flex-row justify-center items-center">
              
              <TouchableOpacity 
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
              disabled={false}
              onPress={() => {navigation.navigate('CreateService11_0', { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate})}}
              style={{opacity: 1}}
              className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>

            </View>
        </View>
    </SafeAreaView>
  ); 
}