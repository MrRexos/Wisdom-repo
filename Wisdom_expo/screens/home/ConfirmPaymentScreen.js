
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Play} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios'; 
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ConfirmPaymentScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <View className="flex-1 justify-start items-center">

        <View className="w-full items-end px-6 mt-2">
          <TouchableOpacity onPress={() => navigation.navigate('Home')} className="ml-3">
              <XMarkIcon height={24} width={24} strokeWidth={1.8} color={iconColor}/>  
          </TouchableOpacity> 
        </View>

        <View className="flex-1 justify-center items-center">

          <CheckCircleIcon height={130} width={130} strokeWidth={1.5} color={iconColor}/>

          <View className="mt-10 w-[300] justify-center items-center">
            <Text className="font-inter-bold text-center text-[25px] text-[#444343] dark:text-[#f2f2f2]">{t('booking_successfully_completed')}</Text>
          </View>  


        </View>



      </View>


    </SafeAreaView>
  );
}