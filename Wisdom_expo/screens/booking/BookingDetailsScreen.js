import React, { useState, useEffect, useRef } from 'react';
import * as Localization from 'expo-localization';
import { View, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, LockClosedIcon, ChevronRightIcon, XCircleIcon, ClockIcon } from 'react-native-heroicons/outline';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import { Check, Lock, Calendar as CalendarIcon, Edit3, Clock, MapPin, CreditCard, AlertTriangle, Phone } from 'react-native-feather';
import WisdomLogo from '../../assets/wisdomLogo.tsx';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import { getDataLocally } from '../../utils/asyncStorage';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import api from '../../utils/api.js';

export default function BookingDetailsScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, role } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState({});
  const [selectedDate, setSelectedDate] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [sliderValue, setSliderValue] = useState(12);
  const [paymentMethod, setPaymentMethod] = useState();
  const sliderTimeoutId = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTimeUndefined, setSelectedTimeUndefined] = useState(false);
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);
  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  useEffect(() => {
    fetchBooking();
    loadPaymentMethod();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPaymentMethod();
      loadSearchedDirection();
    }, [])
  );

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      let data = response.data;
      if (
        data.booking_status === 'accepted' &&
        data.booking_end_datetime &&
        new Date(data.booking_end_datetime) < new Date(getLocalDate(new Date()))
      ) {
        await api.patch(`/api/bookings/${bookingId}/status`, { status: 'completed' });
        data.booking_status = 'completed';
      }
      setBooking(data);
      setEdited(data);
      const serviceResp = await api.get(`/api/services/${data.service_id}`);
      setService(serviceResp.data);
      if (response.data.booking_start_datetime) {
        const date = new Date(response.data.booking_start_datetime);
        const dateString = date.toISOString().split('T')[0];
        const timeString = date.toISOString().split('T')[1].slice(0, 5);
        setSelectedDate({
          [dateString]: {
            selected: true,
            selectedColor: colorScheme === 'dark' ? '#979797' : '#979797',
            selectedTextColor: '#ffffff',
          },
        });
        setSelectedDay(dateString);
        setSelectedTime(timeString);
        setTempDate(date);
        setSelectedTimeUndefined(false);
      } else {
        setSelectedTimeUndefined(true);
      }
      if (response.data.service_duration) {
        const dur = parseInt(response.data.service_duration);
        setSelectedDuration(dur);
        setSliderValue(minutesToSliderValue(dur));
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate({
      [day.dateString]: {
        selected: true,
        selectedColor: colorScheme === 'dark' ? '#979797' : '#979797',
        selectedTextColor: '#ffffff',
      },
    });
    setSelectedDay(day.dateString);
  };

  const handleHourSelected = (event, date) => {
    const currentDate = date || tempDate;
    setTempDate(currentDate);
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    setSelectedTime(formattedTime);
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  const handleSliderChange = (value) => {
    if (sliderTimeoutId.current) {
      clearTimeout(sliderTimeoutId.current);
    }
    sliderTimeoutId.current = setTimeout(() => {
      const adjusted = sliderValueToMinutes(value);
      setSliderValue(value);
      setSelectedDuration(adjusted);
    }, 100);
  };

  const loadPaymentMethod = async () => {
    const raw = await getDataLocally('paymentMethod');
    if (raw) {
      setPaymentMethod(JSON.parse(raw));
    }
  };

  const loadSearchedDirection = async () => {
    const raw = await getDataLocally('searchedDirection');
    if (raw) {
      const dir = JSON.parse(raw);
      setEdited((prev) => ({
        ...prev,
        address_1: dir.address_1,
        street_number: dir.street_number,
        postal_code: dir.postal_code,
        city: dir.city,
        state: dir.state,
        country: dir.country,
        address_2: dir.address_2,
      }));
    }
  };

  const sliderValueToMinutes = (value) => {
    if (value <= 12) {
      return value * 5;
    } else if (value <= 18) {
      return 60 + (value - 12) * 10;
    } else if (value <= 26) {
      return 120 + (value - 18) * 15;
    } else {
      return 240 + (value - 26) * 30;
    }
  };

  const minutesToSliderValue = (minutes) => {
    if (minutes <= 60) {
      return minutes / 5;
    } else if (minutes <= 120) {
      return 12 + (minutes - 60) / 10;
    } else if (minutes <= 240) {
      return 18 + (minutes - 120) / 15;
    } else {
      return 26 + (minutes - 240) / 30;
    }
  };

  const openSheetWithInput = (height) => {
    setSheetHeight(height);
    setTimeout(() => {
      sheet.current.open();
    }, 0);
  };

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

  const getFormattedPrice = () => {
    const priceSource = service || booking;
    if (!priceSource) return null;
    const numericPrice = parseFloat(priceSource.price);
    const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
    if (priceSource.price_type === 'hour') {
      return (
        <>
          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
            {formattedPrice}
            {currencySymbols[priceSource.currency]}
          </Text>
          <Text className='font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]'>
            {t('per_hour')}
          </Text>
        </>
      );
    } else if (priceSource.price_type === 'fix') {
      return (
        <>
          <Text className='font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]'>
            {t('fixed_price_prefix')}
          </Text>
          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
            {formattedPrice}
            {currencySymbols[priceSource.currency]}
          </Text>
        </>
      );
    }
    return (
      <Text className='font-inter-bold text-[13px] text-[#706F6E] dark:text-[#B6B5B5]'>
        {t('price_on_budget')}
      </Text>
    );
  };

  const formatDuration = (duration) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getLocalDate = (date) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;      // p. ej. "Europe/Madrid"
  
    // "2025-06-28 16:10:37"  →  "2025-06-28T16:10:37"
    const isoLocal = date
      .toLocaleString('sv-SE', { timeZone: tz, hourCycle: 'h23' })
      .replace(' ', 'T');
    
    return `${isoLocal}.000Z`;   // ya NO será NaN
  };

  const getEndTime = () => {
    const end = new Date(`1970-01-01T${selectedTime}:00`);
    end.setMinutes(end.getMinutes() + selectedDuration);
    return end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const combineDateTime = () => {
    return `${selectedDay}T${selectedTime}:00`;
  };

  const calculateEndDateTime = () => {
    const startDateTime = new Date(`${selectedDay}T${selectedTime}:00`);
    startDateTime.setMinutes(startDateTime.getMinutes() + selectedDuration);
    const endDate = startDateTime.toISOString().split('T')[0];
    const endTime = startDateTime.toTimeString().split(' ')[0];
    return `${endDate} ${endTime}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const saveChanges = async () => {
    try {
      const id = bookingId || (booking && booking.id);
      if (!id) {
        console.error('No booking ID available');
        return;
      }
      const payload = {
        ...edited,
        id,
        booking_start_datetime: selectedTimeUndefined ? null : combineDateTime(),
        booking_end_datetime: selectedTimeUndefined ? null : calculateEndDateTime(),
        service_duration: selectedTimeUndefined ? null : selectedDuration,
      };
      await api.put(`/api/bookings/${id}`, payload);
      setBooking((prev) => ({ ...prev, ...payload }));
      setEditMode(false);
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const updateStatus = async (status) => {
    try {
      const payload = { status };
      await api.patch(`/api/bookings/${bookingId}/status`, payload);

      if (status === 'accepted' && (!booking || !booking.booking_start_datetime)) {
        const startDate = new Date(getLocalDate(new Date()));
        const updatePayload = {
          id: bookingId,
          booking_start_datetime: startDate,
          booking_end_datetime: booking ? booking.booking_end_datetime : null,
          service_duration: booking ? booking.service_duration : null,
          final_price: booking ? booking.final_price : null,
          description: booking ? booking.description : null,
        };
        await api.put(`/api/bookings/${bookingId}`, updatePayload);
        setBooking((prev) => ({ ...prev, booking_start_datetime: startDate, booking_status: status }));
      }

      fetchBooking();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateIsPaid = async (isPaid) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/is_paid`, { is_paid: isPaid });
      fetchBooking();
    } catch (error) {
      console.error('Error updating is_paid:', error);
    }
  };

  const handleFinalPayment = async () => {
    try {
      await updateIsPaid(true);
    } catch (e) {
      console.error('handleFinalPayment error:', e);
    } finally {
      navigation.navigate('ConfirmPayment', { serviceId: booking.service_id });
    }
  };

  const confirmCancel = () => {
    Alert.alert(t('cancel_booking'), t('confirm_cancel_booking'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('ok'), onPress: () => updateStatus('canceled'), style: 'destructive' }
    ]);
  };

  const startChat = async () => {
    try {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const me = JSON.parse(userData);
      
      let otherId;
      if (role === 'pro') {
        // Profesional contactando al cliente
        otherId = booking.user_id;
      } else {
        // Cliente contactando al profesional
        otherId = (service && service.user_id) || booking.service_user_id || booking.service_userid;
      }

      if (!otherId || otherId === me.id) return;

      const participants = [me.id, otherId];
      const conversationId = [...participants].sort().join('_');
      const data = {
        participants,
        updatedAt: serverTimestamp(),
      };

      if (service && service.first_name && service.surname) {
        data.name = `${service.first_name} ${service.surname}`;
      } else if (booking.service_title) {
        data.name = booking.service_title;
      }

      await setDoc(doc(db, 'conversations', conversationId), data, { merge: true });
      navigation.navigate('Conversation', {
        conversationId,
        participants,
        name: data.name,
      });
    } catch (err) {
      console.error('startChat error:', err);
    }
  };

  const deleteBooking = async () => {
    try {
      await api.delete(`/api/delete_booking/${bookingId}`);
      navigation.goBack();
    } catch (err) {
      console.error('deleteBooking error:', err);
    }
  };

  const isBookingInactive = () => {
    if (!booking) return false;
    const now = new Date(getLocalDate(new Date()));
    const startDate = booking.booking_start_datetime
      ? new Date(booking.booking_start_datetime)
      : null;
    return (
      booking.booking_status === 'canceled' ||
      booking.booking_status === 'rejected' ||
      (startDate && startDate < now && booking.booking_status === 'requested')
    );
  };

  const getInactiveMessage = () => {
    if (!booking) return '';
    if (booking.booking_status === 'canceled') return t('booking_canceled');
    if (booking.booking_status === 'rejected') return t('booking_rejected');
    return t('booking_expired');
  };

  
  const now = new Date(getLocalDate(new Date()));

  const startDate =
    booking && booking.booking_start_datetime
      ? new Date(
          booking.booking_start_datetime
        )
      : null;
  const endDate =
    booking && booking.booking_end_datetime
      ? new Date(booking.booking_end_datetime)
      : null;

  const showInProgress =
    booking &&
    booking.booking_status === 'accepted' &&
    (
      (startDate && !endDate) ||
      (startDate && !endDate && now >= startDate) ||
      (startDate && endDate && now >= startDate && now < endDate)
    );

    console.log(showInProgress)
    console.log(endDate)

    
    

  const showServiceFinished =
    booking &&
    booking.booking_status === 'completed' &&
    !booking.is_paid;

  const statusMessage = showServiceFinished
    ? t('service_completed')
    : showInProgress
    ? t('in_progress')
    : null;

  if (!booking) {
    return null;
  }

  return (
    <>
      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >
        <View className='flex-1 justify-start items-center'>
          <View className='mt-4 mb-2 flex-row justify-center items-center'>
            <Text className='text-center font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
              {t('select_a_date')}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
            <View className='w-full px-6'>
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
                  selectedDayTextColor: '#ffffff',
                  arrowColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                  calendarBackground: 'transparent',
                }}
                style={{ backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', padding: 20, borderRadius: 20 }}
              />
            </View>

            <View className='mt-2 w-full px-6'>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text className='ml-3 mb-2 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
                  {t('start_time')}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={tempDate}
                  mode='time'
                  display='spinner'
                  onChange={handleHourSelected}
                  style={{ width: 320, height: 150 }}
                />
              )}
            </View>

            <View className='mt-6 mb-10 w-full px-6'>
              <Text className='ml-3 mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
                {t('duration')}: {formatDuration(selectedDuration)}
              </Text>
              <View className='flex-1 px-4 justify-center items-center'>
                <Slider
                  style={{ width: '100%', height: 10 }}
                  minimumValue={1}
                  maximumValue={34}
                  step={1}
                  thumbImage={thumbImage}
                  minimumTrackTintColor='#b6b5b5'
                  maximumTrackTintColor='#474646'
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                />
              </View>
            </View>

            <View className='pl-10 flex-row w-full justify-start  items-center'>
              <TouchableOpacity
                onPress={() => setSelectedTimeUndefined(!selectedTimeUndefined)}
                style={{
                  width: 22,
                  height: 22,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                  borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                  backgroundColor: selectedTimeUndefined ? (colorScheme === 'dark' ? '#fcfcfc' : '#323131') : 'transparent',
                }}
              >
                {selectedTimeUndefined && (
                  <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                )}
              </TouchableOpacity>
              <Text className='ml-3 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>
                {t('undefined_time')}
              </Text>
            </View>

            <View className='mt-6 pb-3 px-6 flex-row justify-center items-center'>
              <TouchableOpacity
                disabled={!(selectedDay && selectedTime && selectedDuration) && !selectedTimeUndefined}
                onPress={() => sheet.current.close()}
                style={{
                  opacity: !(selectedDay && selectedTime && selectedDuration) && !selectedTimeUndefined ? 0.5 : 1,
                }}
                className='bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17] rounded-full items-center justify-center'
              >
                <Text className='text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                  {t('accept')}
                </Text>
              </TouchableOpacity>
            </View>

            <View className='h-[20]' />
          </ScrollView>
        </View>
      </RBSheet>

    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View className='items-center justify-center px-2 pt-3  pb-3'>

      <View className='flex-row items-center justify-between'>

        <View className="flex-[1] justify-center ">
          <TouchableOpacity onPress={() => navigation.goBack()} className='flex-1 p-2'>
            <XMarkIcon size={24} color={iconColor} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View className="flex-[2] justify-center items-center  ">
          <Text className='font-inter-bold text-[17px] text-[#444343] dark:text-[#f2f2f2]'>
            {t('booking_details')}
          </Text>
        </View>

        <View className="flex-[1] justify-center items-end">
          {booking && booking.booking_status !== 'completed' && (
            <TouchableOpacity onPress={() => setEditMode(!editMode)} className='mr-2 justify-center items-center rounded-full px-3 py-2 bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
              <Text className='font-inter-medium text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>
                {editMode ? t('cancel') : t('edit')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </View>

      {statusMessage && (
        <View className='items-center mt-1'>
          <Text className='font-inter-semibold text-[14px] text-[#74A34F]'>
            {statusMessage}
          </Text>
        </View>
      )}
      </View>

      <ScrollView className='flex-1 px-6 mt-4'>

        <View className='mb-4'>
          <TouchableOpacity
            onPress={() => navigation.navigate('ServiceProfile', { serviceId: booking.service_id })}
            className='rounded-2xl bg-[#fcfcfc] dark:bg-[#323131] p-5'
          >
            <View className='flex-row justify-between items-center'>
              <Text className='ml-1 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]'>
                {(service && service.service_title) || booking.service_title}
              </Text>
            </View>

            <View className='flex-row justify-between items-center mt-4'>
              <Text className='ml-1 mr-5'>{getFormattedPrice()}</Text>
              {service && service.tags && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-1'>
                  {service.tags.map((tag, index) => (
                    <View key={index} className='pr-[6]'>
                      <View className='px-3 py-1 rounded-full bg-[#f2f2f2] dark:bg-[#272626]'>
                        <Text className='font-inter-medium text-[12px] text-[#979797]'>{tag}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View className='flex-row justify-between items-end mt-4'>
              <View className='flex-row items-center'>
                <Image
                  source={service && service.profile_picture ? { uri: service.profile_picture } : require('../../assets/defaultProfilePic.jpg')}
                  className='h-[45] w-[45] rounded-lg bg-[#706B5B]'
                />
                <View className='ml-3'>
                  <Text className='mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                    {service ? `${service.first_name} ${service.surname}` : `${booking.first_name} ${booking.surname}`}
                  </Text>
                  <Text className='font-inter-semibold text-[11px] text-[#706F6E] dark:text-[#b6b5b5]'>
                    {t('place')}
                  </Text>
                </View>
              </View>

              {service && service.review_count > 0 && (
                <View className='flex-row items-center'>
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                  <Text className='ml-[3]'>
                    <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                      {parseFloat(service.average_rating).toFixed(1)}
                    </Text>
                    <Text> </Text>
                    <Text className='font-inter-medium text-[11px] text-[#706F6E] dark:text-[#B6B5B5]'>
                      {service.review_count === 1 ? `1 ${t('review')}` : `${service.review_count} ${t('reviews')}`}
                    </Text>
                  </Text>
                </View>
              )}
            </View>

        {service && service.images && (
          <View className='px-2 pb-2 mt-4'>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-1'>
              {service.images.map((image, index) => (
                <View key={index} className='pr-[6]'>
                  <View className='ml-1'>
                    <Image
                      source={image.image_url ? { uri: image.image_url } : null}
                      className='h-[65] w-[55] rounded-lg bg-[#706B5B]'
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    </View>

        {/* Date and time */}
        <View className='mt-8 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
          <View className='w-full flex-row justify-between items-center '>
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Date and time</Text>
            {editMode && (
              <TouchableOpacity onPress={() => { setShowPicker(true); openSheetWithInput(650); }}>
                <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>

          <View className='mt-4 flex-1'>
            {selectedTime && !selectedTimeUndefined ? (
                <View className='flex-1 justify-center items-center'>
                  <View className='w-full flex-row justify-between items-center'>
                    <View className='flex-row justify-start items-center'>
                      <CalendarIcon height={15} width={15} color={colorScheme === 'dark' ? '#d4d4d3' : '#515150'} strokeWidth={2.2} />
                      <Text className='ml-1 font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]'>{formatDate(selectedDay)}</Text>
                    </View>
                    <View className='justify-end items-center'>
                      <Text className='font-inter-semibold text-[14px] text-[#515150] dark:text-[#979797]'>{formatDuration(selectedDuration)}</Text>
                    </View>
                  </View>
                  <View className='mt-4 justify-end items-center'>
                    <Text className=' font-inter-bold text-[20px] text-[#515150] dark:text-[#979797]'>{selectedTime} - {getEndTime()}</Text>
                  </View>
                </View>
              ) : (
                <View className='mt-1 flex-1 justify-center items-center'>
                  <Clock height={40} width={40} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                  <Text className='mt-4 font-inter-semibold text-[16px] text-[#979797]'>
                    {t('undefined_time')}
                  </Text>
                </View>
              )}
          </View>
        </View>

        {/* Address */}
        <View className='mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
          <View className='w-full flex-row justify-between items-center '>
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Address</Text>
            {editMode && (
              <TouchableOpacity onPress={() => navigation.navigate('SearchDirectionAlone', { prevScreen: 'BookingDetails' })}>
                <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>

          <View className='mt-4 flex-row justify-center items-center'>
              <View className='w-11 h-11 items-center justify-center'>
                <MapPin height={25} width={25} strokeWidth={1.6} color={iconColor} />
              </View>
              <View className='pl-3 pr-3 flex-1 justify-center items-start'>
                <Text numberOfLines={1} className='mb-[6] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]'>
                  {[booking.address_1, booking.street_number].filter(Boolean).join(', ')}
                </Text>
                <Text numberOfLines={1} className='font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]'>
                  {[booking.postal_code, booking.city, booking.state, booking.country].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>
          
        </View>

        {/* Price details */}
        <View className='mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
          <View className='w-full flex-row justify-between items-center '>
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Price details</Text>
          </View>

          <View className='mt-5 px-3 flex-1'>
            <View className='flex-1 justify-center items-center'>
              {(() => {
                const priceSource = service || booking;
                if (priceSource.price_type === 'hour') {
                  return (
                    <>
                      <View className='flex-row'>
                        <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Service price x {(selectedDuration / 60).toFixed(0)}h</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                          {formatCurrency(parseFloat(priceSource.price) * (selectedDuration / 60), priceSource.currency)}
                        </Text>
                      </View>

                      <View className='mt-3 flex-row'>
                        <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Quality commission</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                          {formatCurrency(((parseFloat(priceSource.price) * (selectedDuration / 60)) * 1.1) - (parseFloat(priceSource.price) * (selectedDuration / 60)), priceSource.currency)}
                        </Text>
                      </View>

                      <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]'></View>

                      <View className='mt-4 flex-row'>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {formatCurrency(((parseFloat(priceSource.price) * (selectedDuration / 60)) * 1.1), priceSource.currency)}
                        </Text>
                      </View>

                      <View className='mt-4 flex-row'>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Deposit</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {formatCurrency(1, priceSource.currency)}
                        </Text>
                      </View>
                    </>
                  );
                } else if (priceSource.price_type === 'fix') {
                  return (
                    <>
                      <View className='flex-row'>
                        <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Fixed price</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                          {parseFloat(priceSource.price).toFixed(0)} {currencySymbols[priceSource.currency]}
                        </Text>
                      </View>

                      <View className='mt-3 flex-row'>
                        <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Quality commission</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                          {(parseFloat(priceSource.price) * 0.1).toFixed(1)} {currencySymbols[priceSource.currency]}
                        </Text>
                      </View>

                      <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]'></View>

                      <View className='mt-4 flex-row'>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {formatCurrency(parseFloat(priceSource.price)+(parseFloat(priceSource.price) * 0.1), priceSource.currency)}
                        </Text>
                      </View>

                      <View className='mt-4 flex-row'>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Deposit</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {formatCurrency(1, priceSource.currency)}
                        </Text>
                      </View>
                    </>
                  );
                } else {
                  return (
                    <>
                      <View className='flex-row'>
                        <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Service price</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>budget</Text>
                      </View>

                      <View className='mt-3 flex-row'>
                        <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Deposit</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                          {formatCurrency(1, priceSource.currency)}
                        </Text>
                      </View>

                      <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]'></View>

                      <View className='mt-4 flex-row'>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                        <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {'.'.repeat(80)}
                        </Text>
                        <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                          {formatCurrency(1, priceSource.currency)}
                        </Text>
                      </View>
                    </>
                  );
                }
              })()}
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className='mt-8 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
          <View className='w-full flex-row justify-between items-center '>
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Payment method</Text>
            {editMode && paymentMethod && (
              <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod')}>
                <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>

          <View className='mt-4 flex-1'>
            {paymentMethod ? (
              <View className='flex-1 my-3 justify-center items-center '>
                <View className='px-7 pb-5 pt-[50] bg-[#EEEEEE] dark:bg-[#111111] rounded-xl'>
                  <Text>
                    <Text className='font-inter-medium text-[16px] text-[#444343] dark:text-[#f2f2f2]'>••••   ••••   ••••   </Text>
                    <Text className='font-inter-medium text-[13px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.cardNumber.slice(-4)}</Text>
                  </Text>

                  <View className='mt-6 flex-row justify-between items-center'>
                    <View className='flex-row items-center'>
                      <View className='justify-center items-center'>
                        <Text className='font-inter-medium text-[12px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.expiration}</Text>
                      </View>
                      <View className='ml-3 justify-center items-center'>
                        <Text className=' font-inter-medium text-[12px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.cvv}</Text>
                      </View>
                    </View>

                    <View className='h-5 w-8 bg-[#fcfcfc] dark:bg-[#323131] rounded-md'/>
                  </View>
                </View>
              </View>
            ) : (
              <View className='mt-1 flex-1 justify-center items-center'>
                <CreditCard height={55} width={55} strokeWidth={1.3} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                <View className='flex-row justify-center items-center px-6'>
                  <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod') } style={{ opacity: 1 }} className='bg-[#706f6e] my-2 mt-3 dark:bg-[#b6b5b5] w-full py-[14] rounded-full items-center justify-center'>
                    <Text>
                      <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                        {t('add_credit_card')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View className='mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
          <View className='w-full flex-row justify-between items-center '>
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>{t('booking_description')}</Text>
          </View>

          <View className='flex-1 w-full mt-6'>
            {editMode ? (
              <TextInput
                value={edited.description || ''}
                onChangeText={(text) => setEdited({ ...edited, description: text })}
                multiline
                className='w-full min-h-[150] bg-[#f2f2f2] dark:bg-[#272626] rounded-2xl py-4 px-5 text-[15px] text-[#515150] dark:text-[#d4d4d3]'
                style={{ textAlignVertical: 'top' }}
              />
            ) : (
              <Text className='font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]'>{booking.description || '-'}</Text>
            )}
          </View>
        </View>


      </ScrollView>

        {editMode ? (
        <View className='px-6 pb-4'>
          <TouchableOpacity onPress={saveChanges} className='mt-2 mb-4 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'>
            <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
              {t('save_changes')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className='px-6 pb-4'>
          {isBookingInactive() ? (
            <>
              <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
                <LockClosedIcon strokeWidth={2.1} size={18} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
                <Text className='ml-2 font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                  {getInactiveMessage()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteBooking} className='mt-4 justify-center items-center w-full'>
                <Text className='font-inter-semibold text-[15px] text-[#ff633e]/50'>{t('delete_booking')}</Text>
              </TouchableOpacity>
            </>
          ) : booking.is_paid ? (
            <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
              <LockClosedIcon strokeWidth={2.1} size={18} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
              <Text className='ml-2 font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                {t('finished_paid')}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              {showServiceFinished ? (
                role === 'pro' ? (
                  <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
                    <ClockIcon strokeWidth={2.1} size={18} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
                    <Text className='ml-2 font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                      {t('waiting_final_payment')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleFinalPayment}
                    className='mt-2 mb-2 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'
                    style={{
                      opacity: 1,
                      shadowColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 10,
                      elevation: 10,
                    }}>
                    <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                      {t('final_payment')}
                    </Text>
                  </TouchableOpacity>
                )
              ) : (
                <TouchableOpacity onPress={startChat} className='mt-2 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'>
                  <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                    {t('write')}
                  </Text>
                </TouchableOpacity>
              )}

              {role !== 'pro' || booking.booking_status !== 'requested' ? (
                showInProgress ? (
                  <TouchableOpacity onPress={() => updateStatus('completed')} className='mt-4 justify-center items-center w-full'>
                    <Text className='font-inter-semibold text-[15px] text-[#979797]'>
                      {t('service_completed')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  !showServiceFinished && (
                    <TouchableOpacity onPress={confirmCancel} className='mt-4 justify-center items-center w-full'>
                      <Text className='font-inter-semibold text-[15px] text-[#ff633e]/50'>{t('cancel_booking')}</Text>
                    </TouchableOpacity>
                  )
                )
              ) : null}

              {role === 'pro' && booking.booking_status === 'requested' && (
                <View className='flex-row justify-between mt-3'>
                  <TouchableOpacity onPress={() => updateStatus('rejected')} className='flex-[1] mr-1 bg-[#E0E0E0] dark:bg-[#3D3D3D] rounded-full items-center py-[18px]'>
                    <Text className='font-inter-semibold text-[15px] text-[#fcfcfc]'>
                      {t('reject')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateStatus('accepted')} className='flex-[2] ml-1 bg-[#74A34F] rounded-full items-center py-[18px]'>
                    <Text className='font-inter-semibold text-[15px] text-[#fcfcfc]'>
                      {t('accept')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

      )}
      
    </SafeAreaView>
    </>
  );
}