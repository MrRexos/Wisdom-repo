
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart, Plus} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';


export default function ServiceProfileScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {serviceId} = route.params;


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <ScrollView className="px-5 pt-4 flex-1">

        <View className="flex-row justify-between items-center">
          
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6"/>
          </TouchableOpacity>
          

        </View>

      </ScrollView >

      <View className="flex-row justify-center items-center pt-4 pb-6 px-6">

        <TouchableOpacity
          onPress={() => null }
          style={{ opacity: 1 }}
          className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center"
        >
          <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Book for </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}