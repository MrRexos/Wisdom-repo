import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image, RefreshControl} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIco, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { Calendar } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import Clipboard from "../../assets/Clipboard";
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';

export default function ServicesScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('accepted');
  const [userId, setUserId] = useState();
  const [refreshing, setRefreshing] = useState(false);

  const suggestions = [
    { label: t('upcoming'), value:'accepted', id:1 },
    { label: t('requested'), value:'requested', id:2 },
    { label: t('completed'), value:'completed', id:3 },
    { label: t('canceled'), value:'canceled', id:4 },
    { label: t('in_progress'), value: 'in_progress', id: 5 },
  ];

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        const userData = await getDataLocally('user');
        console.log(userData);

        // Comprobar si userData indica que no hay usuario
        if (userData === '{"token":false}') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'GetStarted' }],
          });
        }
      };

      checkUserData();
    }, [navigation])
  );

  const fetchBookings = async (statusParam) => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/bookings`, { params: { status: statusParam } });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      const bookingsData = await fetchBookings(selectedStatus);
      setBookings(bookingsData);
      console.log(bookingsData);
    };
    loadBookings();
  }, [selectedStatus]);

  useRefreshOnFocus(() => fetchBookings(selectedStatus));

  const onRefresh = async () => {
    setRefreshing(true);
    const bookingsData = await fetchBookings(selectedStatus);
    setBookings(bookingsData);
    setRefreshing(false);
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

  const renderBooking = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate('BookingDetails', { bookingId: item.booking_id, role: 'client' })} className="w-full mb-4 pb-4 flex-row justify-between items-end border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <View className="flex-row justify-center items-center">
          <Image source={{ uri: item.profile_picture }} className="w-[80px] h-[80px] bg-[#706B5B] rounded-xl" />
          <View className="ml-4 flex-1 justify-center">
          <Text className="mb-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">
            {item.service_title}
          </Text>
          <Text className="mb-4 font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
            {item.first_name} {item.surname}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar height={15} width={15} color={iconColor} strokeWidth={2.2} />
              <Text className="ml-1 font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">
                {item.booking_start_datetime ? formatDate(item.booking_start_datetime) : t('undefined_time')}
              </Text>
            </View>

            <Text
              className={`font-inter-bold ${item.final_price ? 'text-[16px]' : 'text-[12px]'} text-[#444343] dark:text-[#f2f2f2]`}
            >
              {item.final_price ? `${parseFloat(item.final_price).toFixed(2)} €` : t('pending')}
            </Text>
          </View>
        </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Si la API no filtra correctamente, filtramos localmente por estado
  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter(
        (booking) =>
          booking.status === selectedStatus ||
          booking.booking_status === selectedStatus
      )
    : [];
  


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="flex-1 pt-[55px] pb-3">

        <View className="mb-4 px-6 w-full flex-row justify-between items-center">
          <Text className="mb-2 font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
            {t('services')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')} className="p-[10px] bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
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
              {selectedStatus === 'accepted' ? t('upcoming_services') : t('no_services_found')}
            </Text>
            <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[260px]">
              {selectedStatus === 'accepted'
                ? t('no_upcoming_reservations_yet')
                : selectedStatus === 'requested'
                ? t('no_requested_services_at_the_moment')
                : selectedStatus === 'completed'
                ? t('no_completed_services_yet')
                : selectedStatus === 'canceled'
                ? t('no_services_have_been_canceled')
                : selectedStatus === 'progress'
                ? t('no_services_are_currently_in_progress')
                : t('no_reservations_yet')}
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center ">
            <FlatList
              data={filteredBookings}
              renderItem={renderBooking}
              keyExtractor={(booking, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
              className="p-5 w-full"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
