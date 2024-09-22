
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart, Plus, Share} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';


export default function ServiceProfileScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {serviceId} = route.params;
  const [serviceData, setServiceData] = useState([]);
  const [isServiceAdded, setIsServiceAdded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getServiceInfo = async () => {
    try {
      const response = await api.get(`/api/service/${serviceId}`, {});
      let service = response.data;
      setServiceData(service);
     
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    //getServiceInfo(); 
    console.log('loaded') 
  }, []);



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-6 flex-1">

        {/* Top */}

        <View className="flex-row justify-between items-center">
          
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6"/>
          </TouchableOpacity>
          
          <View className="flex-row justify-end items-center">

            <TouchableOpacity onPress={() => null} className="items-center justify-center mr-6">
              <Share height={24} strokeWidth={1.7} color={iconColor}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => null} className="mr-2">
              {isServiceAdded? (
                <HeartFill height={24} width={24} strokeWidth={1.7} color={'#ff633e'} />
              ) : (
                <Heart height={24} width={24} strokeWidth={1.7} color={iconColor} />
              )}        
           </TouchableOpacity>

          </View>

        </View>

        {/* Service and User info */}

        <View className="justify-start items-center mt-10"> 

          <View className="h-[100] w-[100] bg-[#d4d4d3] dark:bg-[#474646] rounded-full"></View>

          <Text className="mt-3 font-inter-bold text-center text-[23px] text-[#444343] dark:text-[#f2f2f2]">Name Surname</Text>

          <Text className="mt-2 font-inter-medium text-center text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
            <Text>@name</Text>
            <Text> • </Text>
            <Text>Service</Text>
          </Text>

          {/* Service facts */}

          <View className="py-3 mt-7 mx-4 flex-row justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-3xl">

            <View className="flex-1 justify-center items-center border-r-[1px] border-[#d4d4d3] dark:border-[#474646]">
              <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">12</Text>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Services</Text>
            </View>

            <View className="flex-1 justify-center items-center ">
              <View className="flex-row justify-center items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1.3 }] }} />
                <Text className="ml-[6] font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">4,5</Text>
              </View>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Rating</Text>
            </View>

            <View className="flex-1 justify-center items-center border-l-[1px] border-[#d4d4d3] dark:border-[#474646]">
              <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">6</Text>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Repites</Text>
            </View>

          </View>

        </View>

        {/* Description */}

        <View className="mt-9 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">About the service</Text>

          <Text numberOfLines={isDescriptionExpanded ? null : 4} className="break-all text-[14px] text-[#515150] dark:text-[#d4d4d3]">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t empor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t empor incididunt ut labore et dolore magna aliqua</Text>
          
          {!isDescriptionExpanded && (
            <TouchableOpacity onPress={() => setIsDescriptionExpanded(true)}>
              <Text className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2] ">Read more...</Text>
            </TouchableOpacity>
          )}
          {isDescriptionExpanded && (
            <TouchableOpacity onPress={() => setIsDescriptionExpanded(false)}>
              <Text className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Show less</Text>
            </TouchableOpacity>
          )}

        </View>

        {/* Galery */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="w-full flex-row justify-between items-center">
            <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Galery</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronRightIcon size={20} color={colorScheme === 'dark' ? '#b6b5b5' : '#706F6E'} strokeWidth="2.1" className="p-6"/>
            </TouchableOpacity>
          </View>
          
          <View className="mr-3 h-[110] w-[100] bg-[#d4d4d3] dark:bg-[#474646] rounded-2xl"/>
          
        </View>

        {/* Service data */}

        <View className="mt-8 pl-6 justify-center items-center pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="flex-row justify-center items-start">

            <View className="flex-1 justify-start items-start">

              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Earned money</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">1000 €</Text>
              </View>
              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Hores totals</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">85 h</Text>
              </View>
              <View className="justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Repeted</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">6</Text>
              </View>

            </View>

            <View className="flex-1 justify-start items-start">

              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Success rate</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">1000 %</Text>
              </View>
              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Total services</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">12</Text>
              </View>
              <View className="justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Response time</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{'<'}30 min</Text>
              </View>

            </View>

          </View>

        </View>

        {/* Tags and habilities */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Tags and habilities</Text>

          <View className="flex-row justify-start items-center flex-wrap">
            <View className="flex-row py-2 px-3 bg-[#f2f2f2] dark:bg-[#272626] rounded-full mr-1 mb-1">
              <Text className="font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">Modernista</Text>
            </View>
          </View>

        </View>

        {/* Personal information */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Personal information</Text>

          <Text>
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Languages: </Text>
          </Text>

        </View>

        <View className="h-[50]"/>
      </ScrollView >

      {/* Button book */}

      <View className="flex-row justify-center items-center pb-3 px-6">

        <TouchableOpacity
          onPress={() => null }
          style={{ opacity: 1 }}
          className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center"
        >
          <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Book for </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}