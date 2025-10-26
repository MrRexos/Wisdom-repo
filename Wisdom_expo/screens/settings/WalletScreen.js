
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image, RefreshControl} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Check } from "react-native-feather";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';



export default function WalletScreen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
  const currentLanguage = i18n.language;
  const [userId, setUserId] = useState();
  const [moneyWallet, setMoneyWallet] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const Sections = [
    {
      items: [
        {id: 'bookings', label: t('bookings'), type: 'select', link: 'Services'},
        //{id: 'paymentMethod', label: t('payment_methods'), type: 'select', link: ''},
      ]
    },
  ];

  const fetchMoneyWallet = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/wallet`);
      return response.data.money_in_wallet;
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  useEffect(() => {
    const loadMoney = async () => {
      const money = await fetchMoneyWallet
      (); 
      setMoneyWallet(money);
    };
    loadMoney();
  }, []);

  useRefreshOnFocus(fetchMoneyWallet);

  const onRefresh = async () => {
    setRefreshing(true);
    const money = await fetchMoneyWallet();
    setMoneyWallet(money);
    setRefreshing(false);
  };



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      
      <View className="pt-6 bg-[#f2f2f2] dark:bg-[#272626] w-full  justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
            <View className="basis-1/4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>
            <View className="basis-1/2 justify-center items-center ">
                <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('payments_and_refunds')}</Text>
            </View>
            
            <View className="basis-1/4 h-1">
            <View className="w-12" />
            </View>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-9" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      <View className='gap-y-9'>
        <View className="p-7 justify-center items-center rounded-3xl bg-[#fcfcfc]  dark:bg-[#323131]">
          <Text className="mb-4 font-inter-semibold text-[16px] text-[#B6B5B5] dark:text-[#706f6e]">{t('money_in_wallet')}</Text>
          <Text className="font-inter-bold text-[40px] text-[#444343] dark:text-[#f2f2f2]">{moneyWallet? moneyWallet : '0.00'} €</Text>
        </View>
        
        {Sections.map(({items}, sectionIndex) => (
          <View key={sectionIndex} style={{borderRadius: 12, overflow: 'hidden'}}>
            {items.map(({label, id, type, link}, index) => (
              <View key={id} className="pl-5  bg-[#fcfcfc]  dark:bg-[#323131]" >
                <TouchableOpacity onPress={() => {['select', 'link'].includes(type) && navigation.navigate(link)}} >
                  <View className=" flex-row items-center justify-start ">
                    <View className="h-[45px] flex-1 flex-row items-center justify-start pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{borderTopWidth: 1}, index===0 && {borderTopWidth: 0 }]}>                   
                      <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                      <View className="flex-1"/>

                      {['select', 'link'].includes(type) &&(
                        <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme=='dark'? '#706f6e': '#b6b5b5'}/>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>        
              </View>
            ))}
          </View>
        ))}
        </View>
        <View className="h-10"></View>
      </ScrollView>
      
    </SafeAreaView>
  );
}