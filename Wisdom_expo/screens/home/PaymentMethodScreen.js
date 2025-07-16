
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Plus, Info, Phone, FileText, Flag, X, Check, Calendar as CalendarIcon, Edit3, Clock, MapPin, Edit2, AlertCircle, AlertTriangle, CreditCard} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios'; 
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function PaymentMethodScreen() {
  
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvv, setCvv] = useState('');
  const isFocused = useIsFocused();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';


  const formatCardNumber = (number) => {
    // Elimina todos los espacios y no dígitos
    const cleaned = number.replace(/\D/g, '');

    // Divide en grupos de 4 dígitos
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';

    // Limitar a 19 caracteres (16 dígitos + 3 espacios)
    return formatted.substring(0, 19);
  };

  const inputCardNumberChanged = (text) => {
    const formattedText = formatCardNumber(text);
    setCardNumber(formattedText);
  };

  const formatExpirationDate = (text) => {
    // Elimina caracteres que no sean dígitos
    const cleaned = text.replace(/\D/g, '');

    // Limitar a 4 dígitos para MMYY
    const formatted = cleaned.substring(0, 4);

    // Formatear como MM/YY
    if (formatted.length >= 3) {
      return `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`;
    } else {
      return formatted;
    }
  };

  const inputExpirationChanged = (text) => {
    const formattedText = formatExpirationDate(text);
    setExpiration(formattedText);
  };

  const inputCvvChanged = (text) => {
    setCvv(text);
  };

  const handleDone = async () => {
    
    const paymentMethod = {cardNumber, expiration, cvv}
    await storeDataLocally('paymentMethod', JSON.stringify(paymentMethod));
    navigation.goBack();

  };



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[100px] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center mt-8 pb-4 px-2 ">

            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()} className="ml-3">
                    <ChevronLeftIcon size={24} strokeWidth={1.8} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>

            <View className="flex-3 justify-center items-center ">
                <Text className="font-inter-bold text-center text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('payment_method')}</Text>
            </View> 

            <View className="flex-1 h-2 "></View>

        </View>
      </View>

      <View className="h-[70px] w-full justify-end"/>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="mt-8 flex-1 justify-between items-center">

          <View className="flex-1 w-full px-4 justify-start items-start ">

            <Text className="pb-2 font-inter-semibold text-[15px] text-[#515150] dark:text-[#d4d4d3]">{t('card_number')}</Text>
            <View className="mb-7 py-2 px-6 w-full h-[55px]  justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">      
              <TextInput
                placeholder='0000 0000 0000 0000'
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputCardNumberChanged} 
                value={cardNumber}
                keyboardType="number-pad"
                maxLength={19}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />            
            </View>

            <View className="flex-row justify-between gap-x-2 ">

              <View className="flex-1">
                <Text className="pb-2 font-inter-semibold text-[15px] text-[#515150] dark:text-[#d4d4d3]">{t('expiration_date')}</Text>
                <View className="w-full h-[55px]  mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">      
                  <TextInput
                    placeholder='MM/YY'
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeHolderTextColorChange}
                    onChangeText={inputExpirationChanged} 
                    value={expiration}
                    keyboardType="number-pad"
                    maxLength={5}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
                  />            
                </View>
              </View>

              <View className="flex-1">
                <Text className="pb-2 font-inter-semibold text-[15px] text-[#515150] dark:text-[#d4d4d3]">{t('cvv')}</Text>
                <View className="w-full h-[55px] mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">      
                  <TextInput
                    placeholder='123'
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeHolderTextColorChange}
                    onChangeText={inputCvvChanged} 
                    value={cvv}
                    keyboardType="number-pad"
                    maxLength={3}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
                  />            
                </View>
              </View>

            </View>
            
          </View>


          <View className="flex-row justify-center items-center pb-3 px-6">
            <TouchableOpacity
              onPress={() => handleDone() }
              style={{ opacity: 1 }}
              className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
            >
              <Text>
                <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                  {t('save')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}