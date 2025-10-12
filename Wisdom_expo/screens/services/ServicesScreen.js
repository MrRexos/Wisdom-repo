import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image, RefreshControl} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIco, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { Calendar } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import Clipboard from "../../assets/Clipboard";
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  const formatCurrency = (value, currency = 'EUR') => {
    if (value === null || value === undefined) return '';
    const symbol = (typeof currencySymbols === 'object' && currencySymbols[currency]) ? currencySymbols[currency] : '€';

    const n = Number(value);
    if (!Number.isFinite(n)) return '';

    const s = n.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return `${s} ${symbol}`;
  };

  const suggestions = [
    { label: t('upcoming'), value: 'accepted', id: 1 },
    { label: t('in_progress'), value: 'in_progress', id: 2 },
    { label: t('requested'), value: 'requested', id: 3 },
    { label: t('completed'), value: 'completed', id: 4 },
    { label: t('paid'), value: 'paid', id: 5 },
    { label: t('canceled'), value: 'canceled', id: 6 },
    { label: t('others'), value: 'others', id: 7 },
    { label: t('all'), value: 'all', id: 8 },
  ];

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        const userData = await getDataLocally('user');

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
      const params = {};

      if (statusParam === 'paid') {
        params.is_paid = true;
      } else if (statusParam === 'others' || statusParam === 'all') {
        params.status = 'all';
      } else if (statusParam) {
        params.status = statusParam;
      }

      const response = await api.get(`/api/user/${user.id}/bookings`, { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      const bookingsData = await fetchBookings(selectedStatus);
      setBookings(bookingsData);
    };
    loadBookings();
  }, [selectedStatus]);

  useRefreshOnFocus(async () => {
    const bookingsData = await fetchBookings(selectedStatus);
    setBookings(bookingsData);
  });

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
              {item.final_price ? `${formatCurrency(parseFloat(item.final_price))}` : t('pending')}
            </Text>
          </View>
        </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Si la API no filtra correctamente, filtramos localmente por estado
  const now = new Date();
  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => {
        const status = booking?.booking_status || booking?.status;
        if (selectedStatus === 'all') {
          return true;
        }

        if (selectedStatus === 'paid') {
          return Boolean(booking?.is_paid);
        }

        if (selectedStatus === 'others') {
          const problematicStatuses = ['payment_failed', 'pending_deposit', 'rejected'];
          if (problematicStatuses.includes(status)) {
            return true;
          }

          if (booking?.booking_start_datetime) {
            const startDate = new Date(booking.booking_start_datetime);
            if (!Number.isNaN(startDate.valueOf())) {
              return (
                startDate < now &&
                !['completed', 'canceled', 'rejected'].includes(status) &&
                !booking?.is_paid
              );
            }
          }

          return false;
        }

        if (selectedStatus === 'in_progress') {
          return status === 'in_progress' || status === 'progress';
        }

        return status === selectedStatus;
      })
    : [];

  const emptyStateMessages = {
    accepted: t('no_upcoming_reservations_yet'),
    requested: t('no_requested_services_at_the_moment'),
    completed: t('no_completed_services_yet'),
    canceled: t('no_services_have_been_canceled'),
    in_progress: t('no_services_are_currently_in_progress'),
    paid: t('no_paid_services_yet'),
    others: t('no_other_services_yet'),
    all: t('no_services_found'),
  };

  const emptyStateMessage = emptyStateMessages[selectedStatus] || t('no_reservations_yet');
  


  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
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
              {emptyStateMessage}
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
