import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Bell, Calendar } from "react-native-feather";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import Clipboard from "../../assets/Clipboard";
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';


export default function TodayProScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [user, setUser] = useState();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedStatus, setSelectedStatus] = useState('accepted');
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState();
  const [refreshing, setRefreshing] = useState(false);

  const suggestions = [
    { label: t('upcoming'), value: 'accepted', id: 1 },
    { label: t('requested'), value: 'requested', id: 2 },
    { label: t('completed'), value: 'completed', id: 3 },
    { label: t('canceled'), value: 'canceled', id: 4 },
    { label: t('in_progress'), value: 'progress', id: 5 },
  ];

  const fetchBookings = async (statusParam) => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/service-user/${user.id}/bookings`, { params: { status: statusParam } });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const loadUserData = async () => {
    const userData = await getDataLocally('user');

    if (userData) {
      userJSON = JSON.parse(userData);
      setUser(userJSON);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      const bookingsData = await fetchBookings(selectedStatus);
      setBookings(bookingsData);
    };
    loadBookings();
    loadUserData();
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
      <TouchableOpacity onPress={() => navigation.navigate('BookingDetails', { bookingId: item.booking_id, role: 'pro' })} className="w-full mb-4 pb-4 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <View className="flex-row justify-center items-center">
          <View className="ml-3 justify-center items-start">
            <Text className="mb-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{item.booking_user_first_name} {item.booking_user_surname}</Text>
            <Text className="mb-3 font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{item.service_title}</Text>
            
            <View className="flex-row justify-start items-center">
              <Calendar height={15} width={15} color={iconColor} strokeWidth={2.2} />
              <Text className="ml-1 font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{item.booking_start_datetime ? formatDate(item.booking_start_datetime) : t('undefined_time')}</Text>
            </View>
            
          </View>
        </View>
        <ChevronRightIcon size={17} color={colorScheme === 'dark' ? '#796f6e' : '#b6b5b5'} strokeWidth={2.2} />

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
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 justify-start items-center pt-[55px]">

        <View className="px-6 w-full flex-row justify-between items-center">
          <Text className="font-inter-bold text-[28px] text-[#444343] dark:text-[#f2f2f2]">
            {t('welcome_comma')} {user ? user.first_name : null}
          </Text>
          <TouchableOpacity>
            <Bell color={iconColor} strokeWidth={1.7} />
          </TouchableOpacity>
        </View>


        <View className="w-full px-8 mt-12 justify-center items-center">
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateServiceStart')}
            style={{ opacity: 1 }}
            className="bg-[#323131] mx-2 dark:bg-[#fcfcfc] w-full h-[50px] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
              {t('publish_a_service')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 w-full mt-8 justify-start items-center">


          <View className="pl-6 mb-5 w-full justify-center items-start">
            <Text className="font-inter-semibold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{t('your_bookings')}</Text>
          </View>

          <View className="mb-5">
            <ScrollView style={{ flexGrow: 0 }} horizontal={true} showsHorizontalScrollIndicator={false} className="pl-6 ">
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

          <View className="px-8 h-[260px] w-full justify-center items-center">
            <View className="p-2 flex-1 w-full rounded-2xl bg-[#fcfcfc] dark:bg-[#323131]">

              {(!filteredBookings || filteredBookings.length === 0) ? (
                <View className="flex-1 justify-center items-center">
                  <Clipboard height={40} width={40} fill={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                  <Text className="mt-7 font-inter-semibold text-[16px] text-[#706F6E] dark:text-[#B6B5B5]">
                    {t('no_services_found')}
                  </Text>
                </View>
              ) : (
                <View className="flex-1 justify-center items-center">
                  <FlatList
                    data={filteredBookings}
                    renderItem={renderBooking}
                    keyExtractor={(booking, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    className="p-2"
                  />
                </View>
              )}

            </View>
          </View>


        </View>


      </View>
    </SafeAreaView>
  );
}