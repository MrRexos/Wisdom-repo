import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronLeftIcon} from 'react-native-heroicons/outline';
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

  const getUserId = async () => {
    console.log(title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate,
      experiences, serviceImages, priceType, finalPrice, allowDiscounts, discountRate, allowConsults, consultPrice, consultVia, allowAsk)
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
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
      navigation.pop(15);
    } catch (error) {
      console.error('Error publishing service:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth="2" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-start ml-2 ">
                <Text className="mt-[55] font-inter-bold text-[28px] text-[#444343] dark:text-[#f2f2f2] ">{t('check_your_service')}</Text>
            </View>

            <View className="flex-1">

            </View>

            <View className="justify-center items-center">
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
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('publish_service')}</Text>
                </TouchableOpacity>
            </View>

        </View>
    </SafeAreaView>
  );
}