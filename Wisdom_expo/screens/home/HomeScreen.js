
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import {Search} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';


export default function HomeScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  suggestions  = [
    {
      label: 'All',
      categoryID:null,
    },
    {
      label: 'Home Cleaner',
      categoryID:1,
    },
    {
      label: 'AI Developer',
      categoryID:89,
    },
    {
      label: 'Plumber',
      categoryID:2,
    },
    {
      label: 'Personal Trainer',
      categoryID:31,
    },
    {
      label: 'Auditor',
      categoryID:225,
    },
    {
      label: '3D Designer',
      categoryID:100,
    },
    {
      label: 'Wedding Planner',
      categoryID:172,
    },
    {
      label: 'Web Developer',
      categoryID:84,
    },
    {
      label: 'Graphic Designer',
      categoryID:330,
    },
    {
      label: 'In-home Pet Care Provider',
      categoryID:320,
    },

  ]


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="px-6 pt-8 pb-3">

        <View className="justify-center items-center px-4">
          <View className="h-[55] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            
            <Search height={17} color={iconColor} strokeWidth="2"/>
            <Text className="ml-2 font-inter-medium text-[14px] text-[#979797]">Search a service...</Text>
            {suggestions.map((item, index) => (
              <View key={index} className="pl-5" >
                <Text>{item.label}</Text>
              </View>
            ))}

          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
}