
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X, Check, Calendar as CalendarIcon, Edit3, Clock, MapPin, Edit2} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import MapView, { Marker, Circle } from 'react-native-maps';
import axios from 'axios'; 
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import { format } from 'date-fns';



export default function BookingScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {serviceData, location, bookingStartDate, bookingStartTime, bookingDuration, bookingDateUndefined} = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [direction, setDirection] = useState({});
  const [directions, setDirections] = useState({});
  const isFocused = useIsFocused();
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);

  const [selectedDate, setSelectedDate] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [sliderValue, setSliderValue] = useState(12);
  const sliderTimeoutId = useRef(null);
  const [selectedTimeUndefined, setSelectedTimeUndefined] = useState(false); 

  const [startDate, setStartDate] = useState();
  const [duration, setDuration] = useState();
  const [startTime, setStartTime] = useState();
  const [timeUndefined, setTimeUndefined] = useState();

  const [sheetOption, setSheetOption] = useState('date');
  const [userId, setUserId] = useState();

  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);



  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  useEffect(() => {

    setStartDate(bookingStartDate);
    setDuration(bookingDuration);
    setStartTime(bookingStartTime);
    setTimeUndefined(bookingDateUndefined);

    setSelectedDay(bookingStartDate);
    setSelectedDate({bookingStartDate});
    setSelectedTime(bookingStartTime);
    setSelectedTimeUndefined(bookingDateUndefined);

    fetchDirections();

  }, []);


  const getFormattedPrice = () => {
    const numericPrice = parseFloat(serviceData.price);
    const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
    if (serviceData.price_type === 'hour') {
      return (
        <>
          <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[serviceData.currency]}</Text>
          <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">/hour</Text>
        </>
      );
    } else if (serviceData.price_type === 'fix') {
      return (
        <>
          <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">Fixed Price: </Text>
          <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[serviceData.currency]}</Text>
        </>
      );
    } else {
      return <Text className="font-inter-bold text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">Price on budget</Text>;
    }
  };

  const formatDate = (dateString) => {
    // Convertir la cadena a un objeto Date
    const date = new Date(dateString);
  
    // Opciones para el formateo
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    
    // Formatear la fecha
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Reemplazar la coma con "of" para cumplir con tu formato deseado
    return formattedDate;
  };

  const onDayPress = (day) => {
    setSelectedDate({
      [day.dateString]: {
        selected: true,
        selectedColor: colorScheme === 'dark' ? '#979797' : '#979797', // Color del fondo del círculo
        selectedTextColor: '#ffffff'
      },
    });
    setSelectedDay(day.dateString);
  };

  const handleHourSelected = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);
    
    // Formatear la hora seleccionada en formato HH:MM
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    
    setSelectedTime(formattedTime); // Guarda la hora seleccionada en el estado
  };

  const handleSliderChange = (value) => {
    // Limpiamos cualquier timeout previo
    if (sliderTimeoutId.current) {
      clearTimeout(sliderTimeoutId.current);
    }
  
    // Establecemos un nuevo timeout para aplicar el valor
    sliderTimeoutId.current = setTimeout(() => {
      const adjustedValue = sliderValueToMinutes(value); // Convertimos el valor del slider a minutos reales
      setSliderValue(value);
      setSelectedDuration(adjustedValue); // Actualizamos la duración basada en minutos reales
    }, 100); // Esperamos 100ms antes de actualizar el estado
  };
  
  const sliderValueToMinutes = (value) => {
    // Mapeamos el valor del slider a minutos según el segmento
    if (value <= 12) {
      return value * 5; // Primer tramo: 0-60 minutos (paso de 5 en 5)
    } else if (value <= 18) {
      return 60 + (value - 12) * 10; // Segundo tramo: 60-120 minutos (paso de 10 en 10)
    } else if (value <= 26) {
      return 120 + (value - 18) * 15; // Tercer tramo: 120-240 minutos (paso de 15 en 15)
    } else {
      return 240 + (value - 26) * 30; // Cuarto tramo: 240-480 minutos (paso de 30 en 30)
    }
  };
  
  const formatDuration = (durationTime) => {
    const hours = Math.floor(durationTime / 60);
    const minutes = durationTime % 60;
  
    if (hours > 0 && minutes > 0) {
      return `${hours} h ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${minutes} min`;
    }
  };

  const getEndTime = () => {
    const endTime = new Date(`1970-01-01T${startTime}:00`); 

    endTime.setMinutes(endTime.getMinutes() + duration);

    const formattedEndTime = endTime.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });

    return formattedEndTime;
  };  

  const loadSearchedDirection = async () => {
    
    const searchedDirectionData = await getDataLocally('searchedDirection');
    if (searchedDirectionData) {
      searchedDirection = JSON.parse(searchedDirectionData);
      setDirection(searchedDirection);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadDirections = async () => {
        const directionList = await fetchDirections();
        setDirections(directionList);
      };
      loadDirections();
      loadSearchedDirection();
    }, [])
  );

  const openSheetWithInput = (height) => {
    
    setSheetHeight(height);

    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
  };

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

      setSheetOption('directions');
      openSheetWithInput(350);

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
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => {setStartDate(selectedDay); setDuration(selectedDuration); setStartTime(selectedTime); setTimeUndefined(selectedTimeUndefined);}}
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


          {sheetOption==='date'? (

            <View className="flex-1 justify-start items-center">

              <View className="mt-4 mb-2 flex-row justify-center items-center">
                <Text className="text-center font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Select a date</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

                <View className="w-full px-6">
                  <Calendar
                    onDayPress={onDayPress}
                    markedDates={selectedDate}
                    firstDay={1}
                    theme={{
                      todayTextColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
                      monthTextColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                      textMonthFontSize: 15,
                      textMonthFontWeight: 'bold',
                      dayTextColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                      textDayFontWeight: 'bold',
                      textInactiveColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                      textSectionTitleColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                      textDisabledColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                      selectedDayBackgroundColor: colorScheme === 'dark' ? '#474646' : '#d4d4d3',
                      selectedDayTextColor: '#ffffff', // Color del texto del día seleccionado
                      arrowColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                      calendarBackground: 'transparent',
                    }}
                    style={{ backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', padding:20, borderRadius:20 }}
                  />
                </View>

                <View className="mt-2 w-full px-6 ">

                  <Text className="ml-3 mb-2 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Start time</Text>
                  
                  <DateTimePicker
                    value={tempDate}
                    mode="time" // Cambia a modo hora
                    display="spinner" // Puede ser 'default', 'spinner', 'clock', etc.
                    onChange={handleHourSelected}
                    style={{ width: 320, height: 150 }} // Puedes ajustar el estilo como prefieras
                  />
                </View>
                
                <View className="mt-6 mb-10 w-full px-6 ">

                  <Text className="ml-3 mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Duration: {formatDuration(selectedDuration)}</Text>

                  <View className="flex-1 px-4 justify-center items-center">      
                    <Slider
                      style={{ width: '100%', height: 10 }} 
                      minimumValue={1} // Ahora el valor mínimo del slider es 0
                      maximumValue={34} // Máximo valor (ajustado para abarcar el rango completo)
                      step={1} // Paso de 1 porque nosotros controlamos el salto
                      thumbImage={thumbImage}
                      minimumTrackTintColor="#b6b5b5"
                      maximumTrackTintColor="#474646"
                      value={sliderValue} // Convertimos los minutos reales al valor del slider
                      onValueChange={handleSliderChange}
                    />
                  </View>
                </View>

                <View className="pl-10 flex-row w-full justify-start  items-center ">
                  
                  <TouchableOpacity
                    onPress={() => setSelectedTimeUndefined(!selectedTimeUndefined)} 
                    style={[
                      styles.checkbox, 
                      { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }, 
                      selectedTimeUndefined && { 
                        backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', 
                        borderWidth: 0 
                      }
                    ]}
                  >
                    {selectedTimeUndefined && (
                      <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                    )}
                  </TouchableOpacity>

                  <Text className="ml-3 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">Undefined time</Text>

                </View> 

                <View className="mt-6 pb-3 px-6 flex-row justify-center items-center ">

                  <TouchableOpacity
                    disabled={!(selectedDay && selectedTime && selectedDuration) && !selectedTimeUndefined}
                    onPress={() => {sheet.current.close()} }
                    style={{ opacity: !(selectedDay && selectedTime && selectedDuration) && !selectedTimeUndefined? 0.5 : 1 }}
                    className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17] rounded-full items-center justify-center"
                  >
                    <Text>
                      <Text className="text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                        Accept
                      </Text>
                    </Text>
                  </TouchableOpacity>

                </View>

                <View className="h-[20]"/>

              </ScrollView>
              
            </View>

          ) : sheetOption==='directions'? (

            <View className="flex-1 w-full justify-start items-center pt-5 pb-5 ">

              <View className="px-7 flex-row w-full justify-between items-center ">
                <Text className="text-center font-inter-semibold text-[20px] text-[#444343] dark:text-[#f2f2f2] ">Your directions</Text>
                <TouchableOpacity onPress={() =>{ sheet.current.close(); navigation.navigate('SearchDirectionAlone')}} className=" justify-center items-end">
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
                      <TouchableOpacity onPress={() => {setDirection(direction); sheet.current.close()}} key={direction.direction_id} className="pb-5 mb-5 flex-row w-full justify-center items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
                        <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                          <MapPin height={22} width={22} strokeWidth={1.6} color={iconColor} />
                        </View>

                        <View className="pl-4 pr-3 flex-1 justify-center items-start">
                          <Text numberOfLines={1} className="mb-[6] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                            {[direction.address_1, direction.street_number].filter(Boolean).join(', ')}
                          </Text>
                          <Text numberOfLines={1} className="font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
                            {[direction.postal_code, direction.city, direction.state, direction.country].filter(Boolean).join(', ')}
                          </Text>
                        </View>

                        <View className="h-full justify-start items-center">
                          <TouchableOpacity onPress={() => { 

                            setSheetOption('edit');
                            setSelectedAddressId(direction.address_id); 
                            setCountry(direction.country);
                            setState(direction.state);
                            setCity(direction.city);
                            setStreet(direction.address_1);
                            setStreetNumber(direction.street_number);
                            setPostalCode(direction.postal_code);
                            setAddress2(direction.address_2);
                            openSheetWithInput(700);}}>

                            <Edit2 height={18} width={18} strokeWidth={1.7} color={iconColor} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
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

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[100] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center mt-8 pb-4 px-2 ">

            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()} className="ml-3">
                    <ChevronLeftIcon size={24} strokeWidth={1.8} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>

            <View className="flex-3 justify-center items-center ">
                <Text className="font-inter-bold text-center text-[18px] text-[#444343] dark:text-[#f2f2f2]">Confirm and Pay</Text>
            </View> 

            <View className="flex-1 h-2 "></View>

        </View>
      </View>

      <View className="h-[70] w-full justify-end"/>

      <ScrollView  className="flex-1 px-3">


        {/* Profile */}
        <View className=" p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          <View className="flex-row">
            <Image source={serviceData.profile_picture ? { uri: serviceData.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[85] w-[85] bg-[#706B5B] rounded-xl" />
            <View className="flex-1">
              <Text className="ml-4 mt-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.service_title}</Text>
              <Text className="ml-4 mt-1 font-inter-semibold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.first_name} {serviceData.surname}</Text>
              <View className="justify-center items-center flex-1">
                <View className="flex-row items-center">
                  <Text className="mr-4">
                    {getFormattedPrice()}
                  </Text>
                  {serviceData.review_count > 0 && (
                    <View className="flex-row items-center">
                      <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                      <Text className="ml-[3]">
                        <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.average_rating).toFixed(1)}</Text>
                        <Text> </Text>
                        <Text className="font-inter-medium text-[10px] text-[#706F6E] dark:text-[#B6B5B5]">({serviceData.review_count === 1 ? `${serviceData.review_count} review` : `${serviceData.review_count} reviews`})</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          
        </View>

        {/* Fecha */}

        <View className="mt-8 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          
          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Date and time</Text>
            <TouchableOpacity onPress={() => {openSheetWithInput(700); setSheetOption('date')}}>
              <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          

          <View className="mt-4 flex-1">

            {!selectedTimeUndefined?  (
              <View className="flex-1 justify-center items-center">

                <View className="w-full flex-row justify-between items-center">

                  <View className="flex-row justify-start items-center">
                    <CalendarIcon height={15} width={15} color={colorScheme === 'dark' ? '#d4d4d3' : '#515150'} strokeWidth={2.2} />
                    <Text className="ml-1 font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]">{formatDate(startDate)}</Text>
                  </View>

                  <View className="justify-end items-center">
                    <Text className="font-inter-semibold text-[14px] text-[#515150] dark:text-[#979797]">{formatDuration(duration)}</Text>
                  </View>

                </View>

                <View className="mt-4 justify-end items-center">
                  <Text className=" font-inter-bold text-[20px] text-[#515150] dark:text-[#979797]">{startTime} - {getEndTime()}</Text>
                </View>

              </View>
            ) : (

              <View className="mt-1 flex-1 justify-center items-center">
                <Clock height={40} width={40} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                <Text className="mt-4 font-inter-semibold text-[16px] text-[#979797]">
                  Undefined time
                </Text>
              </View>
              
            )}

          </View>

        </View>

        {/* Direccion */}

        <View className="mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Address</Text>
            <TouchableOpacity onPress={() => {openSheetWithInput(350); fetchDirections; setSheetOption('directions')}}>
              <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View className="mt-4 flex-row justify-center items-center">

            <View className="w-11 h-11 items-center justify-center">
              <MapPin height={25} width={25} strokeWidth={1.6} color={iconColor} />
            </View>

            <View className="pl-3 pr-3 flex-1 justify-center items-start">
              <Text numberOfLines={1} className="mb-[6] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                {[direction.address_1, direction.street_number].filter(Boolean).join(', ')}
              </Text>
              <Text numberOfLines={1} className="font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
                {[direction.postal_code, direction.city, direction.state, direction.country].filter(Boolean).join(', ')}
              </Text>
            </View>

          </View>


        </View>

      </ScrollView>


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

    borderRadius: 4,
  },
});