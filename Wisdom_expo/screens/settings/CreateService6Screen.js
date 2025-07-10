import React, { useEffect, useState, useCallback } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';
import { Search, Check } from "react-native-feather";
import MapView, { Marker, Circle } from 'react-native-maps';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';





export default function CreateService6Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags} = route.params;
  const [isUnlocated, setIsUnlocated] = useState(false); 

  const [direction, setDirection] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ lat: 41.5421100, lng: 2.4445000 });
  const isFocused = useIsFocused();

  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');
  const [location, setLocation] = useState();
  const [actionRate, setActionRate] = useState(1);

  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  const loadSearchedDirection = async () => {
    
    const searchedDirectionData = await getDataLocally('searchedDirection');
    if (searchedDirectionData) {
      searchedDirection = JSON.parse(searchedDirectionData);
      setCountry(searchedDirection.country)
      setState(searchedDirection.state)
      setCity(searchedDirection.city)
      setStreet(searchedDirection.address_1)
      setPostalCode(searchedDirection.postal_code)
      setStreetNumber(searchedDirection.street_number)
      setAddress2(searchedDirection.address_2)
      setLocation(searchedDirection.location)  
    }
  };

  const removeSearchedDirection = async () => {
    
    try {
      await AsyncStorage.removeItem('searchedDirection');
    } catch (error) {
      console.error('Error al eliminar searchedDirection:', error);
    }
  };



  const buildAddressString = () => {
    const parts = [];
  
    if (street) parts.push(street);
    if (streetNumber) parts.push(streetNumber);
    if (address2) parts.push(address2);
    if (city) parts.push(city);
    if (postalCode) parts.push(postalCode);
    if (state) parts.push(state);
    if (country) parts.push(country);
  
    return parts.join(', ');
  };

  useFocusEffect(
    useCallback(() => {
        loadSearchedDirection();
    }, [isFocused])
  );

  useFocusEffect(
    useCallback(() => {
      if (location) {
        setDirection(buildAddressString());
        setCurrentLocation(location);
      }
    }, [location])
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

        <View className="flex-1 px-6 pt-5 pb-6">

            <TouchableOpacity onPress={() => navigation.pop(6)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth={1.7} />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-center ">
                <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('locate_your_service')}</Text>
                <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('exact_location_never_public')}</Text>
            </View>

            <View className="flex-1 pb-[80px] justify-start items-center ">

              <TouchableOpacity onPress={() => navigation.navigate('SearchDirectionCreateService', {prevScreen:'CreateService6'})} className="mt-5 px-3 justify-center items-center w-full">
                <View className="mt-7 h-[50px] px-4 w-full flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                    <Search height={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth={2}/>
                    <Text 
                      className="pl-2 truncate text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                      style={{ flexShrink: 1 }} 
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {direction || t('search_a_direction')}
                    </Text>
                </View>
              </TouchableOpacity>

              <View className="mb-2 justify-center items-center">
                <MapView
                  style={{ height: 250, width: 300, borderRadius: 12, marginTop: 20 }}
                  region={{
                    latitude:  currentLocation.lat, // Latitud inicial
                    longitude: currentLocation.lng, // Longitud inicial
                    latitudeDelta: 0.02, // Zoom en la latitud
                    longitudeDelta: 0.01, // Zoom en la longitud
                  }}
                >
                  {/* Solo renderizar el marcador si 'location' existe */}
                  {location && (
                    <View>
                    <Marker 
                      coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                      image={require('../../assets/MapMarker.png')}
                      anchor={{ x: 0.5, y: 1 }}
                      centerOffset={{ x: 0.5, y: -20 }}
                    />
                    {actionRate<100 && (
                    <Circle
                      center={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                      radius={actionRate*1000}
                      strokeColor="rgba(182,181,181,0.8)"
                      fillColor="rgba(182,181,181,0.5)"
                      strokeWidth={2}
                    />
                    )}
                    </View>
                  )}
                </MapView>
              </View>

              {direction? (
                <View className="w-full px-4 flex-row justify-start items-center">
                  <View className="flex-1 justify-center items-start">
                  <Text className="mr-2">
                    <Text className="font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('action_rate_dash')} </Text>
                    <Text className="font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">
                        {actionRate === 100 ? t('full') : `${actionRate} km`}
                    </Text>
                  </Text>

                  </View>
                  
                  <View className="flex-1 justify-center items-end">
                  <Slider
                    style={{ width: '100%', height:10 }} 
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={actionRate}
                    thumbImage={thumbImage}
                    minimumTrackTintColor="#b6b5b5"
                    maximumTrackTintColor="#474646"
                    onValueChange={value => setActionRate(value)}
                  />
                  </View>
                </View>
              ) : null}

              <TouchableOpacity onPress={() => setIsUnlocated(!isUnlocated)} className="flex-row w-full justify-start pl-4 items-center mt-1">
                <Text className="mr-6 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('unlocated_service')}</Text>
                <View 
                  style={[
                    styles.checkbox, 
                    { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }, 
                    isUnlocated && { 
                      backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', 
                      borderWidth: 0 
                    }
                  ]}
                >
                  {isUnlocated && (
                    <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                  )}
                </View>
              </TouchableOpacity> 



            </View>

            <View className="flex-row justify-center items-center">
              
              <TouchableOpacity 
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
              disabled={!isUnlocated && !direction}
              onPress={() => navigation.navigate('CreateService7', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate})}
              style={{opacity: isUnlocated || direction? 1.0: 0.5}}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>

            </View>
        </View>
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:25,
    borderRadius: 4,
  },
});
