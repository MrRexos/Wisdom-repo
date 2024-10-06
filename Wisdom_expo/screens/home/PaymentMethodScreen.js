
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Plus, Info, Phone, FileText, Flag, X, Check, Calendar as CalendarIcon, Edit3, Clock, MapPin, Edit2, AlertCircle, AlertTriangle, CreditCard} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import MapView, { Marker, Circle } from 'react-native-maps';
import axios from 'axios'; 
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import { format } from 'date-fns';



export default function PaymentMethodScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [country, setCountry] = useState('');
  const [counstry, setCouwnwtry] = useState('');
  const [counstwry, setCounwtry] = useState('');

  const inputDescriptionChanged = (text) => {
    setDescription(text);
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[100] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center mt-8 pb-4 px-2 ">

            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()} className="ml-3">
                    <ChevronLeftIcon size={24} strokeWidth={1.8} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>

            <View className="flex-3 justify-center items-center ">
                <Text className="font-inter-bold text-center text-[18px] text-[#444343] dark:text-[#f2f2f2]">Payment Method</Text>
            </View> 

            <View className="flex-1 h-2 "></View>

        </View>
      </View>

      <View className="h-[70] w-full justify-end"/>

      <View className="flex-1 justify-start items-end">

        <View className="w-full h-[55] mx-2 mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
          {country && country.length>0? (
            <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">Country/region</Text>
          ) : null}              
          <TextInput
            placeholder='Country/region...'
            selectionColor={cursorColorChange}
            placeholderTextColor={placeHolderTextColorChange}
            onChangeText={inputCountryChanged} 
            value={country || ''}
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
          />            
        </View>

        
      </View>

    </SafeAreaView>
  );
}