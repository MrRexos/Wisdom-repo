import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';



export default function CreateService2Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [title, setTitle] = useState('');

  const inputChanged = (text) => {
    setTitle(text);
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.pop(2)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>
            <View className=" justify-center items-center">
              <Text className="mt-[55] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">What is the title of your service?</Text>
              <Text className="mt-5 font-inter-bold text-[16px] text-center text-[#b6b5b5] dark:text-[#706f6e]">This will be the public title</Text>
            </View>
            <View className="flex-1 px-4 pb-[60] justify-center items-center">
              <View className="w-full h-10 p-2 border-b-[1px] border-[#444343] dark:border-[#f2f2f2]">
                <TextInput
                placeholder='Service title...'
                selectionColor={cursorColorChange}
                placeholderTextColor={placeholderTextColorChange}
                onChangeText={inputChanged}
                value={title}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="h-[50] w-full flex-1 font-inter-medium text-[18px] text-[#515150] dark:text-[#d4d4d3]"
                />
              </View>
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
              disabled={title.length < 1}
              onPress={() => navigation.navigate('CreateService3', {title})}
              style={{opacity: title.length < 1 ? 0.5 : 1.0}}
              className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
              </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  ); 
}