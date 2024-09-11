import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';
import { Check } from "react-native-feather";



export default function CreateService5Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#b6b5b5' : '#706F6E';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title, family, category, description} = route.params;
  const [showLanguages, setShowLanguages] = useState(false);
  const [showAboutYou, setShowAboutYou] = useState(false);
  const [showTags, setShowTags] = useState(false); 
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const languages = [
    { id: 1, label: 'Català', abreviation: 'cat' },
    { id: 2, label: 'Castellà', abreviation: 'es' },
    { id: 3, label: 'Anglès', abreviation: 'en' },
    { id: 4, label: 'Francès', abreviation: 'fr' },
  ];

  const inputChanged = (text) => {
    setTitle(text);
  };

  const handleLanguagesPress = () => {
    setShowLanguages(!showLanguages);
  };

  const handleAboutYouPress = () => {
    setShowAboutYou(!showAboutYou);
  };

  const handleTagsPress = () => {
    setShowTags(!showTags);
  };

  const toggleLanguage = (abreviation) => {
    if (selectedLanguages.includes(abreviation)) {
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== abreviation));
    } else {
      setSelectedLanguages([...selectedLanguages, abreviation]);
    }
  };

  const isSelected = (id) => selectedLanguages.includes(id);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">

            <TouchableOpacity onPress={() => navigation.pop(5)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-start ">
              <Text className="pl-5 mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">Give some information</Text>
            </View>

            <View className="mt-[65] flex-1 pl-[40] pr-8 justify-start items-start">
              
              <View className="flex-row justify-between items-center ">
                <TouchableOpacity onPress={() => handleLanguagesPress()} className="w-full">
                  <Text className="font-inter-bold text-[24px] text-[#706f6e] dark:text-[#b6b5b5]">Languages</Text>
                </TouchableOpacity>
                {showLanguages? (                  
                  <ChevronUpIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                ): null }
              </View>
              {showLanguages? (
                  <View>                  
                    {languages.map((language) => (
                      <TouchableOpacity
                        key={language.id}                        
                        onPress={() => toggleLanguage(language.abreviation)}
                        className="flex-row w-full justify-between mt-5 ml-6"
                      >
                        <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5]">{language.label}</Text>
                        <View 
                        style={[styles.checkbox, 
                        {borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E'}, 
                        isSelected(language.id) && { backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', borderWidth:0 }]}>
                          {isSelected(language.id) && <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5}/>}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ): null }

              <View className="flex-row justify-between items-center mt-8">
                
                <TouchableOpacity onPress={() => handleAboutYouPress()} className="w-full">
                  <Text className=" font-inter-bold text-[24px] text-[#706f6e] dark:text-[#b6b5b5]">About you</Text>
                </TouchableOpacity> 
                <View className="justify-center items-center ">
                {showAboutYou? (
                  <ChevronUpIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                ): null }
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-8">
                <TouchableOpacity onPress={() => handleTagsPress()} className="w-full">
                  <Text className="font-inter-bold text-[24px] text-[#706f6e] dark:text-[#b6b5b5]">Tags</Text>    
                </TouchableOpacity> 
                {showTags? (
                  <ChevronUpIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                ): null }
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
              disabled={false}
              onPress={() => navigation.navigate('CreateService6', {title, family, category, description})}
              style={{opacity: 1.0}}
              className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
              </TouchableOpacity>

            </View>
        </View>
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:25,
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: '#444343',
  },
  checkboxTick: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
  },
});