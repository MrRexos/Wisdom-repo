
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X, Check, Calendar as CalendarIcon, Edit3} from "react-native-feather";
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
  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');
  const isFocused = useIsFocused();
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);

  const [selectedDate, setSelectedDate] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [sliderValue, setSliderValue] = useState(0);
  const sliderTimeoutId = useRef(null);
  const [timeUndefined, setTimeUndefined] = useState(false); 

  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  useEffect(() => {

    selectedDay(bookingStartDate);
    setSelectedDate(bookingStartDate);
    setSelectedTime(bookingStartTime);
    setTimeUndefined(bookingDateUndefined);

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
      setDuration(adjustedValue); // Actualizamos la duración basada en minutos reales
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
  
  const formatDuration = () => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
  
    if (hours > 0 && minutes > 0) {
      return `${hours} h ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${minutes} min`;
    }
  };

  const formatBookingMessage = () => {
    // Validaciones para mostrar mensajes cuando no hay valores seleccionados

    if (timeUndefined===true) {
      return "Book without date";
    } 
    if (!selectedDay && !selectedTime && !duration) {
      return "Select a date, time, and duration";
    } 
    if (!selectedDay) {
      return "Select a date";
    }
    if (!selectedTime) {
      return "Select a time";
    }
    if (!duration) {
      return "Select a duration";
    }
  
    // 1. Crear un objeto Date combinando selectedDay y selectedTime
    const [year, month, day] = selectedDay.split('-'); // Dividimos la fecha "YYYY-MM-DD"
    const [hours, minutes] = selectedTime.split(':'); // Dividimos la hora "HH:mm"
    
    const startTime = new Date(year, month - 1, day, hours, minutes); // Crear el objeto Date
    const formattedDay = startTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }); // Ej: "Friday 25 Oct"
    const formattedTime = startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // Ej: "12:58"
  
    // 2. Calcular la hora de finalización añadiendo la duración
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration); // Añadir la duración en minutos
    const formattedEndTime = endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // Ej: "14:28"
  
    // 3. Calcular el precio basado en el tipo de precio
    let totalPrice = parseFloat(serviceData.price);
    if (serviceData.price_type === 'hour') {
      const hours = duration / 60; // Duración en horas
      totalPrice = serviceData.price * hours;
    }
  
    // 4. Construir el mensaje de reserva final
    const priceLabel = `${totalPrice.toFixed(0)}€`; // Asegurarnos de que el precio tenga dos decimales si es necesario
    return `Book for ${formattedDay} \n ${formattedTime} - ${formattedEndTime} for ${priceLabel}`;
  };

  const getEndTime = () => {
    const endTime = new Date(`1970-01-01T${bookingStartTime}:00`); 

    endTime.setMinutes(endTime.getMinutes() + bookingDuration);

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
      setCountry(searchedDirection.country)
      setState(searchedDirection.state)
      setCity(searchedDirection.city)
      setStreet(searchedDirection.street)
      setPostalCode(searchedDirection.postalCode)
      setStreetNumber(searchedDirection.streetNumber)
      setAddress2(searchedDirection.address2)
    }
  };

  useFocusEffect(
    useCallback(() => {
        loadSearchedDirection();
    }, [isFocused])
  );

  const openSheetWithInput = (height) => {
    
    setSheetHeight(height);

    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
  };





  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>

      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => {setShowAddList(false); setIsAddingDate(false); setSelectedDay(); setSelectedTime(); setDuration(60); setSliderValue(12); setTimeUndefined(false); setSelectedDate() }}
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

                <Text className="ml-3 mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Duration: {formatDuration(duration)}</Text>

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
                  onPress={() => setTimeUndefined(!timeUndefined)} 
                  style={[
                    styles.checkbox, 
                    { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }, 
                    timeUndefined && { 
                      backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', 
                      borderWidth: 0 
                    }
                  ]}
                >
                  {timeUndefined && (
                    <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                  )}
                </TouchableOpacity>

                <Text className="ml-3 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">Undefined time</Text>

              </View> 

              <View className="mt-6 pb-3 px-6 flex-row justify-center items-center ">

                <TouchableOpacity
                  disabled={!(selectedDay && selectedTime && duration) && !timeUndefined}
                  onPress={() => {sheet.current.close(); navigation.navigate('Booking', { serviceData,location, bookingStartDate:selectedDay, bookingStartTime:selectedTime, bookingDuration:duration, bookingDateUndefined:timeUndefined})} }
                  style={{ opacity: !(selectedDay && selectedTime && duration) && !timeUndefined? 0.5 : 1 }}
                  className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17] rounded-full items-center justify-center"
                >
                  <Text>
                    <Text className="text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                      {formatBookingMessage()}
                    </Text>
                  </Text>
                </TouchableOpacity>

              </View>

              <View className="h-[20]"/>



            </ScrollView>



          </View>

          



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

        <View className="mt-8 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          
          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Date and time</Text>
            <TouchableOpacity onPress={() => openSheetWithInput(700)}>
              <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          

          <View className="mt-4 flex-1">

            {!timeUndefined && (
              <View className="flex-1 justify-center items-center">

                <View className="w-full flex-row justify-between items-center">

                  <View className="flex-row justify-start items-center">
                    <CalendarIcon height={15} width={15} color={colorScheme === 'dark' ? '#d4d4d3' : '#515150'} strokeWidth={2.2} />
                    <Text className="ml-1 font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]">{formatDate(selectedDate)}</Text>
                  </View>

                  <View className="justify-end items-center">
                    <Text className="font-inter-semibold text-[14px] text-[#515150] dark:text-[#979797]">{formatDuration()}</Text>
                  </View>

                </View>

                <View className="mt-4 justify-end items-center">
                  <Text className=" font-inter-bold text-[20px] text-[#515150] dark:text-[#979797]">{selectedTime} - {getEndTime()}</Text>
                </View>

              </View>
            )}

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