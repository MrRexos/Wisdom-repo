
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
  const [showMoreButton, setShowMoreButton] = useState(false);
  const languagesMap = {
    es: 'Spanish',
    en: 'English',
    ca: 'Catalan',
    fr: 'French',
    ar: 'Arabic',
    de: 'German',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    ru: 'Russian',
    it: 'Italian',
    nl: 'Dutch',
    tr: 'Turkish',
    sv: 'Swedish'
};


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
    getServiceInfo(); 
    console.log(serviceId)
    console.log(serviceData)
     
  }, []);

  const formatLanguages = (languagesArray) => {
    const languageNames = languagesArray.map(lang => languagesMap[lang] || lang);
    if (languageNames.length > 1) {
      return `${languageNames.slice(0, -1).join(', ')} and ${languageNames[languageNames.length - 1]}`;
    }
    return languageNames[0];
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    
    // Opciones para el formato de la fecha
    const options = {
        year: 'numeric',
        month: 'long', // Puedes usar 'numeric' para obtener el mes como número
        day: 'numeric',
    };
    
    // Formatea la fecha a una cadena legible
    return date.toLocaleString('en-US', options);
  };

  const onTextLayout = useCallback(
    (e) => {
      console.log(e.nativeEvent.lines.length);
      if (e.nativeEvent.lines.length > 3 ) {
        setShowMoreButton(true);
      } else {
        setShowMoreButton(false);
      }
    },
    []
  );



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-6 flex-1">

        {/* Top FALTA */}

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

          <Image source={serviceData.profile_picture ? {uri: serviceData.profile_picture} : require('../../assets/defaultProfilePic.jpg')} className="h-[100] w-[100] bg-[#d4d4d3] dark:bg-[#474646] rounded-full"/>

          <Text className="mt-3 font-inter-bold text-center text-[23px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.first_name} {serviceData.surname}</Text>

          <Text className="mt-2 font-inter-medium text-center text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
            <Text>@{serviceData.username}</Text>
            <Text> • </Text>
            <Text>{serviceData.service_title}</Text>
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

          <Text onTextLayout={onTextLayout} numberOfLines={isDescriptionExpanded ? null : 4} className="break-all text-[14px] text-[#515150] dark:text-[#d4d4d3]">{serviceData.description}</Text>
          
          {showMoreButton && (
          
            <View>
              {!isDescriptionExpanded && (
                <TouchableOpacity onPress={() => setIsDescriptionExpanded(true)}>
                  <Text  className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2] ">Read more...</Text>
                </TouchableOpacity>
              )}
              {isDescriptionExpanded && (
                <TouchableOpacity onPress={() => setIsDescriptionExpanded(false)}>
                  <Text className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Show less</Text>
                </TouchableOpacity>
              )}
            </View>

          )}      
          

        </View>

        {/* Galery FALTA */}

        {serviceData.images && (

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="w-full flex-row justify-between items-center">
            <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Galery</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronRightIcon size={20} color={colorScheme === 'dark' ? '#b6b5b5' : '#706F6E'} strokeWidth="2.1" className="p-6"/>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="w-full">

            {serviceData.images.map((image, index) => (
            
              <Image key={index} source={{uri: image.image_url}} className="mr-3 h-[110] w-[100] bg-[#d4d4d3] dark:bg-[#474646] rounded-2xl"/>

            ))}

          </ScrollView>
          
        </View>

        )}

        {/* Service data FALTA */}

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

        {serviceData.tags && (

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Tags and habilities</Text>

          <View className="flex-row justify-start items-center flex-wrap">
            {serviceData.tags.map((tag, index) => (
              <View key={index} className="flex-row py-2 px-3 bg-[#f2f2f2] dark:bg-[#272626] rounded-full mr-1 mb-1">
                <Text className="font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{tag}</Text>
              </View>
            ))}
          </View>

        </View>

        )}

        {/* Personal information */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Personal information</Text>


          {serviceData.languages && (
            <Text>
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Languages: </Text>
              <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatLanguages(serviceData.languages)}</Text>
            </Text>
          )}

          {serviceData.hobbies && (
          <Text className="mt-4">
            <Text className="mt-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Hobbies: </Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{serviceData.hobbies}</Text>
          </Text>
          )}

          <Text className="mt-4">
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Verified: </Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">Identity</Text>
          </Text>

          <Text className="mt-4">
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Creation date: </Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatDate(serviceData.service_created_datetime)}</Text>
          </Text>

          {/* Experiences */}

          {serviceData.experiences && (
          
          <View>

            <View className="mt-8 mb-8 flex-row w-full justify-between items-center">
              <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Experience</Text>
              <Text className="mr-3 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">2 years experience</Text>
            </View>

            <View className="flex-row w-full justify-center items-center">

              <View className="w-[30] h-full items-center pr-5">
                <View className={`flex-1  bg-[#b6b5b5] dark:bg-[#706F6E] ${serviceId>0 && 'w-[2]'}`}/>
                <View className={`w-4 h-4 rounded-full border-2 border-[#444343] dark:border-[#f2f2f2] ${serviceId? null : colorScheme == 'dark' ? 'bg-[#f2f2f2]' : 'bg-[#444343]'}`}>
                </View>
                <View className={`flex-1 w-[2] bg-[#b6b5b5] dark:bg-[#706F6E] ${serviceId===serviceId-1 ? 'w-[0]' : 'w-[2]'}`}/>
              </View>

              <View className="flex-1 py-3 px-5 mb-3 bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">

                <View className="mt-1 flex-row justify-between">
                  <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">Position</Text>
                </View>

                <View className="mt-3 flex-row justify-between items-center mb-[6]">
                  <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">Place</Text>
                  <Text>
                    <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(serviceId).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                    <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]"> - </Text>
                    <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{serviceId ? new Date(serviceId).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Still there'}</Text>
                  </Text>
                </View>
                
              </View>
            </View>
          </View>

          )}  

        </View>

        {/* Location */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Location</Text>       

          {!serviceId? (

            <View className="justify-center items-center w-full">
              <GlobeAltIcon height={80} width={80} strokeWidth={1.2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
              <Text className="mt-3 font-inter-semibold text-[18px] text-[#706F6E] dark:text-[#b6b5b5]">Unlocated or online service</Text>  
            </View>

          ) : (

            <View className="justify-center items-center w-full">
              <MapView
                style={{ height: 160, width: 280, borderRadius: 12 }}
                region={{
                  latitude:  1, // Latitud inicial
                  longitude: 1, // Longitud inicial
                  latitudeDelta: 0.02, // Zoom en la latitud
                  longitudeDelta: 0.01, // Zoom en la longitud
                }}
              >
                
              </MapView>

              <View className="mt-3 px-3 w-full flex-row justify-between items-center">
                <Text className="mt-3 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">08304 Mataró, Espanya</Text>
                <Text className="mt-3 font-inter-semibold text-[14px] text-[#B6B5B5] dark:text-[#706F6E]">13:45 local hour</Text>
              </View>

            </View>

          )}

        </View>

        {/* Rating and reviews */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-8 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Rating and reviews</Text>

          <View className="flex-row w-full justify-between items-center">
            <Text className="font-inter-bold text-[55px] text-[#444343] dark:text-[#f2f2f2]">4,5</Text>

            <View className="justify-start items-end">

              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170] h-[4] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View className={`h-full w-[80%] bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170] h-[4] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View className={`h-full w-[60%] bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170] h-[4] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View className={`h-full w-[30%] bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170] h-[4] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View className={`h-full w-[40%] bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170] h-[4] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View className={`h-full w-[10%] bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>

            </View >
          </View>

          <View className="w-full justify-center items-end">
            <Text className="mt-3 font-inter-semibold text-[14px] text-[#B6B5B5] dark:text-[#706F6E]">5 ratings</Text>
          </View>

          {/* Reviews */}

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-5 w-full">

            <View className="mr-2 py-5 px-4 w-[300] bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">

              <View className="flex-row justify-start items-center">

                <View className="mr-3 h-10 w-10 rounded-full bg-[#706F6E] dark:bg-[#b6b5b5]"/>

                <View className="justify-center items-start">
                  <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Name Surname</Text>
                  <Text className="mt-1 font-inter-medium text-[9px] text-[#706F6E] dark:text-[#b6b5b5]">27 february 2024</Text>                
                </View>

                <View className="flex-row justify-end items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1 }], marginLeft: 70 }}/>
                  <Text className="ml-1 mr-2 font-inter-bold text-[15px] text-[#444343] dark:text-[#f2f2f2]">4,6</Text>                
                </View>

              </View>

              <Text className="mt-5 mb-3 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Name Surname</Text>
              <Text numberOfLines={3}  className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t empor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t empor incididunt ut labore et dolore magna aliqua</Text>

              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-5 w-full">
                <View className="mr-1 w-12 h-12 bg-[#D4D4D3] dark:bg-[#474646] rounded-md" />
              </ScrollView>

            </View>            
          </ScrollView>

          <TouchableOpacity
            onPress={() => null }
            style={{ opacity: 1 }}
            className="mt-6 bg-[#F2F2F2] dark:bg-[#272626] w-full h-[45] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">See all reviews</Text>
          </TouchableOpacity>

        </View>

        {/* Consult */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="mr-2 py-5 px-4 w-full bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">
            <Text className="mb-4 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Consult a professional</Text>
            <Text className="mb-9 font-inter-semibold text-[13px] text-[#706F6E] dark:text-[#b6b5b5]">5 € for a 15 min call</Text>

            <View className="flex-row justify-center items-center">

              <TouchableOpacity
              onPress={() => null }
              style={{ opacity: 1 }}
              className="mr-2 bg-[#E0E0E0] dark:bg-[#3d3d3d] w-1/3 h-[40] rounded-full items-center justify-center"
              >
                <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Write</Text>
              </TouchableOpacity>

              <TouchableOpacity
              onPress={() => null }
              style={{ opacity: 1 }}
              className="bg-[#444343] dark:bg-[#f2f2f2] w-2/3 h-[40] rounded-full items-center justify-center"
              >
                <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">Book a consult</Text>
              </TouchableOpacity>

            </View>  
          </View>

        </View>

        {/* Others */}

        <View className="mt-8 justify-center items-start pb-7">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Others</Text>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <WisdomLogo  width={23} height={23} color={iconColor}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Wisdom Warranty</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth="2" className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <XCircleIcon  width={24} height={24} color={iconColor} strokeWidth={1.4}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Cancellation Policy</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth="2" className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Info  width={23} height={23} color={iconColor} strokeWidth={1.4}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Help</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth="2" className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Phone  width={22} height={22} color={iconColor} strokeWidth={1.4} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Contact Wisdom</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth="2" className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <FileText  width={23} height={23} color={iconColor} strokeWidth={1.4}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Reservation policy</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth="2" className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Flag  width={23} height={23} color={iconColor} strokeWidth={1.4}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Report this service</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth="2" className="p-6"/>
            </View>
          </TouchableOpacity>

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