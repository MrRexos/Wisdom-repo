import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image, RefreshControl} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Plus} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import api from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';


export default function ListingsProScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [listings, setListings] = useState();
  const [userId, setUserId] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  const fetchListings = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/services`);
      setListings(response.data);
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useRefreshOnFocus(fetchListings);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => {

    const getFormattedPrice = () => {
      const numericPrice = parseFloat(item.price);
      const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
      if (item.price_type === 'hour') {
        return (
          <>
            <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]} €</Text>
            <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">{t('per_hour')}</Text>
          </>
        );
      } else if (item.price_type === 'fix') {
        return (
          <>
            <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">{t('fixed_price_prefix')}</Text>
            <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]} €</Text>
          </>
        );
      } else {
        return <Text className="font-inter-bold text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">{t('price_on_budget')}</Text>;
      }
    };

    return (
      <TouchableOpacity style={{zIndex:10}} onPress={() => navigation.navigate('ServiceProfile', {serviceId: item.service_id})} className="mt-5 mx-5 z-10 rounded-3xl bg-[#fcfcfc] dark:bg-[#323131] ">

        <View className="flex-row justify-between items-center mt-5">
          <Text className="ml-5 mt-1 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
        </View>

        <View className="flex-row justify-between items-center mt-4">

          <Text className="ml-5 mr-5">{getFormattedPrice()}</Text>

          {item.tags && (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-1">
              {item.tags.map((tag, index) => (
                <View key={index} className="pr-[6px]">
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

        <View className="flex-row justify-between items-end mx-5 mt-4 mb-6 ">

            <View className="flex-row justify-start items-center">
              <Image source={item.profile_picture ? { uri: item.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[45px] w-[45px] bg-[#706B5B] rounded-lg" />
              <View className="ml-3 justify-center items-start">
                <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.first_name} {item.surname}</Text>
                <Text className="font-inter-semibold text-[11px] text-[#706F6E] dark:text-[#b6b5b5]">{t('place')}</Text>
              </View>
            </View>

            {item.review_count > 0 && (
              <View className="flex-row items-center ">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                <Text className="ml-[3px]">
                  <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(item.average_rating).toFixed(1)}</Text>
                  <Text> </Text>
                  <Text className="font-inter-medium text-[11px] text-[#706F6E] dark:text-[#B6B5B5]">({item.review_count === 1 ? `${item.review_count} review` : `${item.review_count} reviews`})</Text>
                </Text>
              </View>
            )}

        </View>

        {item.images && (
        <View className="px-6 pb-6">
          
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-1 roundex-lg">
              {item.images.map((image, index) => (
                <View key={index} className="pr-[6px]">

                  <TouchableOpacity className='ml-1'>
                    <Image source={image.image_url ? { uri: image.image_url } : null} className="h-[65px] w-[55px] bg-[#706B5B] rounded-lg" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
        </View>
        )}

        
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="flex-1 justify-start items-center pt-[55px]">
        
        <View className="px-6 w-full flex-row justify-between items-center">
          <Text className=" mb-2 font-inter-bold text-[28px] text-[#444343] dark:text-[#f2f2f2]">
              {t('your_listings')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateService1')} className="p-[8px] bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
            <Plus height={23} width={23} color={iconColor} strokeWidth={1.7}/>
          </TouchableOpacity>
        </View>

        {!listings || listings.notFound ? (

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <SuitcaseFill height={60} width={60} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
            <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
              {t('listings_not_found')}
            </Text>
            <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-4 w-[250px]">
              {t('publish_service_to_see_them')}
            </Text>
          </View>

        ) : (

          <View style={{zIndex:1}} className="flex-1 w-full">
            <FlatList
              data={listings}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              refreshing={refreshing}
              onRefresh={onRefresh}
              contentContainerStyle={{
                justifyContent: 'space-between',
                paddingBottom:200,
              }}
              className="pt-6"
            />
          </View>

        )}

        
      </View>
    </SafeAreaView>
  );
}