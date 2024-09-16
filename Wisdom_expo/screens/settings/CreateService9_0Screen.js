import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';


export default function CreateService9_0Screen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages} = route.params;
  const [typeSelected, setTypeSelected] = useState(0);
  const [priceType, setPriceType] = useState('hour');

  const options  = [
    {
        label: 'Price per hour',
        type: 'hour',
        description: 'The service is charged on an hourly basis',
    },
    {
        label: 'Price according to budget',
        type: 'budget',
        description: "The price will be determined according to the professional's budget",
    },
    {
        label: 'Fixed price',
        type: 'fix',
        description: 'A single, non-negotiable price for the entire service',
    },
  ]
  

  const inputChanged = (text) => {
    setTitle(text);
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        
        <View className="flex-1 px-6 pt-5 pb-6">

            <TouchableOpacity onPress={() => navigation.pop(9)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-center ">
              <Text className="mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">Price type</Text>
            </View>

            <View className="flex-1 px-5 pt-[80] justify-start items-start">

                {options.map(({label, type, description}, index) => {
                    const isActive = typeSelected === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {setTypeSelected(index); ; setPriceType(type)}}
                            className={isActive? `mb-5 p-5 w-full justify-start items-start rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-5 p-5 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                            >
                            <View className="flex-row w-full items-center">
                                <View className="mr-5 p-[3] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
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
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
              disabled={!family && !category}
              onPress={() => {priceType==='budget'? navigation.navigate('CreateService10', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType}) : navigation.navigate('CreateService9', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType})}}
              style={{opacity: family && category? 1.0: 0.5}}
              className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
              </TouchableOpacity>

            </View>
        </View>
    </SafeAreaView>
  ); 
}
