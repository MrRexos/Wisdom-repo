
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import MapView, { Marker, Circle } from 'react-native-maps';
import axios from 'axios';


export default function EditAccountScreen() {
  
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
  const currentLanguage = i18n.language;
  const [user, setUser] = useState();
  const [moneyWallet, setMoneyWallet] = useState([]);

  const getUserData = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUser(user);
  };

  useEffect(() => {
    getUserData();
  }, []);



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      
      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[95] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>
            <View className="flex-1 justify-center items-center ">
                <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">Account</Text>
            </View>
            
            <View className="flex-1"></View>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-[75] gap-y-9">
        
        
        <View className="h-10"></View>
      </ScrollView>
      
    </SafeAreaView>
  );
}
