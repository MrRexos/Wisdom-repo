
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import api from '../../utils/api.js';


export default function ResultsScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedOrderBy, setSelectedOrderBy] = useState('recommend');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState();

  const orderByOptions = [
    { label: 'Recommend', type: 'recommend' },
    { label: 'Cheapest', type: 'cheapest' },
    { label: 'Best rated', type: 'bestRated' },
    { label: 'Most expensive', type: 'mostExpensive' },
    { label: 'Nearest', type: 'nearest' },
    { label: 'Availability', type: 'availability' },
  ];

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  const fetchResults = async () => {
    try {
      const response = await api.get(`/api/category/1/services`); //CAMBIAR ESTO MAS ADELANTE
      setResults(response.data);
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };

  useEffect(() => {
    fetchResults();  
  }, []);


  const renderItem = ({ item, index }) => {
    const getFormattedPrice = () => {
      const numericPrice = parseFloat(item.price);
      const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
      if (item.price_type === 'hour') {
        return (
          <>
            <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]}</Text>
            <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">/hour</Text>
          </>
        );
      } else if (item.price_type === 'fix') {
        return (
          <>
            <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">Fixed Price: </Text>
            <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]}</Text>
          </>
        );
      } else {
        return <Text className="font-inter-bold text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">Price on budget</Text>;
      }
    };

    return (
      <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile')} className="mt-5 mx-5 rounded-3xl bg-[#fcfcfc] dark:bg-[#323131] ">

        <View className="flex-row justify-between items-center mt-5">
          <Text className="ml-5 mt-1 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
          <TouchableOpacity>
            <Heart height={23} width={23} strokeWidth={1.7} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} style={{ marginRight: 20 }} />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mt-4">

          <Text className="ml-5 mr-5">{getFormattedPrice()}</Text>

          {item.tags && (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-1">
              {item.tags.map((tag, index) => (
                <View key={index} className="pr-[6]">
                  <TouchableOpacity className='px-3 py-1 rounded-full bg-[#f2f2f2] dark:bg-[#272626]'>
                    <Text className='font-inter-medium text-[12px] text-[#979797] '>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

        </View>

        <View className="flex-row justify-between items-end mx-5 mt-4">

            <View className="flex-row justify-start items-center">
              <Image source={item.profile_picture ? { uri: item.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[45] w-[45] bg-[#706B5B] rounded-lg" />
              <View className="ml-3 justify-center items-start">
                <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.first_name} {item.surname}</Text>
                <Text className="font-inter-semibold text-[11px] text-[#706F6E] dark:text-[#b6b5b5]">Place</Text>
              </View>
            </View>

            {item.review_count > 0 && (
              <View className="flex-row items-center ">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                <Text className="ml-[3]">
                  <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(item.average_rating).toFixed(1)}</Text>
                  <Text> </Text>
                  <Text className="font-inter-medium text-[11px] text-[#706F6E] dark:text-[#B6B5B5]">({item.review_count === 1 ? `${item.review_count} review` : `${item.review_count} reviews`})</Text>
                </Text>
              </View>
            )}

        </View>

        <View className="p-6">

          {item.images && (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-1 roundex-lg">
              {item.images.map((image, index) => (
                <View key={index} className="pr-[6]">

                  <TouchableOpacity className='ml-1'>
                    <Image source={image.image_url ? { uri: image.image_url } : null} className="h-[65] w-[55] bg-[#706B5B] rounded-lg" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

        </View>

        
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <View className="flex-row items-center justify-center pt-8">

        <View className="w-10 justify-center items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} >
              <ChevronLeftIcon size={25} strokeWidth={1.8} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <TouchableOpacity onPress={() => navigation.navigate('Results')} className="justify-center items-center">
            <View className="h-[55] pl-5 pr-1 w-full flex-row justify-between items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              <Search height={19} color={iconColor} strokeWidth="2"/>
              <View className=" justify-center items-center ">
                <Text className="mb-1 font-inter-semibold text-center text-[14px] text-[#444343] dark:text-[#f2f2f2]">Home cleaner</Text>
                <Text className="font-inter-medium text-center text-[11px] text-[#706F6E] dark:text-[#b6b5b5]">Place • July 01-09</Text>
              </View> 
              <TouchableOpacity className="rounded-full px-3 py-4 bg-[#fcfcfc] dark:bg-[#323131]">
                <Sliders height={17} color={iconColor} strokeWidth="1.8"/>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View className="w-10"/>

      </View>

      {/* Contenedor del botón "Order by" */}
      
      <View className="flex-row p-5 justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <Text className="mb-1 font-inter-bold text-center text-[18px] text-[#444343] dark:text-[#f2f2f2]">Order by</Text>

        {/* Botón desplegable */}
        <TouchableOpacity
          onPress={() => setIsDropdownOpen(!isDropdownOpen)} // Cambia el estado del dropdown
          className="py-3 bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-3xl"
        >
          <View className="flex-row px-4 justify-center items-center">
            <Text className="mr-1 font-inter-medium text-center text-[12px] text-[#444343] dark:text-[#f2f2f2]">
              {orderByOptions.find(option => option.type === selectedOrderBy)?.label || 'Select'}
            </Text>
            {isDropdownOpen ? (
              <ChevronUpIcon size={15} strokeWidth={1.8} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
            ) : (
              <ChevronDownIcon size={15} strokeWidth={1.8} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
            )}
          </View>

          {/* Opciones desplegables */}
          {isDropdownOpen && (
            <View 
              style={{ 
                position: 'absolute', 
                top: 50, // Ajusta según el espacio que necesites
                left: 0, 
                right: 0,
                zIndex: 999, // Asegura que esté encima de otros elementos
                backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0',
                borderRadius: 15,
              }}
            >
              <ScrollView className="max-h-[200] rounded-2xl pb-1">
                {orderByOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedOrderBy(option.type);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3  rounded-2xl ${selectedOrderBy === option.type ? 'bg-[#d4d3d3] dark:bg-[#474646]' : 'bg-[#e0e0e0] dark:bg-[#3d3d3d]'}`}
                  >
                    {index>0 && (<View className="mx-1 border-t-[1px] border-[#b6b5b5] dark:border-[#706f6e]"/>)}
                    <Text className={`py-2 text-center font-inter-medium text-[12px] ${selectedOrderBy === option.type ? 'text-white' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!results || results.notFound ? (

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <SuitcaseFill height={60} width={60} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
        <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
          Services not found
        </Text>
        <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-4 w-[250]">
          Try later.
        </Text>
      </View>
      ) : (

        <FlatList
          data={results}
          keyExtractor={(item) => item.service_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            justifyContent: 'space-between',
          }}
        />
      )}

      

    </SafeAreaView>
  );
}