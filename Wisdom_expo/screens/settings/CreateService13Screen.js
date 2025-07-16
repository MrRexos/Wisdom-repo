import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronLeftIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Heart} from 'react-native-feather';
import api from '../../utils/api.js';
import { getDataLocally } from '../../utils/asyncStorage';




export default function CreateService13Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const route = useRoute();
  const {
    title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate,
    experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia, allowAsk
  } = route.params;
  const [userId, setUserId] = useState();
  const [userInfo, setUserInfo] = useState({});

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

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

  const formatLanguages = (languagesArray) => {
    const languageNames = languagesArray.map(lang => languagesMap[lang] || lang);
    if (languageNames.length > 1) {
      return `${languageNames.slice(0, -1).join(', ')} and ${languageNames[languageNames.length - 1]}`;
    }
    return languageNames[0];
  };

  const getUserId = async () => {
    console.log(title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate,
      experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia, allowAsk)
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    setUserInfo(user);
  }

  const transformedExperiences = experiences.map(exp => ({
    experience_title: exp.position,
    place_name: exp.place,
    experience_started_date: new Date(exp.startDate).toISOString(),
    experience_end_date: exp.endDate? new Date(exp.endDate).toISOString(): null  // Convertir `undefined` a `null`
  }));

  

  useEffect( () => {
    getUserId();
  },[]);

  const getFormattedPrice = () => {
    const numericPrice = parseFloat(finalPrice);
    const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
    if (priceType === 'hour') {
      return (
        <>
          <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols.EUR} €</Text>
          <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">/hour</Text>
        </>
      );
    } else if (priceType === 'fix') {
      return (
        <>
          <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">Fixed Price: </Text>
          <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols.EUR} €</Text>
        </>
      );
    }
    return <Text className="font-inter-bold text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">Price on budget</Text>;
  };

  const ServicePanelPreview = () => (
    <View className="mt-5 mx-5 rounded-3xl bg-[#fcfcfc] dark:bg-[#323131]">
      <View className="flex-row justify-between items-center mt-5">
        <Text className="ml-5 mt-1 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{title}</Text>
        <Heart height={23} width={23} strokeWidth={1.7} color={iconColor} style={{ marginRight: 20 }} />
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="ml-5 mr-5">{getFormattedPrice()}</Text>
        {tags && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            {tags.map((tag, index) => (
              <View key={index} className="pr-[6px]">
                <View className='px-3 py-1 rounded-full bg-[#f2f2f2] dark:bg-[#272626]'>
                  <Text className='font-inter-medium text-[12px] text-[#979797]'>{tag}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="flex-row justify-between items-end mx-5 mt-4 mb-6">
        <View className="flex-row justify-start items-center">
          <Image source={userInfo.profile_picture ? { uri: userInfo.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[45px] w-[45px] bg-[#706B5B] rounded-lg" />
          <View className="ml-3 justify-center items-start">
            <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{userInfo.first_name} {userInfo.surname}</Text>
            <Text className="font-inter-semibold text-[11px] text-[#706F6E] dark:text-[#b6b5b5]">Place</Text>
          </View>
        </View>
      </View>

      {serviceImages && serviceImages.length > 0 && (
        <View className="px-6 pb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            {serviceImages.map((image, index) => (
              <View key={index} className="pr-[6px]">
                <Image source={image.uri ? { uri: image.uri } : null} className="h-[65px] w-[55px] bg-[#706B5B] rounded-lg" />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const ServiceProfilePreview = () => (
    <View className="px-5 pt-6">
      <View className="justify-start items-center mt-10">
        <Image source={userInfo.profile_picture ? {uri: userInfo.profile_picture} : require('../../assets/defaultProfilePic.jpg')} className="h-[100px] w-[100px] bg-[#d4d4d3] dark:bg-[#474646] rounded-full"/>
        <Text className="mt-3 font-inter-bold text-center text-[23px] text-[#444343] dark:text-[#f2f2f2]">{userInfo.first_name} {userInfo.surname}</Text>
        <Text className="mt-2 font-inter-medium text-center text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">@{userInfo.username} • {title}</Text>
        <View className="py-3 mt-7 mx-4 flex-row justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-3xl">
          <View className="flex-1 justify-center items-center border-r-[1px] border-[#d4d4d3] dark:border-[#474646]">
            <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">0</Text>
            <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Services</Text>
          </View>
          <View className="flex-1 justify-center items-center">
            <View className="flex-row justify-center items-center">
              <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1.3 }] }} />
              <Text className="ml-[6px] font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">0</Text>
            </View>
            <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Rating</Text>
          </View>
          <View className="flex-1 justify-center items-center border-l-[1px] border-[#d4d4d3] dark:border-[#474646]">
            <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">0</Text>
            <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Repites</Text>
          </View>
        </View>
      </View>

      <View className="mt-9 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">About the service</Text>
        <Text className="break-all text-[14px] text-[#515150] dark:text-[#d4d4d3]">{description}</Text>
      </View>

      {serviceImages && serviceImages.length > 0 && (
        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
          <Text className="mb-5 flex-1 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Galery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
            {serviceImages.slice(0,10).map((image, index) => (
              <View key={index} className="mr-3">
                <Image source={{ uri: image.uri }} className="h-[110px] w-[100px] bg-[#d4d4d3] dark:bg-[#474646] rounded-2xl"/>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {tags && tags.length>0 && (
        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Tags and habilities</Text>
          <View className="flex-row justify-start items-center flex-wrap">
            {tags.map((tag, index) => (
              <View key={index} className="flex-row py-2 px-3 bg-[#f2f2f2] dark:bg-[#272626] rounded-full mr-1 mb-1">
                <Text className="font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {selectedLanguages && selectedLanguages.length>0 && (
        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
          <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Personal information</Text>
          <Text><Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Languages: </Text><Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatLanguages(selectedLanguages)}</Text></Text>
          {hobbies && (<Text className="mt-4"><Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Hobbies: </Text><Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{hobbies}</Text></Text>)}
        </View>
      )}
    </View>
  );

  const uploadImages = async (images) => {
  
    const formData = new FormData();

    images.forEach((image, index) => {
      formData.append('files', {
        uri: image.uri,
        type: image.type,
        name: `image${index + 1}.jpg`,
      });
    });

    console.log(formData)
  
    try {
      const res = await api.post('/api/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data
    } catch (error) {
      console.error(error);
    }
  };

  const createService = async (imagesURLS=[]) => {
    
    try {
      const response = await api.post('/api/service', {
        service_title:title,
        user_id:userId,
        description:description,
        service_category_id:category.service_category_id,
        price:finalPrice,
        price_type:priceType,
        latitude:location? location.lat: null,
        longitude:location? location.lng: null,
        action_rate:actionRate,
        user_can_ask:allowAsk,
        user_can_consult:allowConsults,
        price_consult:consultPrice,
        consult_via_provide:consultVia,
        consult_via_username:null,
        consult_via_url:null,
        is_individual:isIndividual,
        allow_discounts: allowDiscounts,
        discount_rate: discountRate,
        languages: selectedLanguages,      
        tags: tags,           
        experiences: transformedExperiences,    
        images: imagesURLS,
        hobbies: hobbies
      });
      console.log('User created:', response.data);
      
    } catch (error) {
      console.error(error);
    }
  }

  const publish = async () => {
    try {
      let imageURLS = [];
      if (serviceImages.length > 0) {
        imageURLS = await uploadImages(serviceImages);       
      }
      console.log(imageURLS)
      await createService(imageURLS);
      navigation.navigate('Professional', { screen: 'Listings' });
    } catch (error) {
      console.error('Error publishing service:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className='pt-5 pb-1 px-6'>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
                </View> 
            </TouchableOpacity>

            

            <View className="flex-1">
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-5 justify-center items-start ml-2 ">
                  <Text className="mt-[50px] font-inter-bold text-[28px] text-[#444343] dark:text-[#f2f2f2] ">{t('check_your_service')}</Text>
                </View> 
                <ServicePanelPreview />
                <View className="mt-15 border-t-[2px] border-[#b6b5b5] dark:border-[#706f6e]" />
                <ServiceProfilePreview />
              </ScrollView>
            </View>

            <View className="justify-center items-center px-5">
                <TouchableOpacity 
                disabled={false}
                onPress={() => publish()}
                style={{
                  opacity: 1,
                  shadowColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, 
                  shadowRadius: 10,
                  elevation: 10,
                }}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('publish_service')}</Text>
                </TouchableOpacity>
            </View>

        </View>
    </SafeAreaView>
  );
}