import React, { useEffect, useState, useCallback } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';
import { Search, Check } from "react-native-feather";
import MapView, { Marker } from 'react-native-maps';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function CreateService6Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags} = route.params;
  const [isOnline, setIsOnline] = useState(false); 

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

  const loadSearchedDirection = async () => {
    
    const searchedDirectionData = await getDataLocally('searchedDirection');
    if (searchedDirectionData) {
      searchedDirection = JSON.parse(searchedDirectionData);
      setCountry(searchedDirection.country)
      setState(searchedDirection.state)
      setCity(searchedDirection.city)
      setStreet(searchedDirection.street)
      setPostalCode(searchedDirection.postalCode)
      setStreetNumber(searchedDirection.streetNumber)
      setAddress2(searchedDirection.address2)
      setLocation(searchedDirection.location)  
    }
  };

  const removeSearchedDirection = async () => {
    try {
      await AsyncStorage.removeItem('searchedDirection');
      console.log('searchedDirection eliminado de AsyncStorage');
    } catch (error) {
      console.error('Error al eliminar searchedDirection:', error);
    }
  };

  useEffect(() => {
    console.log(currentLocation)
    removeSearchedDirection();
  },[]);

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
        console.log(location)
      }
    }, [location])
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

        <View className="flex-1 px-6 pt-5 pb-6">

            <TouchableOpacity onPress={() => navigation.pop(6)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-center ">
              <Text className="mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">Locate your service</Text>
              <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">The exact location will never be made public</Text>
            </View>

            <View className="flex-1 pb-[80] justify-start items-center ">

              <TouchableOpacity onPress={() => navigation.navigate('SearchDirection')} className="mt-7 px-3 justify-center items-center w-full">
                <View className="mt-7 h-[50] px-4 w-full flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                    <Search height={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2"/>
                    <Text 
                      className="pl-2 truncate text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                      style={{ flexShrink: 1 }} 
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {direction || 'Search a direction...'}
                    </Text>
                </View>
              </TouchableOpacity>

              
              <MapView
                style={{ height: 250, width: 300, borderRadius: 12, marginTop: 25 }}
                region={{
                  latitude:  currentLocation.lat, // Latitud inicial
                  longitude: currentLocation.lng, // Longitud inicial
                  latitudeDelta: 0.005, // Zoom en la latitud
                  longitudeDelta: 0.003, // Zoom en la longitud
                }}
              >
                {/* Solo renderizar el marcador si 'location' existe */}
                {location && (
                  <Marker
                    coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                    image={require('../../assets/MapMarker.png')}
                  />
                )}
              </MapView>

              <TouchableOpacity onPress={() => setIsOnline(!isOnline)} className="flex-row w-full justify-start mt-5 pl-6 items-center">
                <Text className="mr-4 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">Online service</Text>
                <View 
                  style={[
                    styles.checkbox, 
                    { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }, 
                    isOnline && { 
                      backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', 
                      borderWidth: 0 
                    }
                  ]}
                >
                  {isOnline && (
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
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
              disabled={!isOnline || !direction}
              onPress={() => navigation.navigate('CreateService7', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags})}
              style={{opacity: isOnline || direction? 1.0: 0.5}}
              className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
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
