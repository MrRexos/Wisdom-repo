
import React, { useEffect, useState, useCallback } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, MapPinIcon} from 'react-native-heroicons/outline';
import { Search} from "react-native-feather";
import {debounce} from "lodash";

export default function SearchDirectionScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e ' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [direction, setDirection] = useState('');
  

  

  const handleClearText = () => {
    setDirection('');
  };

  const handleSearch = value => {
    console.log(direction);
  }

  const inputChanged = (text) => {
    setDirection(text);
    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])
  };

  


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <View className="px-5 pt-4 flex-1">

        <View className="flex-row justify-start items-center">

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6"/>
            </TouchableOpacity>

            <View className="h-[55] ml-4 px-3 flex-1 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                
                <Search height={20} color={iconColor} strokeWidth="1.7"/>
                <TextInput 
                placeholder='Search a direction...' 
                autoFocus={true} 
                selectionColor={cursorColorChange} 
                placeholderTextColor={placeHolderTextColorChange} 
                onChange = {inputChanged} 
                value={direction}
                onSubmitEditing={null}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}             
                className="flex-1 px-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]"/>

                <TouchableOpacity onPress={handleClearText}>
                    <View className='h-[25] w-[25] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                        <XMarkIcon height={17} color={iconColor} strokeWidth="1.7"/>
                    </View>
                </TouchableOpacity>

            </View>  
        </View>

        {direction.length<1 ? (
            <View className="mt-5 flex-row justify-between items-center">
                <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Recent searches</Text>
                <View className="px-3 py-2 rounded-full justify-center items-center bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                    <Text className="font-inter-semibold text-[10px] text-[#706f6e] dark:text-[#b6b5b5]">CLEAR</Text>
                </View>
            </View>
        ) : null }



      </View>
    </SafeAreaView>
  );
}