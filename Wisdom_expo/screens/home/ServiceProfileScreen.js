
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, Alert, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, XCircleIcon} from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import {Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X, Check} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import MapView, { Marker, Circle } from 'react-native-maps';
import { doc, setDoc, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import axios from 'axios'; 
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import { format } from 'date-fns';




export default function ServiceProfileScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {serviceId, location} = route.params;
  const [serviceData, setServiceData] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [address, setAddress] = useState('');
  const [localHour, setLocalHour] = useState('');
  const [filteredReviews, setFilteredReviews] = useState();
  const [width5, setWidth5] = useState(0);
  const [width4, setWidth4] = useState(0);
  const [width3, setWidth3] = useState(0);
  const [width2, setWidth2] = useState(0);
  const [width1, setWidth1] = useState(0);
  const [isServiceLiked, setIsServiceLiked] = useState(false);
  const [lists, setLists] = useState([]);
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);
  const [userId, setUserId] = useState();
  const [showAddList, setShowAddList] = useState(false);
  const [listName, setListName] = useState('');
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState({});

  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [sliderValue, setSliderValue] = useState(12);
  const sliderTimeoutId = useRef(null);
  const [timeUndefined, setTimeUndefined] = useState(false); 
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const languagesMap = {
    es: 'Spanish',
    en: 'English',
    ca: 'Catalan',
    fr: 'French',
    ar: 'Arabic',
    de: 'German',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    ru: 'Russian',
    it: 'Italian',
    nl: 'Dutch',
    tr: 'Turkish',
    sv: 'Swedish'
  };

  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;


  const verifyRegistered  = async () => {
    const userData = await getDataLocally('user');
    console.log(userData);

    // Comprobar si userData indica que no hay usuario
    if (userData === '{"token":false}') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'GetStarted' }],
      });
    } else {
      const me = JSON.parse(userData);
      if (me.id === serviceData.user_id) {
        Alert.alert(t('cannot_book_own_service'));
        return;
      }
      openSheetWithInput(700); setIsAddingDate(true)
    }

  }


  const getServiceInfo = async () => {
    try {
      const response = await api.get(`/api/service/${serviceId}`, {});
      let service = response.data;
      setServiceData(service);
     
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const refreshData = async () => {
    await getServiceInfo();
  };

  useRefreshOnFocus(refreshData);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: {
                latlng: `${latitude},${longitude}`,
                key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
            },
        });

        if (response.data.status === "OK") {
            const addressComponents = response.data.results[0].address_components;
            const postcode = addressComponents.find(component => component.types.includes("postal_code"))?.long_name;
            const city = addressComponents.find(component => component.types.includes("locality"))?.long_name;
            const country = addressComponents.find(component => component.types.includes("country"))?.long_name;
            return `${postcode} ${city}, ${country}`;
        } else {
            console.error("Error en la geocodificación:", response.data.status);
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la dirección:", error);
        return null;
    }
  }; 
  
  const getTimeZoneFromCoordinates = async (latitude, longitude) => {
    const timestamp = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY`;
    try {
        const response = await axios.get(url);
        if (response.data.status === "OK") {
            const { dstOffset, rawOffset } = response.data;
            const localTime = new Date((timestamp + dstOffset + rawOffset) * 1000);
            return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }); // Devuelve la hora local como una cadena legible
        } else {
            console.error("Error en la respuesta de la API:", response.data);
            return null;
        }
    } catch (error) {
        console.error("Error al obtener la zona horaria:", error);
        return null;
    }
  };

  const fetchLists = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/lists`);
      return response.data;        
    } catch (error) {
      console.error('Error fetching lists:', error);
    } 
  };

  const heartClicked = async (serviceId) => {

    const fetchedLists = await fetchLists();
    if (fetchedLists) {
      setLists(fetchedLists); // Aquí se asignan las listas obtenidas
    }
    openSheetWithInput(450); 
    setIsAddingDate(false); 
    setShowAddList(false);   
  };

  const addItemList = async (listId) => { 
    try {
      const response = await api.post(`/api/lists/${listId}/items`, {
        service_id: serviceId,   
      });
      console.log('Item added:', response.data);
      setIsServiceLiked(true);
      sheet.current.close();

    } catch (error) {
      console.error('Error fetching lists:', error);
    } 
  };

  const createList = async () => { 
    try {
      const response = await api.post('/api/lists', {
        user_id: userId,
        list_name: listName,
      
      });
      console.log('List created:', response.data);
      return response.data.listId

    } catch (error) {
      console.error('Error fetching lists:', error);
    } 
  };

  const handleDone = async () => {
    const listId = createList();
    addItemList(listId)
    sheet.current.close();
  }

  const openSheetWithInput = (height) => {
    
    setSheetHeight(height);

    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
  };

  useEffect(() => {
    getServiceInfo(); 
  }, []);

  useEffect(() => {

    const fetchAddress = async () => {
      if (serviceData.latitude && serviceData.longitude) {
        const addr = await getAddressFromCoordinates(serviceData.latitude, serviceData.longitude);
        setAddress(addr);

        const hour = await getTimeZoneFromCoordinates(serviceData.latitude, serviceData.longitude);
        setLocalHour(hour); 
      }
    };

    const getCommentedReviews = () => {
      if (serviceData.reviews) {
      const filteredCommentReviews = serviceData.reviews.filter(review => review.comment);
      setFilteredReviews(filteredCommentReviews)
      }
      if (serviceData.reviews) {
        setWidth5(Math.min((serviceData.rating_5_count / serviceData.reviews.length) * 100, 100));
        setWidth4(Math.min((serviceData.rating_4_count / serviceData.reviews.length) * 100, 100));
        setWidth3(Math.min((serviceData.rating_3_count / serviceData.reviews.length) * 100, 100));
        setWidth2(Math.min((serviceData.rating_2_count / serviceData.reviews.length) * 100, 100));
        setWidth1(Math.min((serviceData.rating_1_count / serviceData.reviews.length) * 100, 100));
      } else {
        setWidth5(0);
        setWidth4(0);
        setWidth3(0);
        setWidth2(0);
        setWidth1(0);
      }
    }

    getCommentedReviews();
    fetchAddress(); 

  }, [serviceData]);

  const formatLanguages = (languagesArray) => {
    const languageNames = languagesArray.map(lang => languagesMap[lang] || lang);
    if (languageNames.length > 1) {
      return `${languageNames.slice(0, -1).join(', ')} and ${languageNames[languageNames.length - 1]}`;
    }
    return languageNames[0];
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    
    // Opciones para el formato de la fecha
    const options = {
        year: 'numeric',
        month: 'long', // Puedes usar 'numeric' para obtener el mes como número
        day: 'numeric',
    };
    
    // Formatea la fecha a una cadena legible
    return date.toLocaleString('en-US', options);
  };

  const onTextLayout = useCallback(
    (e) => {
      if (e.nativeEvent.lines.length > 3 ) {
        setShowMoreButton(true);
      } else {
        setShowMoreButton(false);
      }
    },
    []
  );

  const inputListNameChanged  = (text) => {
    setListName(text);
  };

  const handleClearText = () => {
    setListName('');
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
      return t('book_without_date');
    }
    if (!selectedDay && !selectedTime && !duration) {
      return t('select_date_time_and_duration');
    }
    if (!selectedDay) {
      return t('select_a_date');
    }
    if (!selectedTime) {
      return t('select_a_time');
    }
    if (!duration) {
      return t('select_a_duration');
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
  
  const startChat = async () => {
    try {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const me = JSON.parse(userData);
      const otherId = serviceData.user_id;
      if (!otherId) return;
      if (otherId === me.id) {
        Alert.alert(t('cannot_write_to_yourself'));
        return;
      }
      const participants = [me.id, otherId];
      const conversationId = [...participants].sort().join('_');
      const data = {
        participants,
        updatedAt: serverTimestamp(),
      };
      if (serviceData.first_name && serviceData.surname) {
        data.name = `${serviceData.first_name} ${serviceData.surname}`;
      } else if (serviceData.service_title) {
        data.name = serviceData.service_title;
      }
      await setDoc(
        doc(db, 'conversations', conversationId),
        { ...data, deletedFor: arrayRemove(me.id) },
        { merge: true }
      );
      navigation.navigate('Conversation', {
        conversationId,
        participants,
        name: data.name,
      });
    } catch (err) {
      console.error('startChat error:', err);
    }
  };
  


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
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


          {isAddingDate===true? (

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

                  <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Text className="ml-3 mb-2 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Start time</Text>
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
                  onPress={() => {sheet.current.close(); navigation.navigate('Booking', { serviceData, location, bookingStartDate:selectedDay, bookingStartTime:selectedTime, bookingDuration:duration, bookingDateUndefined:timeUndefined})} }
                  style={{ opacity: !(selectedDay && selectedTime && duration) && !timeUndefined? 0.5 : 1 }}
                  className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17px] rounded-full items-center justify-center"
                >
                  <Text className="text-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                      {formatBookingMessage()}
                    </Text>
                  </Text>
                </TouchableOpacity>

              </View>

              <View className="h-[20px]"/>

              </ScrollView>

            </View>

          ) : (

          <View className="flex-1">
            {showAddList? (

              <View className="flex-1 justify-start items-center">

                <View className="mt-3 mb-12 flex-row justify-center items-center">

                  <View className="flex-1 items-start">
                    <TouchableOpacity onPress={() => {setShowAddList(false); setListName(''); openSheetWithInput(450)}} className="ml-5">
                        <ChevronLeftIcon height={21} width={21} strokeWidth={2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-center items-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">New list</Text>
                  </View>

                  <View className="flex-1 items-end"> 
                    {listName.length>0 ? (
                      <TouchableOpacity onPress={handleDone}>
                          <Text className="mr-7 text-center font-inter-medium text-[14px] text-[#979797]">Done</Text>
                      </TouchableOpacity>
                    ) : null }
                  </View>
                </View>

                <View className="w-full px-5">

                  <View className="w-full h-[55px] px-4  bg-[#f2f2f2] dark:bg-[#272626] rounded-full flex-row justify-start items-center">
          
                  <TextInput
                    placeholder='Name*'
                    autoFocus={true} 
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeHolderTextColorChange}
                    onChangeText={inputListNameChanged} 
                    value={listName}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className="font-inter-medium flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"           
                  />

                  {listName.length>0 ? (
                    <TouchableOpacity onPress={handleClearText}>
                        <View className='h-[23px] w-[23px] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                            <XMarkIcon height={13} color={iconColor} strokeWidth={2.6}/>
                        </View>
                    </TouchableOpacity>
                  ) : null }

                  </View>

                </View>

              

              </View>

              ) : (

              <View className="flex-1 justify-center items-center">

                <View className="mt-3 mb-12 flex-row justify-center items-center">
                  <View className="flex-1"/>

                  <View className="flex-row justify-center items-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">Add to a list</Text>
                  </View>

                  <View className="flex-1 items-end">
                    <TouchableOpacity onPress={() => {setShowAddList(true), openSheetWithInput(250)}} className="mr-5">
                        <Plus height={27} width={27} strokeWidth={1.7} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView className="flex-1 w-full px-7">
                  {lists.map((list, index) => (
                    <View key={list.id ? list.id : index} className="justify-center items-center" >

                      <TouchableOpacity onPress={() => addItemList(list.id)} className="mb-4 flex-row justify-between items-center w-full">

                        <View className="flex-row justify-start items-center">
                          <Image source={list.services[0]? list.services[0].image_url? { uri: list.services[0].image_url } : null : null} className="h-[50px] w-[50px] bg-[#E0E0E0] dark:bg-[#3D3D3D] rounded-lg mr-4"/>
                          <View className="justify-center items-start">
                            <Text className="mb-1 text-center font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{list.title}</Text>
                            <Text className="text-center font-inter-medium text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{list.item_count === 0 ? '0 services' : list.item_count === 1 ? `${list.item_count} service` : `${list.item_count} services`}</Text>
                          </View>
                        </View>

                        <View className="p-[5px] rounded-full border-[1.8px] border-[#b6b5b5] dark:border-[#706f6e]">
                          <Plus height={15} width={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} />
                        </View>

                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity onPress={() => {setShowAddList(true), openSheetWithInput(250)}} className="flex-row justify-start items-center w-full ">
                    <View className="h-[50px] w-[50px] bg-[#444343] dark:bg-[#f2f2f2] rounded-lg mr-4 justify-center items-center">
                      <Plus height={23} width={23} strokeWidth={2.5} color={colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2'} />
                    </View>
                    <View className="justify-center items-start">
                      <Text className="mb-1 text-center font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">New list</Text>
                    </View>
                  </TouchableOpacity>

                </ScrollView>

              </View>
            )}
          </View>

          )}



      </RBSheet>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-6 flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Top FALTA */}

        <View className="flex-row justify-between items-center">
          
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6"/>
          </TouchableOpacity>
          
          <View className="flex-row justify-end items-center">

            <TouchableOpacity onPress={() => null} className="items-center justify-center mr-6">
              <Share height={24} strokeWidth={1.7} color={iconColor}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => heartClicked(serviceId)} className="mr-2">
              {isServiceLiked? (
                <HeartFill height={24} width={24} strokeWidth={1.7} color={'#ff633e'} />
              ) : (
                <Heart height={24} width={24} strokeWidth={1.7} color={iconColor} />
              )}        
           </TouchableOpacity>

          </View>

        </View>

        {/* Service and User info */}

        <View className="justify-start items-center mt-10"> 

          <Image source={serviceData.profile_picture ? {uri: serviceData.profile_picture} : require('../../assets/defaultProfilePic.jpg')} className="h-[100px] w-[100px] bg-[#d4d4d3] dark:bg-[#474646] rounded-full"/>

          <Text className="mt-3 font-inter-bold text-center text-[23px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.first_name} {serviceData.surname}</Text>

          <Text className="mt-2 font-inter-medium text-center text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
            <Text>@{serviceData.username}</Text>
            <Text> • </Text>
            <Text>{serviceData.service_title}</Text>
          </Text>

          {/* Service facts */}

          <View className="py-3 mt-7 mx-4 flex-row justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-3xl">

            <View className="flex-1 justify-center items-center border-r-[1px] border-[#d4d4d3] dark:border-[#474646]">
              <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">0</Text>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Services</Text>
            </View>
            {serviceData.average_rating && (
            <View className="flex-1 justify-center items-center ">
              <View className="flex-row justify-center items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1.3 }] }} />
                <Text className="ml-[6px] font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.average_rating).toFixed(1)}</Text>
              </View>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Rating</Text>
            </View>
            )}

            <View className="flex-1 justify-center items-center border-l-[1px] border-[#d4d4d3] dark:border-[#474646]">
              <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">0</Text>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">Repites</Text>
            </View>

          </View>

        </View>

        {/* Description */}

        <View className="mt-9 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">About the service</Text>

          <Text onTextLayout={onTextLayout} numberOfLines={isDescriptionExpanded ? null : 4} className="break-all text-[14px] text-[#515150] dark:text-[#d4d4d3]">{serviceData.description}</Text>
          
          {showMoreButton && (
          
            <View>
              {!isDescriptionExpanded && (
                <TouchableOpacity onPress={() => setIsDescriptionExpanded(true)}>
                  <Text  className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2] ">Read more...</Text>
                </TouchableOpacity>
              )}
              {isDescriptionExpanded && (
                <TouchableOpacity onPress={() => setIsDescriptionExpanded(false)}>
                  <Text className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Show less</Text>
                </TouchableOpacity>
              )}
            </View>

          )}      
          

        </View>

        {/* Galery */}

        {serviceData.images && (
        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="mb-5 w-full flex-row justify-between items-center">
            <Text className=" flex-1 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Galery</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DisplayImages', {images:serviceData.images})} >
              <ChevronRightIcon size={20} color={colorScheme === 'dark' ? '#b6b5b5' : '#706F6E'} strokeWidth={2.1}/>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="w-full">

            {serviceData.images.slice(0, 10).map((image, index) => (

              <TouchableOpacity
              key={image.id ? image.id : index}
              onPress={() => navigation.navigate('EnlargedImage', {images:serviceData.images, index:index})}
              >
                <Image source={{uri: image.image_url}} className="mr-3 h-[110px] w-[100px] bg-[#d4d4d3] dark:bg-[#474646] rounded-2xl"/>
              </TouchableOpacity>

            ))}

          </ScrollView>
          
        </View>
        )}

        {/* Service data FALTA */}

        <View className="mt-8 pl-6 justify-center items-center pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="flex-row justify-center items-start">

            <View className="flex-1 justify-start items-start">

              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Earned money</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">100 €</Text>
              </View>
              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Hores totals</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">85 h</Text>
              </View>
              <View className="justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Repeted</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">6</Text>
              </View>

            </View>

            <View className="flex-1 justify-start items-start">

              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Success rate</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">100 %</Text>
              </View>
              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Total services</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">12</Text>
              </View>
              <View className="justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">Response time</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{'<'}30 min</Text>
              </View>

            </View>

          </View>

        </View>

        {/* Tags and habilities */}

        {serviceData.tags && (

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Tags and habilities</Text>

          <View className="flex-row justify-start items-center flex-wrap">
            {serviceData.tags.map((tag, index) => (
              <View key={index} className="flex-row py-2 px-3 bg-[#f2f2f2] dark:bg-[#272626] rounded-full mr-1 mb-1">
                <Text className="font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{tag}</Text>
              </View>
            ))}
          </View>

        </View>

        )}

        {/* Personal information */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Personal information</Text>


          {serviceData.languages && (
            <Text>
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Languages: </Text>
              <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatLanguages(serviceData.languages)}</Text>
            </Text>
          )}

          {serviceData.hobbies && (
          <Text className="mt-4">
            <Text className="mt-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Hobbies: </Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{serviceData.hobbies}</Text>
          </Text>
          )}

          <Text className="mt-4">
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Verified: </Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">Identity</Text>
          </Text>

          <Text className="mt-4">
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Creation date: </Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatDate(serviceData.service_created_datetime)}</Text>
          </Text>

          {/* Experiences */}

          {serviceData.experiences && (
        
            <View >

              <View className="mt-8 mb-8 flex-row w-full justify-between items-center">
                <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Experience</Text>
                <Text className="mr-3 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">
                  {serviceData.experiences.length} {serviceData.experiences.length === 1 ? "experience" : "experiences"}
                </Text>
              </View>

              {serviceData.experiences.map((experience, index) => (

              <View key={index} className="flex-row w-full justify-center items-center">

                <View className="w-[30px] h-full items-center pr-5">
                  <View className={`flex-1  bg-[#b6b5b5] dark:bg-[#706F6E] ${index>0 && 'w-[2]'}`}/>
                  <View className={`w-4 h-4 rounded-full border-2 border-[#444343] dark:border-[#f2f2f2] ${experience.experience_end_date? null : colorScheme == 'dark' ? 'bg-[#f2f2f2]' : 'bg-[#444343]'}`}>
                  </View>
                  <View className={`flex-1 w-[2] bg-[#b6b5b5] dark:bg-[#706F6E] ${index===serviceData.experiences.length-1 ? 'w-[0]' : 'w-[2]'}`}/>
                </View>

                <View className="flex-1 py-3 px-5 mb-3 bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">

                  <View className="mt-1 flex-row justify-between">
                    <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{experience.experience_title}</Text>
                  </View>

                  <View className="mt-3 flex-row justify-between items-center mb-[6px]">
                    <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{experience.place_name}</Text>
                    <Text>
                      <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(experience.experience_started_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                      <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]"> - </Text>
                      <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{experience.experience_end_date ? new Date(experience.experience_end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Still there'}</Text>
                    </Text>
                  </View>
                  
                </View>
              </View>
              ))}
            </View>

            


          )}  

        </View>

        {/* Location */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">      

          {!serviceData.latitude? (

            <View className="justify-center items-center w-full">
              <GlobeAltIcon height={80} width={80} strokeWidth={1.2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
              <Text className="mt-3 font-inter-semibold text-[18px] text-[#706F6E] dark:text-[#b6b5b5]">{t('unlocated_or_online_service')}</Text>
            </View>

          ) : (

            serviceData.action_rate===100 ? (

              <View className="justify-center items-center w-full">
                <GlobeEuropeAfricaIcon height={80} width={80} strokeWidth={1.2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                <Text className="mt-3 font-inter-semibold text-[18px] text-[#706F6E] dark:text-[#b6b5b5]">Unlimited radius of action</Text>  
              </View>

            ) : (
            <View>

            <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Location</Text> 

              <View className="justify-center items-center w-full">
                <MapView
                  style={{ height: 160, width: 280, borderRadius: 12 }}
                  region={{
                    latitude:  serviceData.latitude, // Latitud inicial
                    longitude: serviceData.longitude, // Longitud inicial
                    latitudeDelta: 0.05, // Zoom en la latitud
                    longitudeDelta: 0.03, // Zoom en la longitud
                  }}
                >
                  <Circle
                      center={{ latitude: serviceData.latitude, longitude: serviceData.longitude }}
                      radius={serviceData.action_rate*1000}
                      strokeColor="rgba(182,181,181,0.8)"
                      fillColor="rgba(182,181,181,0.5)"
                      strokeWidth={2}
                    />
                  
                </MapView>

                <View className="mt-3 px-3 w-full flex-row justify-between items-center">
                  <Text className="mt-3 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{address ? address : 'Loading...'}</Text>
                  <Text className="mt-3 font-inter-semibold text-[14px] text-[#B6B5B5] dark:text-[#706F6E]">{localHour ? `${localHour} local hour` : ''}</Text>
                </View>

              </View>
            </View>

            )

          )}

        </View>

        {/* Rating and reviews */}
     
        {serviceData.reviews && (

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-8 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Rating and reviews</Text>

          <View className="flex-row w-full justify-between items-center">
            <Text className="font-inter-bold text-[55px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.average_rating).toFixed(1)}</Text>

            <View className="justify-start items-end">

              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View style={{ width: `${width5}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View style={{ width: `${width4}%` }} className={`h-full   bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View style={{ width: `${width3}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="mb-[-5] flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:-7 }} />
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View style={{ width: `${width2}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>
              <View className="flex-row justify-end items-center">
                <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight:8 }} />
                <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                  <View style={{ width: `${width1}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`}/>
                </View>
              </View>

            </View >
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('DisplayReviews', {reviews:filteredReviews})} className="w-full justify-center items-end">
            <Text className="mt-3 font-inter-semibold text-[14px] text-[#B6B5B5] dark:text-[#706F6E]">{serviceData.reviews.length} ratings</Text>
          </TouchableOpacity>

          {/* Reviews */}

          
          {filteredReviews? ( 
          <View className="w-full ">

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}  className="mt-5 w-full">

              {filteredReviews.slice(0, 10).map((review, index) => (
                <TouchableOpacity onPress={() => navigation.navigate('DisplayReviews', {reviews:filteredReviews}) } key={index} className="mr-2 py-5 px-4 w-[300px] bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">

                  <View className="flex-row justify-between items-center">

                    <View className="flex-row justify-start items-center">
                      <Image source={{uri: review.user.profile_picture}} className="mr-3 h-10 w-10 rounded-full bg-[#706F6E] dark:bg-[#b6b5b5]"/>

                      <View className="justify-center items-start">
                        <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{review.user.first_name} {review.user.surname}</Text>
                        <Text className="mt-1 font-inter-medium text-[9px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(review.review_datetime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>                
                      </View>
                    </View>

                    <View className="flex-row justify-end items-center">
                      <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1 }]}}/>
                      <Text className="ml-1 mr-2 font-inter-bold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{review.rating}</Text>                
                    </View>

                  </View>

                  <Text numberOfLines={3} className=" mt-5 mb-2 font-inter-medium text-[13px] text-[#706F6E] dark:text-[#b6b5b5]">{review.comment}</Text>

                  {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-5 w-full">
                    <View className="mr-1 w-12 h-12 bg-[#D4D4D3] dark:bg-[#474646] rounded-md" />
                  </ScrollView> */}

                </TouchableOpacity>      
              ))}      
            </ScrollView>

            <TouchableOpacity
              onPress={() => navigation.navigate('DisplayReviews', {reviews:filteredReviews}) }
              style={{ opacity: 1 }}
              className="mt-6 bg-[#F2F2F2] dark:bg-[#272626] w-full h-[45px] rounded-full items-center justify-center"
            >
              <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">See all reviews</Text>
            </TouchableOpacity>

          </View>
          ) : null}
          
          

        </View>

        )}

        {/* Consult */}

        {(serviceData.user_can_ask || serviceData.user_can_consult) && (
          
          <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

            <View className="mr-2 py-5 px-4 w-full bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">
              <Text className="mb-4 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Consult a professional</Text>
              {serviceData.price_consult && (
                <Text className=" font-inter-semibold text-[13px] text-[#706F6E] dark:text-[#b6b5b5]">{parseFloat(serviceData.price_consult).toFixed(0)} € for a 15 min call</Text>
              )}

              <View className="mt-8 flex-row justify-center items-center">

                {serviceData.user_can_ask === 1 && (

                  <TouchableOpacity
                  onPress={startChat}
                  style={{ opacity: 1 }}
                  className={`mr-2 bg-[#E0E0E0] dark:bg-[#3d3d3d] ${serviceData.user_can_consult === 0 ? 'w-full' : 'w-1/3'} h-[40] rounded-full items-center justify-center`}
                  >
                    <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{t('write')}</Text>
                  </TouchableOpacity>

                )}
                
                {serviceData.user_can_consult === 1 && (

                  <TouchableOpacity
                  onPress={() => null }
                  style={{ opacity: 1 }}
                  className={`bg-[#444343] dark:bg-[#f2f2f2] ${serviceData.user_can_ask === 0 ? 'w-full' : 'w-2/3'} h-[40] rounded-full items-center justify-center`}
                  >
                    <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">{t('book_a_consult')}</Text>
                  </TouchableOpacity>
                )}  

              </View>  
            </View>

          </View>
        )}

        {/* Others */}

        <View className="mt-8 justify-center items-start pb-7">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">Others</Text>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <WisdomLogo  width={23} height={23} color={iconColor}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Wisdom Warranty</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <XCircleIcon  width={24} height={24} color={iconColor} strokeWidth={1.6}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Cancellation Policy</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Info  width={23} height={23} color={iconColor} strokeWidth={1.6}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Help</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Phone  width={22} height={22} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Contact Wisdom</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <FileText  width={23} height={23} color={iconColor} strokeWidth={1.6}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Reservation policy</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start">
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Flag  width={23} height={23} color={iconColor} strokeWidth={1.6}/>
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Report this service</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6"/>
            </View>
          </TouchableOpacity>

        </View>

        <View className="h-[50px]"/>
      </ScrollView >

      {/* Button book */}

      <View className="flex-row justify-center items-center pb-3 px-6">

        <TouchableOpacity
          onPress={() => {verifyRegistered(); }  }
          style={{ opacity: 1 }}
          className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
        >
          <Text>
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
              
              Book for <Text className="font-inter-semibold text-[15px] text-[#B6B5B5] dark:text-[#706f6e]">1 €</Text>
                
            </Text>
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