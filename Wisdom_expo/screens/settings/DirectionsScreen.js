import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Check, MapPin, MoreHorizontal, Plus } from "react-native-feather";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import RBSheet from 'react-native-raw-bottom-sheet';


export default function DirectionsScreen() {

  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [userId, setUserId] = useState();
  const [directions, setDirections] = useState([]);
  const sheet = useRef();
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');
  const [sheetHeight, setSheetHeight] = useState(230);
  const [isEditing, setIsEditing] = useState(false);

  const EditButtons = [
    {
      items: [
        { id: 'edit', label: 'Edit direction', type: 'select', link: 'FAQ' },
        { id: 'delete', label: 'Delete', type: 'delete' },
      ],
    },
  ];

  const fetchDirections = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);

    try {
      const response = await api.get(`/api/directions/${user.id}`);
      return response.data.directions;
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadDirections = async () => {
        const directionList = await fetchDirections();
        setDirections(directionList);
      };
      loadDirections();
    }, [])
  );

  const deleteDirection = async (addressId) => {
     try {
       await api.delete(`/api/address/${addressId}`);
       const newDirections = await fetchDirections();
       setDirections(newDirections); // Actualiza la lista localmente
     } catch (error) {
       console.error('Error deleting address:', error);
     }
  };

  const openSheetWithInput = async (mode) => {

    if (mode===false) {
      setIsEditing(false)
      await fetchDirections();
      setSheetHeight(230);
    } else {
      setIsEditing(true)
      setSheetHeight(630)
    };
    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
  };

  const handleConfirm = async () => {

    try {
      const response = await api.put(`/api/address/${selectedAddressId}`,{
        address_type:address2 ? 'flat' : 'house', 
        street_number:streetNumber, 
        address_1:street, 
        address_2:address2, 
        postal_code:postalCode, 
        city:city, 
        state:state, 
        country:country
      });

      sheet.current.close()

      const directionList = await fetchDirections();
      setDirections(directionList);


    } catch (error) {
      console.error('Error updating address:', error);
    }
    
  };

  const inputCountryChanged = (text) => {
    setCountry(text);
  };

  const inputCityChanged = (text) => {
    setCity(text);
  };

  const inputStateChanged = (text) => {
    setState(text);
  };

  const inputStreetChanged = (text) => {
    setStreet(text);
  };

  const inputPostalCodeChanged = (text) => {
    setPostalCode(text);
  };

  const inputStreetNumberChanged = (text) => {
    setStreetNumber(text);
  };

  const inputAddress2Changed = (text) => {
    setAddress2(text);
  };





  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => setIsEditing(false)}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >

        {isEditing? (

          <ScrollView>      
            <View className="flex-1 w-full justify-start items-center pt-3 pb-5 px-5"> 

            <View className="justify-between items-center mb-10">                  
                <Text className="text-center font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('confirm_your_direction')}</Text>
            </View>
              
            <View className="w-full h-[55px] mx-2 mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {country && country.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('country_region')}</Text>
              ) : null}              
              <TextInput
                placeholder={t('country_region') + '...'}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputCountryChanged} 
                value={country || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />            
            </View>

            <View className="w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {state && state.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('state')}</Text>
              ) : null}              
              <TextInput
                placeholder={t('state') + '...'}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputStateChanged} 
                value={state || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>

            <View className="w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {city && city.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('city_town')}</Text>
              ) : null}              
              <TextInput
                placeholder={t('city_town') + '...'}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputCityChanged} 
                value={city || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>

            <View className="w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {street && street.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('street')}</Text>
              ) : null}              
              <TextInput
                placeholder={t('street') + '...'}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputStreetChanged} 
                value={street || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>
            <View className="flex-row w-full justify-between items-center">

              <View className="flex-1 h-[55px] mr-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {postalCode && postalCode.length>0? (
                  <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('postal_code')}</Text>
                ) : null}              
                <TextInput
                  placeholder={t('postal_code') + '...'}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={inputPostalCodeChanged} 
                  value={postalCode || ''}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
                />
              </View>

              <View className="flex-1 h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {streetNumber && String(streetNumber).length>0? (
                  <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('street_number')}</Text>
                ) : null}   
                <TextInput
                  placeholder={t('street_number') + '...'}
                  selectionColor={cursorColorChange}
                  placeholderTextColor="#ff633e"
                  onChangeText={inputStreetNumberChanged} 
                  value={streetNumber ? String(streetNumber) : ''}
                  keyboardType="number-pad"
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
                />
              </View>

            </View>



            <View className="w-full h-[55px] mx-2 mb-10 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              { address2 && address2.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('floor_door_stair_optional')}</Text>
              ) : null}              
              <TextInput
                placeholder={t('floor_door_stair_optional') + '...'}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputAddress2Changed} 
                value={address2 || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>

            <TouchableOpacity 
                disabled={streetNumber.length<1}
                onPress={() => handleConfirm()}
                style={{opacity: streetNumber.length<1? 0.5: 1}}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('confirm')}</Text>
            </TouchableOpacity>

            </View> 
          </ScrollView>  

        ) : (
 
        <View className="flex-1 w-full justify-start items-center mt-6 pb-5 px-5">
          {EditButtons.map(({ items }, sectionIndex) => (
            <View key={sectionIndex} style={{ borderRadius: 12, overflow: 'hidden' }} className="w-full">
              {items.map(({ label, id, type, link }, index) => (
                <View key={id} className="pl-5 bg-[#e0e0e0] dark:bg-[#3d3d3d]">
                  <TouchableOpacity
                    onPress={() => {
                      if (type === 'delete') {
                        deleteDirection(selectedAddressId);
                        sheet.current.close();
                      } else if (type === 'select') {
                        openSheetWithInput(true);
                      }
                    }}
                  >
                    <View className="flex-row items-center justify-start">
                      <View className={`py-[12] flex-1 flex-row items-center justify-start pr-[14] border-[#b6b5b5] dark:border-[#706f6e]`} style={[{ borderTopWidth: 1 }, index === 0 && { borderTopWidth: 0 }]}>
                        <Text className={`font-inter-medium text-[15px] ${type === 'delete' ? 'text-red-600' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>
                          {label}
                        </Text>
                        <View className="flex-1" />

                        {['select', 'link'].includes(type) && <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>

        )}

      </RBSheet>

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[90px] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
          <View className="flex-1 ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center ">
            <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('directions')}</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('AddDirection', {prevScreen:'Directions'})} className="flex-1 justify-center items-end">
            <Plus height={25} width={25} strokeWidth={1.7} color={iconColor} className="mr-3" />
          </TouchableOpacity>
        </View>
      </View>

      {(!directions || directions.length<1)? (

        <View className="flex-1 justify-center items-center">
          <MapPin height={55} width={60} strokeWidth={1.7} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
          <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
            {t('directions_empty_title')}
          </Text>
          <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[300px]">{t('directions_empty_description')}</Text>
        </View>
    
      ) : (

      <ScrollView className="flex-1 px-6 mt-[75px] ">
        {directions.map((direction) => (
          <View key={direction.direction_id} className="pb-5 mb-5 flex-row w-full justify-center items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
            <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              <MapPin height={22} width={22} strokeWidth={1.6} color={iconColor} />
            </View>

            <View className="pl-4 pr-3 flex-1 justify-center items-start">
              <Text numberOfLines={1} className="mb-[6px] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                {[direction.address_1, direction.street_number].filter(Boolean).join(', ')}
              </Text>
              <Text numberOfLines={1} className="font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
                {[direction.postal_code, direction.city, direction.state, direction.country].filter(Boolean).join(', ')}
              </Text>
            </View>

            <View className="h-full justify-start items-center">
              <TouchableOpacity onPress={() => {
                setSelectedAddressId(direction.address_id); 
                setCountry(direction.country);
                setState(direction.state);
                setCity(direction.city);
                setStreet(direction.address_1);
                setStreetNumber(direction.street_number);
                setPostalCode(direction.postal_code);
                setAddress2(direction.address_2);
                setIsEditing(true);
                openSheetWithInput(false) }}>
                <MoreHorizontal height={20} width={20} strokeWidth={1.7} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      )}

    </SafeAreaView>
  );
}
