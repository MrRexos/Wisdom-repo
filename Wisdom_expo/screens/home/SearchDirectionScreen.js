
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, MapPinIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import {Search, Clock, MapPin, Plus, MoreHorizontal, Edit2} from "react-native-feather";
import axios from 'axios';
import * as Location from 'expo-location';
import RBSheet from 'react-native-raw-bottom-sheet';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';




export default function SearchDirectionScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const route = useRoute();
  const {prevScreen} = route.params;

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);
  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');
  const [location, setLocation] = useState();
  const [historySearchedDirections, setHistorySearchedDirections] = useState([]);
  
  const sheet = useRef();
  const [userId, setUserId] = useState();
  const [showDirections, setShowDirections] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(630);
  const [directions, setDirections] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [addressId, setAddressId] = useState();
  const [blurVisible, setBlurVisible] = useState(false);

  useEffect(() => {
    if (route.params && route.params.blurVisible !== undefined) {
      setBlurVisible(true);
    }
  }, [route.params]);

  const handleClearText = () => {
    setSearchText('');
  };

  const handleSearch = (text) => {
    setSearchText(text);
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

  const fetchPlaceDetails = async (placeId) => {
    try {
      const placeDetailsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`, {
          params: {
            place_id: placeId, 
            key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
            language: 'en',
          },
        }
      );

      const result = placeDetailsResponse.data.result;
      const addressComponents = result.address_components;

      // Obtener latitud y longitud (location.lat i location.lng)
      setLocation(result.geometry.location);

      // Mapea los valores correspondientes
      const country = addressComponents.find(component => component.types.includes('country'))?.long_name || '';
      const state = addressComponents.find(component => component.types.includes('administrative_area_level_1'))?.long_name || '';
      const city = addressComponents.find(component => component.types.includes('locality'))?.long_name || '';
      const street = addressComponents.find(component => component.types.includes('route'))?.long_name || '';
      const streetNumber = addressComponents.find(component => component.types.includes('street_number'))?.long_name || '';
      const postalCode = addressComponents.find(component => component.types.includes('postal_code'))?.long_name || '';
      const sublocality = addressComponents.find(component => component.types.includes('sublocality'))?.long_name || '';
      const premise = addressComponents.find(component => component.types.includes('premise'))?.long_name || '';
      const subpremise = addressComponents.find(component => component.types.includes('subpremise'))?.long_name || '';

      // Construir address2 con los componentes adicionales 
      let address2 = [];

      if (sublocality) address2.push(sublocality);
      if (premise) address2.push(premise);
      if (subpremise) address2.push(subpremise);

      address2 = address2.join(', ');

      // Actualiza los estados con los valores obtenidos
      setCountry(country);
      setState(state);
      setCity(city);
      setStreet(street);
      setStreetNumber(streetNumber);
      setPostalCode(postalCode);
      setAddress2(address2);

      openSheetWithInput(false);

    } catch (error) {
      console.error('Error fetching place details with input:', error);
    }
  }

  const fetchPlaceWithInput = async (input) => {
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
      fetchPlaceDetails(response.data.results[0].place_id);
    } catch (error) {
      console.error('Error fetching place details with input:', error);
    }
  };

  const saveHistorySearchedDirection = async (newDirection) => {
    try {
        let history = await getDataLocally('historySearchedDirections');
        history = history ? JSON.parse(history) : [];

        // Verificar si la dirección ya existe en el historial
        const exists = history.some(direction => JSON.stringify(direction) === JSON.stringify(newDirection));

        if (!exists) {
            if (history.length >= 5) {
                history.shift(); // Eliminar la dirección más antigua
            }

            history.push(newDirection);
            await storeDataLocally('historySearchedDirections', JSON.stringify(history));
        }
    } catch (error) {
        console.error('Error saving direction history:', error);
    }
};

  const getHistorySearchedDirections = async () => {
    try {
      const history = await getDataLocally('historySearchedDirections');  
      const locationSuggestion = {
        description: 'Your location',
        place_id: 'your_location',
      };
      const parsedHistory = history ? JSON.parse(history) : [];
      setHistorySearchedDirections([locationSuggestion, ...parsedHistory]);
    } catch (error) {
      console.error('Error retrieving direction history:', error);
    }
  };

  const handleConfirm = async () => {

    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);

    if (isEditing) {

      try {
        const response = await api.put(`/api/address/${addressId}`,{
          address_type:address2 ? 'flat' : 'house', 
          street_number:streetNumber, 
          address_1:street, 
          address_2:address2, 
          postal_code:postalCode, 
          city:city, 
          state:state, 
          country:country
        });

        const searchedDirection = {location, country, state, city, address_1: street, street_number :streetNumber, postal_code: postalCode, address_2: address2}
        await storeDataLocally('searchedDirection', JSON.stringify(searchedDirection));
        navigation.navigate(prevScreen, {blurVisible});

      } catch (error) {
        console.error('Error updating address:', error);
      }

    } else {

      try {
        const response = await api.post(`/api/directions`,{
          user_id:user.id, 
          address_type:address2 ? 'flat' : 'house', 
          street_number:streetNumber, 
          address_1:street, 
          address_2:address2, 
          postal_code:postalCode, 
          city:city, 
          state:state, 
          country:country
        });

        const searchedDirection = {location, country, state, city, address_1: street, street_number :streetNumber, postal_code: postalCode, address_2: address2}
        await storeDataLocally('searchedDirection', JSON.stringify(searchedDirection));
        console.log(blurVisible)
        navigation.navigate(prevScreen, {blurVisible});

      } catch (error) {
        console.error('Error fetching directions:', error);
      }

    };
    
  };

  const handleDirectionSelected = async (searchedDirection) => {
  
    await storeDataLocally('searchedDirection', JSON.stringify(searchedDirection));
  
    navigation.navigate(prevScreen, { blurVisible });
  };

  const clearHistory = async () => {
    await storeDataLocally('historySearchedDirections', JSON.stringify([]));
    getHistorySearchedDirections();
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
            radius: 50,  // Radio de búsqueda en metros
            key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
            language: 'en',
          },
        }
      );
  
      fetchPlaceDetails(response.data.results[0].place_id);  // El primer lugar cercano
      
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
    } else {
      getHistorySearchedDirections();
    }
  }, [searchText]);

  const renderSuggestions = ({ item }) => (
    <TouchableOpacity className="pb-7 flex-row justify-between items-center" onPress={() => {
      if (searchText.length>0) {

        if (item.place_id==='your_location') {
          fetchPlaceDetailsWithLocation();
        } else {
          saveHistorySearchedDirection(item);
          fetchPlaceDetails(item.place_id);
        }
      } else {
        if (item.place_id==='your_location') {
          fetchPlaceDetailsWithLocation();
        } else {
          fetchPlaceDetails(item.place_id);
        }
      }
    }}>
        <View className="flex-row justify-start items-center">
          <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            {item.place_id==='your_location'? 
            <MapPinIcon height={21} color={iconColor} strokeWidth="1.7"/> : 
            searchText.length>0? <Search height={17} color={iconColor} strokeWidth="2"/> : 
            <Clock height={19} color={iconColor} strokeWidth="2"/>}
          </View>
          <Text className="ml-4 text-[15px] text-[#444343] dark:text-[#f2f2f2]">{item.description}</Text>
        </View>  
        <ChevronRightIcon size={18} color={colorScheme === 'dark' ? '#706F6E' : '#b6b5b5'} strokeWidth="2.5" className="p-6"/>
    </TouchableOpacity>
  );

  const fetchDirections = async () => {

    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);

    try {
      const response = await api.get(`/api/directions/${user.id}`);
      setDirections(response.data.directions)
      return response.data.directions;
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const openSheetWithInput = async (mode) => {

    if (mode) {
      setShowDirections(true)
      await fetchDirections();
      setSheetHeight(350);
    } else {
      setShowDirections(false)
      setSheetHeight(630)
    };
    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
  };
  

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => setShowDirections(false)}
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
          
           
          {showDirections? (
            <View className="flex-1 w-full justify-start items-center pt-5 pb-5 ">

              <View className="px-7 flex-row w-full justify-between items-center ">
                <Text className="text-center font-inter-semibold text-[20px] text-[#444343] dark:text-[#f2f2f2] ">Your directions</Text>
                <TouchableOpacity onPress={() => openSheetWithInput(false)} className=" justify-center items-end">
                  <Plus height={23} width={23} strokeWidth={1.7} color={iconColor} className="" />
                </TouchableOpacity>
              </View>

              {(!directions || directions.length<1)? (

                <View className="mt-[80] justify-center items-center">
                  <MapPin height={30} width={30} strokeWidth={1.7} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                  <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
                    No directions found
                  </Text>
                </View>

                ) : (

                  <ScrollView showsVerticalScrollIndicator={false} className="w-full">

                  <View className="flex-1 px-6 mt-10 ">
                    {directions.map((direction) => (
                      <View key={direction.direction_id} className="pb-5 mb-5 flex-row w-full justify-center items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
                        
                        <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                          <MapPin height={22} width={22} strokeWidth={1.6} color={iconColor} />
                        </View>

                        <TouchableOpacity
                          onPress={async () => {
                            const searchedDirection = {
                              location: direction.location,
                              country: direction.country,
                              state: direction.state,
                              city: direction.city,
                              address_1: direction.address_1,
                              street_number: direction.street_number,
                              postal_code: direction.postal_code,
                              address_2: direction.address_2,
                            };
                        
                            // Cerrar el sheet
                            sheet.current.close();
                        
                            // Pasar el objeto a handleDirectionSelected
                            handleDirectionSelected(searchedDirection);
                          }}
                          className="pl-4 pr-3 flex-1 justify-center items-start">

                          <Text numberOfLines={1} className="mb-[6] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                            {[direction.address_1, direction.street_number].filter(Boolean).join(', ')}
                          </Text>
                          <Text numberOfLines={1} className="font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
                            {[direction.postal_code, direction.city, direction.state, direction.country].filter(Boolean).join(', ')}
                          </Text>
                        </TouchableOpacity>

                        <View className="h-full justify-start items-center ml-5">
                          <TouchableOpacity onPress={() => { 
                            setCountry(direction.country);
                            setState(direction.state);
                            setCity(direction.city);
                            setStreet(direction.address_1);
                            setStreetNumber(direction.street_number);
                            setPostalCode(direction.postal_code);
                            setAddress2(direction.address_2);
                            setIsEditing(true);
                            setAddressId(direction.address_id);
                      
                            openSheetWithInput(false);}}>

                            <Edit2 height={18} width={18} strokeWidth={1.7} color={iconColor} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                  </ScrollView>
                )}

            </View>
          ) : (        
            <ScrollView>      
            <View className="flex-1 w-full justify-start items-center pt-3 pb-5 px-5"> 

            <View className="justify-between items-center mb-10">                  
                <Text className="text-center font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Confirm your direction</Text>
            </View>
              
            <View className="w-full h-[55] mx-2 mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {country && country.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">Country/region</Text>
              ) : null}              
              <TextInput
                placeholder='Country/region...'
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputCountryChanged} 
                value={country || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />            
            </View>

            <View className="w-full h-[55] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {state && state.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">State</Text>
              ) : null}              
              <TextInput
                placeholder='State...'
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputStateChanged} 
                value={state || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>

            <View className="w-full h-[55] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {city && city.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">City/town</Text>
              ) : null}              
              <TextInput
                placeholder='City/town...'
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputCityChanged} 
                value={city || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>

            <View className="w-full h-[55] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              {street && street.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">Street</Text>
              ) : null}              
              <TextInput
                placeholder='Street...'
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputStreetChanged} 
                value={street || ''}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
              />
            </View>
            <View className="flex-row w-full justify-between items-center">

              <View className="flex-1 h-[55] mr-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {postalCode && postalCode.length>0? (
                  <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">Postal code</Text>
                ) : null}              
                <TextInput
                  placeholder='Postal code...'
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={inputPostalCodeChanged} 
                  value={postalCode || ''}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
                />
              </View>

              <View className="flex-1 h-[55] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {streetNumber && String(streetNumber).length>0? (
                  <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">Street number</Text>
                ) : null}   
                <TextInput
                  placeholder='Street number...'
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

            

            <View className="w-full h-[55] mx-2 mb-10 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              { address2 && address2.length>0? (
                <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">Floor, door, stair (optional)</Text>
              ) : null}              
              <TextInput
                placeholder='Floor, door, stair (optional)...'
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
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Confirm</Text>
            </TouchableOpacity>

          </View> 
          </ScrollView>  
          )} 
          
      </RBSheet>

      <View className="px-5 pt-4 flex-1">

        <View className="flex-row justify-start items-center mb-5">

            <TouchableOpacity onPress={() => navigation.navigate(prevScreen, {blurVisible})}>
                <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6"/>
            </TouchableOpacity>

            <View className="h-[55] ml-4 pl-3 pr-1 flex-1 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                
                <Search height={20} color={iconColor} strokeWidth="2"/>
                <TextInput 
                placeholder='Search a direction...' 
                autoFocus={true} 
                selectionColor={cursorColorChange} 
                placeholderTextColor={placeHolderTextColorChange} 
                onChangeText={handleSearch} 
                value={searchText}
                onSubmitEditing={() => fetchPlaceWithInput(searchText)}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}             
                className="flex-1 px-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]"/>

              {searchText.length>0 ? (
                <TouchableOpacity onPress={handleClearText}>
                    <View className='mr-2 h-[25] w-[25] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                        <XMarkIcon height={17} color={iconColor} strokeWidth="2"/>
                    </View>
                </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => {setShowDirections(true); openSheetWithInput(true)}} className="rounded-full px-3 py-4 bg-[#fcfcfc] dark:bg-[#323131]">
                    <MapPin height={17} color={iconColor} strokeWidth="1.8"/>
                  </TouchableOpacity>
                )}

            </View>  
        </View>

        {searchText.length<1  ? (
          
            <View className="mb-6 flex-row justify-between items-center">
                <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Recent searches</Text>
                {historySearchedDirections.length>1? (
                <TouchableOpacity onPress={() => clearHistory()} className="px-3 py-2 rounded-full justify-center items-center bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                  <Text className="font-inter-semibold text-[10px] text-[#706f6e] dark:text-[#b6b5b5]">CLEAR</Text>
                </TouchableOpacity>)
                : null}
                
            </View>
     
        ) : null }

        <FlatList
          data={searchText.length<1 ? historySearchedDirections : suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={renderSuggestions}
        /> 

      </View>
    </SafeAreaView>
  );
}