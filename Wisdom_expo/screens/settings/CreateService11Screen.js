import React, { useEffect, useState, useRef } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';
import { Edit3 } from 'react-native-feather';


export default function CreateService11Screen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowAsk} = route.params;
  const [typeSelected, setTypeSelected] = useState(1);
  const [allowConsults, setAllowConsults] = useState(true);
  const [consultPriceText, setConsultPriceText] = useState('5');
  const [consultPrice, setConsultPrice] = useState(5);
  const [consultVia, setConsultVia] = useState('');
  const inputRef = useRef(null);
  


  const options  = [
    {
        label: t('dont_allow_consults'),
        value: false,
    },
    {
        label: t('allow_consults'),
        value: true,
    },
  ]
  

  const inputPriceChanged = (text) => {
    setConsultPriceText(text);
    setConsultPrice(parseInt(text));
  };

  const inputViaChanged = (text) => {
    setConsultVia(text);
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          
          <View className="flex-1 px-6 pt-5 pb-6">

              <TouchableOpacity onPress={() => navigation.pop(13)}>
                  <View className="flex-row justify-start">
                      <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                  </View> 
              </TouchableOpacity>

              <View className=" justify-center items-center ">
                <Text className="mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('allow_consults')}</Text>
                <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('allows_clients_to_book_personalized_consultations')}</Text>
              </View>

              <View className="flex-1 px-5 pt-[80] justify-start items-start">

                  {options.map(({label, value}, index) => {
                      const isActive = typeSelected === index;
                      return (
                          <TouchableOpacity
                              key={index}
                              onPress={() => {setTypeSelected(index); setAllowConsults(value)}}
                              className={isActive? `mb-5 p-5 pr-7 w-full justify-start items-start rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-5 p-5 pr-7 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                              >
                              <View className="flex-row w-full items-center">
                                  <View className="mr-5 p-[3] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                                      {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]"/>)}
                                  </View>
                                  <Text className={isActive? `font-inter-medium text-[14px] text-[#515150] dark:text-[#d4d4d3]`: `font-inter-medium text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{label}</Text>
                              </View>

                              {index===1 && (

                                <View className="justify-center items-center w-full">

                                  <TouchableOpacity disabled={typeSelected!==1} onPress={() => inputRef.current?.focus()} className="justify-center items-center w-full">
                                    <View className="ml-10 mt-3 flex-row items-end">

                                      <TextInput
                                        placeholder="X"
                                        selectionColor={cursorColorChange}
                                        placeholderTextColor={placeholderTextColorChange}
                                        onChangeText={inputPriceChanged}
                                        value={consultPriceText}
                                        ref={inputRef}
                                        keyboardType="number-pad"
                                        keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                                        className={isActive? `font-inter-bold text-[16px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[16px]  text-[#b6b5b5] dark:text-[#706f6e]`}
                                      />

                                      <Text className={isActive? `font-inter-bold text-[16px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[16px]  text-[#b6b5b5] dark:text-[#706f6e]`}> €/15 mins</Text>
                                      
                                      {typeSelected===1 && (
                                        <TouchableOpacity onPress={() => inputRef.current?.focus()} className="ml-1">
                                          <Edit3 width={20} height={18}  color={'#706F6E'} strokeWidth="1.9" />
                                        </TouchableOpacity>
                                      )}

                                    </View>
                                  </TouchableOpacity>

                                  {typeSelected===1 && (
                                    <View className="justify-center items-start w-full mt-2">
                                      
                                      <Text className={isActive? `font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]`: `font-inter-semibold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{t('via')}</Text>
                                      
                                      <View className="rounded-full w-full mt-3  px-4 bg-[#fcfcfc] dark:bg-[#323131]">
                                        <TextInput
                                          placeholder={t('example_zoom_meet_in_person')}
                                          selectionColor={cursorColorChange}
                                          placeholderTextColor={placeholderTextColorChange}
                                          onChangeText={inputViaChanged}
                                          value={consultVia}
                                          keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                                          className={isActive? `font-inter-medium py-3 text-[12px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[16px]  text-[#b6b5b5] dark:text-[#706f6e]`}
                                        />

                                      </View>
                                    </View>
                                  )}
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
                disabled={allowConsults? consultVia.length<1 || !consultPrice? true : false: false}
                onPress={() => {navigation.navigate('CreateService12', { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia, allowAsk})}}
                style={{opacity: allowConsults? consultVia.length<1 || !consultPrice? 0.5 : 1: 1}}
                className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
                </TouchableOpacity>

              </View>
          </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  ); 
}