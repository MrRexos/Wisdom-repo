import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIco, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { Calendar } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import Clipboard from "../../assets/Clipboard";

export default function ServicesScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('accepted');
  const [userId, setUserId] = useState();

  const suggestions = [
    { label: 'Upcoming', value:'accepted', id:1 },
    { label: 'Requested', value:'requested', id:2 },
    { label: 'Completed', value:'completed', id:3 },
    { label: 'Canceled', value:'canceled', id:4 },
    { label: 'In progress', value:'progress', id:5 },
  ];

  const fetchBookings = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/bookings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      const bookings = await fetchBookings();
      setBookings(bookings);
    };
    loadBookings();
  }, []);

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

  const renderBooking = ({ item }) => {
    return (
      <View className="w-full mb-4 pb-4 flex-row justify-between items-end border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <View className="flex-row justify-center items-center">
          <Image source={{ uri: item.profile_picture }} className="w-[80] h-[80] bg-[#706B5B] rounded-xl" />
          <View className="ml-4 justify-center items-start">
            <Text className="mb-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
            <Text className="mb-4 font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{item.first_name} {item.surname}</Text>
            {item.booking_start_datetime && (
            <View className="flex-row justify-start items-center">
              <Calendar height={15} width={15} color={iconColor} strokeWidth={2.2} />
              <Text className="ml-1 font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formatDate(item.booking_start_datetime)}</Text>
            </View>
            )}
          </View>
        </View>
        {item.final_price && (
          <Text className="font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(item.final_price).toFixed(0)} €</Text>
        )}
      </View>
    );
  };

  // Filtrar las reservas por estado seleccionado
  const filteredBookings = bookings && bookings.length>0 ? bookings.filter((booking) => booking.booking_status === selectedStatus) : null;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="flex-1 pt-[55] pb-3">

        <View className="mb-4 px-6 w-full flex-row justify-between items-center">
          <Text className="mb-2 font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
            Services
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')} className="p-[10] bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
            <CalendarDaysIcon height={21} width={21} color={iconColor} strokeWidth={1.7}/>
          </TouchableOpacity>
        </View>

        <View className="pb-5 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="pl-6">
            {suggestions.map((item, index) => (
              <View key={index} className="pr-2">
                <TouchableOpacity
                  className={`px-4 py-3 rounded-full ${selectedStatus === item.value ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#e0e0e0] dark:bg-[#3d3d3d]'}`}
                  onPress={() => setSelectedStatus(item.value)}
                >
                  <Text className={`font-inter-medium text-[14px] ${selectedStatus === item.value ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {( !filteredBookings || filteredBookings.length === 0 ) ? (
          <View className="flex-1 justify-center items-center">
            <Clipboard height={55} width={60} fill={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
            <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
              {selectedStatus === 'accepted' ? 'Upcoming services' : 'No services found'}
            </Text>
            <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[260]">
              {selectedStatus === 'accepted'
                ? "It looks like you haven't made any upcoming reservations yet."
                : selectedStatus === 'requested'
                ? "No requested services at the moment."
                : selectedStatus === 'completed'
                ? "You haven't completed any services yet."
                : selectedStatus === 'canceled'
                ? "No services have been canceled."
                : selectedStatus === 'progress'
                ? "No services are currently in progress."
                : "It looks like you haven't made any reservations yet."}
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <FlatList
              data={filteredBookings}
              renderItem={renderBooking}
              keyExtractor={(booking, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              className="p-5"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
