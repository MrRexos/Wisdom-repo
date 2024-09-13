
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, MapPinIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import {Search} from "react-native-feather";
import axios from 'axios';
import * as Location from 'expo-location';
import RBSheet from 'react-native-raw-bottom-sheet';



export default function SearchDirectionScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e ' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);
  const [streetNumber, setStreetNumber] = useState('');
  const sheet = useRef();

  const handleClearText = () => {
    setSearchText('');
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const inputStreetNumberChanged = (text) => {
    setStreetNumber(text);
  };

  const fetchSuggestions = async (input) => {
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
          params: {
            input,  
            key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
            language: 'en',
          },
        }
      );
      const locationSuggestion = {
        description: 'Your location',
        place_id: 'your_location',
      };

      setSuggestions([locationSuggestion, ...response.data.predictions]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchPlaceDetailsWithInput = async (input) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json`, {
          params: {
            query: input, 
            key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
            language: 'en',
          },
        }
      );
      setPlaceDetails(response.data.results[0]);
      console.log(placeDetails);
      sheet.current.open();
    } catch (error) {
      console.error('Error fetching place details with input:', error);
    }
  };

  const fetchPlaceDetailsWithLocation = async () => {
    try {
      // Solicitar permisos
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
  
      // Obtener la ubicación
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
  
      // Usar la latitud y longitud para buscar lugares cercanos
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
          params: {
            location: `${latitude},${longitude}`,
            radius: 100,  // Radio de búsqueda en metros
            key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
            language: 'en',
          },
        }
      );
  
      setPlaceDetails(response.data.results[0]);  // El primer lugar cercano
      console.log(placeDetails);
      sheet.current.open();
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  useEffect(() => {
    if (searchText.length > 0) {
        const timer = setTimeout(() => {
          fetchSuggestions(searchText);
        }, 300);

        return () => clearTimeout(timer);
    }
  }, [searchText]);

  const renderSuggestions = ({ item }) => (
    <TouchableOpacity className="pb-7 flex-row justify-between items-center" onPress={() => {
      if (item.description==='Your location') {
        fetchPlaceDetailsWithLocation();
      } else {
        fetchPlaceDetailsWithLocation(item.description);
      }
    }}>
        <View className="flex-row justify-start items-center">
          <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            {item.description==='Your location'? 
            <MapPinIcon height={21} color={iconColor} strokeWidth="1.7"/> : 
            <Search height={17} color={iconColor} strokeWidth="2"/>}
          </View>
          <Text className="ml-4 text-[15px] text-[#444343] dark:text-[#f2f2f2]">{item.description}</Text>
        </View>  
        <ChevronRightIcon size={18} color={colorScheme === 'dark' ? '#706F6E' : '#b6b5b5'} strokeWidth="2.5" className="p-6"/>
    </TouchableOpacity>
  );
  


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <RBSheet
        height={400}
        openDuration={300}
        closeDuration={300}
        onClose={() => null}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: {backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2'}
        }}>     
          
                          
              <View className="flex-1 w-full justify-start items-center pt-3 pb-5 px-5"> 
                <View className="flex-row justify-between items-center mb-10">
                  <View className="flex-1 justify-center">
                    <TouchableOpacity onPress={() => openSheetWithInput(null)} >
                        <ChevronLeftIcon size={25} strokeWidth={1.7} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">Change name</Text>
                  </View>
                </View>
                  
                <View className="w-full mx-2 py-2 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                  <TextInput
                    placeholder='Change name...'
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeHolderTextColorChange}
                    autoFocus={true}
                    onChange = {inputStreetNumberChanged} 
                    value={streetNumber}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={{ flex: 1, padding: 10}}  
                    className="px-5 flex-1 text-[14px] text-[#444343] dark:text-[#f2f2f2]"
                                 
                  />
                </View>
              </View>   
      </RBSheet>

      <View className="px-5 pt-4 flex-1">

        <View className="flex-row justify-start items-center mb-5">

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6"/>
            </TouchableOpacity>

            <View className="h-[55] ml-4  px-3 flex-1 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                
                <Search height={20} color={iconColor} strokeWidth="2"/>
                <TextInput 
                placeholder='Search a direction...' 
                autoFocus={true} 
                selectionColor={cursorColorChange} 
                placeholderTextColor={placeHolderTextColorChange} 
                onChangeText={handleSearch} 
                value={searchText}
                onSubmitEditing={() => fetchPlaceDetailsWithInput(searchText)}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}             
                className="flex-1 px-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]"/>

              {searchText.length>0 ? (
                <TouchableOpacity onPress={handleClearText}>
                    <View className='h-[25] w-[25] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                        <XMarkIcon height={17} color={iconColor} strokeWidth="2"/>
                    </View>
                </TouchableOpacity>
                ) : null }

            </View>  
        </View>

        {searchText.length<1 ? (
          
            <View className="mb-6 flex-row justify-between items-center">
                <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Recent searches</Text>
                <View className="px-3 py-2 rounded-full justify-center items-center bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                    <Text className="font-inter-semibold text-[10px] text-[#706f6e] dark:text-[#b6b5b5]">CLEAR</Text>
                </View>
            </View>
     
        ) : null }

        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={renderSuggestions}
        />

      </View>
    </SafeAreaView>
  );
}