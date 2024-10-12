import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import {CalendarDaysIcon} from 'react-native-heroicons/solid';
import {Plus, Calendar as CalendarIcon} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import api from '../../utils/api.js';
import { Calendar } from 'react-native-calendars';


export default function CalendarScreen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [events, setEvents] = useState();
  const [userId, setUserId] = useState();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [bookings, setBookings] = useState([]);
  const [bookingsEvents, setBookingsEvents] = useState([]);
  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };
 

  const fetchBookings = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    
    try {
      const response = await api.get(`/api/user/${user.id}/bookings`);
      setBookings(response.data); // Actualiza el estado aquí
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const dates = {};
    
    if (bookings.length > 0) {
      bookings.forEach(booking => {
        const date = new Date(booking.booking_start_datetime).toISOString().split('T')[0]; // Formatear la fecha
        dates[date] = {
          marked: true,
          dotColor: '#FF633E',
        };
      });
    }

    setMarkedDates(dates);
  }, [bookings]);

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

  const formatDate2 = (dateString) => {
    // Convertir la cadena a un objeto Date con el formato 'YYYY-MM-DD'
    const dateParts = dateString.split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Meses en JavaScript son 0-11
    
    // Opciones para el formateo
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    
    // Formatear la fecha
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Reemplazar la coma con "of" para cumplir con tu formato deseado
    return formattedDate.replace(',', ' of');
  };

  const renderBooking = ({ item }) => {
    return (
      <View className="w-full mb-4 pb-4 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <View className="flex-row justify-center items-center">
          <View className="ml-3 justify-center items-start">
            <Text className="mb-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{item.first_name} {item.surname}</Text>
            <Text className="mb-3 font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{item.service_title}</Text>
            {item.booking_start_datetime && (
            <View className="flex-row justify-start items-center">
              <CalendarIcon height={15} width={15} color={iconColor} strokeWidth={2.2} />
              <Text className="ml-1 font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formatDate(item.booking_start_datetime)}</Text>
            </View>
            )}
          </View>
        </View>
        <ChevronRightIcon size={17} color={colorScheme === 'dark' ? '#796f6e': '#b6b5b5'} strokeWidth={2.2}/>

      </View>
    );
  };

  const onDayPress = (day) => {
    const newMarkedDates = { ...markedDates }; // Copiamos las fechas ya marcadas por los eventos
  
    // Reseteamos todas las fechas 'selected'
    Object.keys(newMarkedDates).forEach((date) => {
      if (newMarkedDates[date].selected) {
        delete newMarkedDates[date].selected;
        delete newMarkedDates[date].selectedColor;
      }
    });
  
    // Añadimos la nueva fecha seleccionada
    newMarkedDates[day.dateString] = {
      ...newMarkedDates[day.dateString], // Mantén los eventos que ya estaban marcados, si existen
      selected: true,
      selectedColor: colorScheme === 'dark' ? '#979797' : '#979797', // Color del fondo del círculo
      selectedTextColor: '#ffffff' // Color del texto en el día seleccionado
    };
  
    setSelectedDate(day.dateString); // Actualiza la fecha seleccionada
    setMarkedDates(newMarkedDates); // Actualiza las fechas marcadas

    // Filtra los bookings que coincidan con la fecha seleccionada
    let filteredBookings = [];

    if (bookings.length > 0) {
      filteredBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.booking_start_datetime)
          .toISOString()
          .split('T')[0];
        return bookingDate === day.dateString;
      });
    }

    setBookingsEvents(filteredBookings); // Actualiza los bookings filtrados
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      
      <View className="flex-1 justify-start items-center pt-[55] ">

        <View className="px-6 mb-2 w-full flex-row justify-between items-center ">
          <View className="flex-row justify-center items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="">
              <ChevronLeftIcon size={24} strokeWidth={2} color={colorScheme === 'dark' ? '#979797' : '#979797'} />
            </TouchableOpacity>
            <Text className="ml-2 font-inter-bold text-[24px] text-[#444343] dark:text-[#f2f2f2]">
              Calendar
            </Text>
          </View>
          {/* <TouchableOpacity onPress={() => navigation.navigate('CreateService1')} className="p-[8] bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
            <Plus height={23} width={23} color={iconColor} strokeWidth={1.7}/>
          </TouchableOpacity> */}
        </View>

        <ScrollView className="pt-8 flex-1 w-full px-6">
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            firstDay={1}
            theme={{
              todayTextColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
              monthTextColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
              textMonthFontSize: 20,
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

          <View className="mt-4 mb-5 px-4 pt-6 flex-1 w-full rounded-2xl bg-[#fcfcfc] dark:bg-[#323131]">
            <View className="mb-5 flex-row justify-between items-center">
                <Text className=" font-inter-bold text-[20px] text-[#000000] dark:text-[#ffffff]">
                  Events 
                </Text>
                <Text className=" font-inter-semibold text-[12px] text-[#b6b5b5] dark:text-[#706F6E]">
                  {selectedDate ? formatDate(selectedDate) : null}
                </Text>
            </View>

            {!bookingsEvents || bookingsEvents.length === 0 ? (
              <View className="mt-1 flex-1 justify-center items-center">
                <CalendarDaysIcon height={40} width={40} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                <Text className="mt-4 mb-5 font-inter-semibold text-[16px] text-[#979797]">
                  No events this day
                </Text>
              </View>
            ) : (
              <View>
                {bookingsEvents.map((booking, index) => (
                  <View key={index} >
                    {renderBooking({ item: booking })}
                  </View>
                ))}
              </View>
            )}
          </View>


        </ScrollView>

      </View>

      


    </SafeAreaView>
  );
}