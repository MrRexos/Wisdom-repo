
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, TouchableWithoutFeedback, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Plus, Info, Phone, FileText, Flag, X, Check, Calendar as CalendarIcon, Edit3, Clock, MapPin, Edit2, AlertCircle, AlertTriangle, CreditCard} from "react-native-feather";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus'; 



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
  const [refreshing, setRefreshing] = useState(false);
  
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

  const [description, setDescription] = useState('');
  const maxLength = 1000;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState();
  const [showPicker, setShowPicker] = useState(false);



  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  const formatCurrency = (value, currency = 'EUR') => {
    if (value === null || value === undefined) return '';
    const symbol = currencySymbols[currency] || '€';
    const numeric = parseFloat(value);
    const formatted =
      numeric % 1 === 0 ? numeric.toFixed(0) : numeric.toFixed(1);
    return `${formatted.replace('.', ',')} ${symbol}`;
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            setStartDate(bookingStartDate);
            setDuration(bookingDuration);
            setStartTime(bookingStartTime);
            setTimeUndefined(bookingDateUndefined);
            console.log(bookingStartDate);

            setSelectedDay(bookingStartDate);
            setSelectedDate({ bookingStartDate });
            setSelectedTime(bookingStartTime);
            setSelectedTimeUndefined(bookingDateUndefined);

            const userData = await getDataLocally('user');
            const user = JSON.parse(userData);
            setUserId(user.id);

            fetchDirections();
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    };
    loadSearchedDirection();
    fetchData();
  }, []);


  const getFormattedPrice = () => {
    const numericPrice = parseFloat(serviceData.price);
    const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
    if (serviceData.price_type === 'hour') {
      return (
        <>
          <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[serviceData.currency]}</Text>
          <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">{t('per_hour')}</Text>
        </>
      );
    } else if (serviceData.price_type === 'fix') {
      return (
        <>
          <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">{t('fixed_price_prefix')}</Text>
          <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[serviceData.currency]}</Text>
        </>
      );
    } else {
      return <Text className="font-inter-bold text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">{t('price_on_budget')}</Text>;
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
    if (Platform.OS==='android'){
      setShowPicker(false)
    }
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

  const loadPaymentMethod = async () => {
    
    const PaymentMethodRaw = await getDataLocally('paymentMethod');
    if (PaymentMethodRaw) {
      paymentMethodData = JSON.parse(PaymentMethodRaw);
      setPaymentMethod(paymentMethodData);
      
    }
  };

  const removePaymentMethod = async () => {
    try {
      await AsyncStorage.removeItem('paymentMethod');
    } catch (error) {
      console.error('Error al eliminar paymentMethod:', error);
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
      loadPaymentMethod();
      removePaymentMethod();
      
    }, [])
  );

  const openSheetWithInput = (height) => {
    
    setSheetHeight(height);

    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
  };

  const fetchDirections = async () => {

    try {
      const response = await api.get(`/api/directions/${userId}`);
      setDirections(response.data.directions)
      return response.data.directions;
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const refreshData = async () => {
    await fetchDirections();
  };

  useRefreshOnFocus(refreshData);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
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

  const inputDescriptionChanged = (text) => {
    setDescription(text);
  };

  const handleClearText = () => {
    setDescription('');
  };

  const combineDateTime = () => {

    let startDateTime = `${startDate}T${startTime}:00`;

    return startDateTime;
  }

  const calculateEndDateTime = () => {
    let startDateTime = new Date(`${startDate}T${startTime}:00`); // Convertir a objeto Date

    // Sumar la duración en minutos
    startDateTime.setMinutes(startDateTime.getMinutes() + duration);

    const pad = (n) => String(n).padStart(2, '0');
    const endDate = `${startDateTime.getFullYear()}-${pad(
      startDateTime.getMonth() + 1
    )}-${pad(startDateTime.getDate())}`;
    const endTime = `${pad(startDateTime.getHours())}:${pad(
      startDateTime.getMinutes()
    )}:${pad(startDateTime.getSeconds())}`;

    return `${endDate} ${endTime}`;
  }

  const calculateCommission = (basePrice) => {
    const commission = parseFloat((basePrice * 0.1).toFixed(1));
    return commission < 1 ? 1 : commission;
  };

  const calculateFinalPrice = () => {
    let final_price = null;

    const durationInHours = duration / 60;

    if (serviceData.price_type === 'hour') {
      const basePrice = parseFloat(serviceData.price) * durationInHours;
      final_price = (basePrice + calculateCommission(basePrice)).toFixed(1);
    } else if (serviceData.price_type === 'fix') {
      const basePrice = parseFloat(serviceData.price);
      final_price = (basePrice + calculateCommission(basePrice)).toFixed(1);
    }

    return final_price;
  }

  const calculateCommissionAmount = () => {
    let commission = null;
    const durationInHours = duration / 60;

    if (serviceData.price_type === 'hour') {
      const basePrice = parseFloat(serviceData.price) * durationInHours;
      commission = calculateCommission(basePrice);
    } else if (serviceData.price_type === 'fix') {
      const basePrice = parseFloat(serviceData.price);
      commission = calculateCommission(basePrice);
    }

    return commission;
  };

  const createBooking = async () => {

    try {
      const response = await api.post('/api/bookings', {
        user_id: userId,
        address_type: direction? direction.address_2? 'house' : 'flat': null,
        street_number: direction? direction.street_number : null,
        address_1: direction? direction.address_1 : null,
        address_2: direction? direction.address_2 : null,
        postal_code: direction? direction.postal_code : null,
        city: direction? direction.city : null,
        state: direction? direction.state : null,
        country: direction? direction.country : null,
        service_id: serviceData.service_id,
        booking_start_datetime: startDate && startTime? combineDateTime() : null,
        booking_end_datetime: duration && startDate && startTime? calculateEndDateTime() : null,
        recurrent_pattern_id:null,
        promotion_id:null,
        service_duration:duration? parseInt(duration) : null,
        final_price: calculateFinalPrice(),
        commission: calculateCommissionAmount(),
        description: description? description:null
      });

      return response.data;
  
    } catch (error) {

      console.error('Error message:', error.message);
   
    }
  };

  const handleBook = async () => {
    if (!paymentMethod) {
      navigation.navigate('PaymentMethod', { origin: 'Booking', prevParams: route.params });
      return;
    }
    try {
      const result = await createBooking();
      console.log(result);
      const booking = result.booking;
      if (!booking || !booking.id) return;
      const res = await api.post(`/api/bookings/${booking.id}/deposit`);
      const clientSecret = res.data.clientSecret;
      navigation.navigate('PaymentMethod', {
        clientSecret,
        onSuccess: 'ConfirmPayment',
        bookingId: booking.id,
        origin: 'Booking',
        paymentMethodId: paymentMethod.id,
        prevParams: route.params,
      });
    } catch (e) {
      console.error('Booking payment error:', e);
    }
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
                <Text className="text-center font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('select_a_date')}</Text>
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
                  <TouchableOpacity onPress={()=> setShowPicker(true)}>
                  <Text className="ml-3 mb-2 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('start_time')}</Text>
                  </TouchableOpacity>

                  {showPicker && (
                  <DateTimePicker
                    value={tempDate}
                    mode="time" // Cambia a modo hora
                    display="spinner" // Puede ser 'default', 'spinner', 'clock', etc.
                    onChange={handleHourSelected}
                    style={{ width: 320, height: 150 }} // Puedes ajustar el estilo como prefieras
                  />
                  )}
                </View>
                
                <View className="mt-6 mb-10 w-full px-6 ">

                  <Text className="ml-3 mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('duration')}: {formatDuration(selectedDuration)}</Text>

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

                  <Text className="ml-3 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('undefined_time')}</Text>

                </View> 

                <View className="mt-6 pb-3 px-6 flex-row justify-center items-center ">

                  <TouchableOpacity
                    disabled={!(selectedDay && selectedTime && selectedDuration) && !selectedTimeUndefined}
                    onPress={() => {sheet.current.close()} }
                    style={{ opacity: !(selectedDay && selectedTime && selectedDuration) && !selectedTimeUndefined? 0.5 : 1 }}
                    className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17px] rounded-full items-center justify-center"
                  >
                    <Text>
                      <Text className="text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                        {t('accept')}
                      </Text>
                    </Text>
                  </TouchableOpacity>

                </View>

                <View className="h-[20px]"/>

              </ScrollView>
              
            </View>

          ) : sheetOption==='directions'? (

            <View className="flex-1 w-full justify-start items-center pt-5 pb-5 ">

              <View className="px-7 flex-row w-full justify-between items-center ">
                <Text className="text-center font-inter-semibold text-[20px] text-[#444343] dark:text-[#f2f2f2] ">{t('your_directions')}</Text>
                <TouchableOpacity onPress={() =>{ sheet.current.close(); navigation.navigate('SearchDirectionAlone', {prevScreen:'Booking'})}} className=" justify-center items-end">
                  <Plus height={23} width={23} strokeWidth={1.7} color={iconColor} className="" />
                </TouchableOpacity>
              </View>

              {(!directions || directions.length<1)? (

                <View className="mt-[80px] justify-center items-center">
                  <MapPin height={30} width={30} strokeWidth={1.7} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                  <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
                    {t('no_directions_found')}
                  </Text>
                </View>

                ) : (

                  <ScrollView showsVerticalScrollIndicator={false} className="w-full">

                  <View className="flex-1 px-6 mt-10 ">
                    {directions.map((direction) => (
                      <TouchableOpacity onPress={() => {setDirection(direction); sheet.current.close(); console.log(direction)}} key={direction.direction_id} className="pb-5 mb-5 flex-row w-full justify-center items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
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
                
              <View className="w-full h-[55px] mx-2 mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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

              <View className="w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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

              <View className="w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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

              <View className="w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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

                <View className="flex-1 h-[55px] mr-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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

                <View className="flex-1 h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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



              <View className="w-full h-[55px] mx-2 mb-10 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
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
                  className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                      <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Confirm</Text>
              </TouchableOpacity>

              </View> 
            </ScrollView>

          )}

          



      </RBSheet>

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[100px] w-full z-10 justify-end">
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

      <View className="h-[70px] w-full justify-end"/>

      <ScrollView showsVerticalScrollIndicator={false}  className="flex-1 px-3" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>


        {/* Profile */}
        <View className=" p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          <View className="flex-row">
            <Image source={serviceData.profile_picture ? { uri: serviceData.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[85px] w-[85px] bg-[#706B5B] rounded-xl" />
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
                      <Text className="ml-[3px]">
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
            <TouchableOpacity onPress={() => {openSheetWithInput(700); setSheetOption('date'); setShowPicker(true)}}>
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
                  {t('undefined_time')}
                </Text>
              </View>
              
            )}

          </View>

        </View>

        {/* Direccion */}

        <View className="mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Address</Text>
            <TouchableOpacity onPress={() => {openSheetWithInput(350); fetchDirections(); setSheetOption('directions')}}>
              <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {direction && Object.keys(direction).length > 0?  (

          <View className="mt-4 flex-row justify-center items-center">

            <View className="w-11 h-11 items-center justify-center">
              <MapPin height={25} width={25} strokeWidth={1.6} color={iconColor} />
            </View>

            <View className="pl-3 pr-3 flex-1 justify-center items-start">
              <Text numberOfLines={1} className="mb-[6px] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                {[direction.address_1, direction.street_number].filter(Boolean).join(', ')}
              </Text>
              <Text numberOfLines={1} className="font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
                {[direction.postal_code, direction.city, direction.state, direction.country].filter(Boolean).join(', ')}
              </Text>
            </View>

          </View>

          ) : (

            <View className="mt-1 flex-1 justify-center items-center">
              <MapPin height={40} width={40} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
              <Text className="mt-4 font-inter-semibold text-[16px] text-[#979797]">
                Location not selected
              </Text>
            </View>
            
          )}


        </View>

        {/* Precio */}

        <View className="mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          
          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Price details</Text>
          </View>
          

          <View className="mt-5 px-3 flex-1">
              <View className="flex-1 justify-center items-center">
                {/* Verificación del tipo de precio */}
                {serviceData.price_type === 'hour' && (
                  <>
                    <View className="flex-row">
                      <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">
                        Service price x {(duration / 60).toFixed(0)}h
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]">
                        {(parseFloat(serviceData.price) * (duration / 60)).toFixed(0)} €
                      </Text>
                    </View>

                    <View className="mt-3 flex-row">
                      <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">
                        Quality commission
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]">
                        {formatCurrency(calculateCommission(parseFloat(serviceData.price) * (duration / 60)), serviceData.currency)}
                      </Text>
                    </View>

                    <View className="w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]"></View>

                    <View className="mt-4 flex-row">
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        Final price
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        {formatCurrency(parseFloat(serviceData.price) * (duration / 60) + calculateCommission(parseFloat(serviceData.price) * (duration / 60)), serviceData.currency)}
                      </Text>
                    </View>

                    <View className="mt-4 flex-row">
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        Deposit
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        {formatCurrency(calculateCommission(parseFloat(serviceData.price) * (duration / 60)), serviceData.currency)}
                      </Text>
                    </View>
                  </>
                )}

                {serviceData.price_type === 'fix' && (
                  <>
                    <View className="flex-row">
                      <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">
                        Fixed price
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]">
                        {parseFloat(serviceData.price).toFixed(0)} €
                      </Text>
                    </View>

                    <View className="mt-3 flex-row">
                      <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">
                        Quality commission
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]">
                        {formatCurrency(calculateCommission(parseFloat(serviceData.price)), serviceData.currency)}
                      </Text>
                    </View>

                    <View className="w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]"></View>

                    <View className="mt-4 flex-row">
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        Final price
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        {formatCurrency(parseFloat(serviceData.price) + calculateCommission(parseFloat(serviceData.price)), serviceData.currency)}
                      </Text>
                    </View>

                    <View className="mt-4 flex-row">
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        Deposit
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        {formatCurrency(1, serviceData.currency)}
                      </Text>
                    </View>
                  </>
                )}

                {serviceData.price_type === 'budget' && (
                  <>
                    <View className="flex-row">
                      <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">
                        Service price
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]">
                        budget
                      </Text>
                    </View>

                    <View className="mt-3 flex-row">
                      <Text className="font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">
                        Deposit
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]">
                        {formatCurrency(1, serviceData.currency)}
                      </Text>
                    </View>

                    <View className="w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]"></View>

                    <View className="mt-4 flex-row">
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        Final price
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                      >
                        {'.'.repeat(80)}
                      </Text>
                      <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                        {formatCurrency(1, serviceData.currency)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
          </View>


        </View>

        {/* Payment Method */}

        <View className="mt-8 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          
          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Payment method</Text>
            {paymentMethod && (
              <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod', { origin: 'Booking', prevParams: route.params })}>
                <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>
          

          <View className="mt-4 flex-1">

            {paymentMethod?  (
              <View className="flex-1 my-3 justify-center items-center ">


                <View className="px-7 pb-5 pt-[50px] bg-[#EEEEEE] dark:bg-[#111111] rounded-xl">

                  <Text>
                    <Text className="font-inter-medium text-[16px] text-[#444343] dark:text-[#f2f2f2]">••••   ••••   ••••   </Text>
                    <Text className='font-inter-medium text-[13px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.last4}</Text>
                  </Text>

                  <View className="mt-6 flex-row justify-between items-center">

                    <View className="flex-row items-center">                  
                      <View className="justify-center items-center">
                        <Text className='font-inter-medium text-[12px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.expiryMonth}/{paymentMethod.expiryYear}</Text>
                      </View>
                    </View>

                    <View className="h-5 w-8 bg-[#fcfcfc] dark:bg-[#323131] rounded-md"/>

                  </View>
                  
                </View>


              </View>
            ) : (

              <View className="mt-1 flex-1 justify-center items-center">
                <CreditCard height={55} width={55} strokeWidth={1.3} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />

                <View className="flex-row justify-center items-center px-6">

                  <TouchableOpacity
                    onPress={() => navigation.navigate('PaymentMethod', { origin: 'Booking', prevParams: route.params }) }
                    style={{ opacity: 1 }}
                    className="bg-[#706f6e] my-2 mt-3 dark:bg-[#b6b5b5] w-full py-[14px] rounded-full items-center justify-center"
                  >
                    <Text>
                      <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                        {t('add_credit_card')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
                
                

              </View>
              
            )}

          </View>

        </View>

        {/* Descripcion */}

        <View className="mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">
          
          <View className="w-full flex-row justify-between items-center ">
            <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('booking_description')}</Text>
          </View>
          

          <View className="flex-1 w-full mt-6">
            <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View className="w-full min-h-[150px] bg-[#f2f2f2] dark:bg-[#272626] rounded-2xl py-4 px-5 ">

              {description.length > 0 ? (
              <View className="flex-row justify-end">
                <TouchableOpacity onPress={handleClearText} className="">
                  <Text className="mb-1 font-inter-medium text-[13px] text-[#d4d4d3] dark:text-[#474646]">{t('clear')}</Text>
                </TouchableOpacity>
              </View>
              ) : null }

              <TextInput
                placeholder={t('description_placeholder')}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                onChangeText={inputDescriptionChanged}
                value={description}
                ref={inputRef}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="w-full text-[15px] text-[#515150] dark:text-[#d4d4d3]"
                multiline
                maxLength={maxLength}
                style={{ textAlignVertical: 'top' }}
              />
            </View>
            </TouchableWithoutFeedback>
            
            {/* Contador de palabras */}
            <View className="w-full flex-row justify-end">
              <Text className="pt-2 pr-2 font-inter-medium text-[12px] text-[#979797] dark:text-[#979797]">{description.length}/{maxLength}</Text>
            </View>
            {isKeyboardVisible && (
            <View className="h-[200px]"></View>
            )}

          </View>

        </View>

        {/* Others */} 

        <View className="mt-8 px-2  justify-center items-start pb-7">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('others')}</Text>

          <TouchableOpacity className="mb-3  flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
              <WisdomLogo  width={23} height={23} color={iconColor}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('operation_of_the_reserves')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
              <XCircleIcon  width={24} height={24} color={iconColor} strokeWidth={1.6}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('cancellation_policy')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
              <AlertTriangle  width={22} height={22} color={iconColor} strokeWidth={1.6}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('follow_the_rules')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
              <Phone  width={22} height={22} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('contact_wisdom')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>


        </View>

        <View className="h-[70px]"/>

      </ScrollView>

      {/* Button book */}

      <View className="flex-row justify-center items-center pb-3 px-6">

        <TouchableOpacity
          onPress={handleBook}
          style={{ opacity: 1 }}
          className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
        >
          <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
            {paymentMethod ? t('pay') : t('continue_to_payment')}
          </Text>
        </TouchableOpacity>
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

    borderRadius: 4,
  },
});