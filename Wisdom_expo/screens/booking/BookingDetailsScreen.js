import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon, LockClosedIcon } from 'react-native-heroicons/outline';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import { Check, Lock } from 'react-native-feather';
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
  const sliderTimeoutId = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      setBooking(response.data);
      setEdited(response.data);
      const serviceResp = await api.get(`/api/services/${response.data.service_id}`);
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

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
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

  const combineDateTime = () => {
    return `${selectedDay} ${selectedTime}:00`;
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
      const payload = {
        ...edited,
        booking_start_datetime: combineDateTime(),
        service_duration: selectedDuration,
      };
      await api.put(`/api/bookings/${bookingId}`, payload);
      setBooking(payload);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status });
      fetchBooking();
    } catch (error) {
      console.error('Error updating status:', error);
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
      const participants = [me.id, booking.service_user_id || booking.service_userid || booking.user_id];
      const conversationId = [...participants].sort().join('_');
      await setDoc(
        doc(db, 'conversations', conversationId),
        {
          participants,
          name: booking.service_title,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      navigation.navigate('Conversation', {
        conversationId,
        participants,
        name: booking.service_title,
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
    const now = new Date();
    const startDate = booking.booking_start_datetime
      ? new Date(booking.booking_start_datetime)
      : null;
    return (
      booking.booking_status === 'canceled' ||
      booking.booking_status === 'rejected' ||
      (startDate && startDate < now && booking.booking_status !== 'accepted')
    );
  };

  const getInactiveMessage = () => {
    if (booking.booking_status === 'canceled') return t('booking_canceled');
    if (booking.booking_status === 'rejected') return t('booking_rejected');
    return t('booking_expired');
  };

  if (!booking) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View className='flex-row items-center justify-between px-2 pt-3  pb-3 '>

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
          <TouchableOpacity onPress={() => setEditMode(!editMode)} className='mr-2 justify-center items-center rounded-full px-3 py-2 bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
            <Text className='font-inter-medium text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>
                {editMode ? t('cancel') : t('edit')}
            </Text>
          </TouchableOpacity>
        </View>

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

        <View className='mb-4'>
          <Text className='mb-2 font-inter-bold text-[16px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('date')}</Text>
          {editMode ? (
            <>
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
              <View className='mt-4'>
                <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Text className='ml-1 font-inter-bold text-[16px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('start_time')}</Text>
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
              <View className='mt-4'>
                <Text className='ml-1 font-inter-bold text-[16px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('duration')}: {formatDuration(selectedDuration)}</Text>
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
            </>
          ) : (
            <Text className='font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]'>{formatDateTime(booking.booking_start_datetime)}</Text>
          )}
        </View>

        <View className='mb-4'>
          <Text className='mb-2 font-inter-bold text-[16px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('description')}</Text>

          {editMode ? (
            <TextInput
              value={edited.description || ''}
              onChangeText={(text) => setEdited({ ...edited, description: text })}
              multiline
              className='px-3 py-3 rounded-lg font-inter-medium bg-[#fcfcfc] dark:bg-[#323131] text-[#444343] dark:text-[#f2f2f2]'
            />
          ) : (
            <Text className='font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]'>{booking.description || '-'}</Text>
          )}
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
          ) : (
            <>
              <TouchableOpacity onPress={startChat} className='mt-2 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'>
                <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                  {t('write')}
                </Text>
              </TouchableOpacity>

              {role !== 'pro' || booking.booking_status !== 'requested' ? (
                <TouchableOpacity onPress={confirmCancel} className='mt-4 justify-center items-center w-full'>
                  <Text className='font-inter-semibold text-[15px] text-[#ff633e]/50'>{t('cancel_booking')}</Text>
                </TouchableOpacity>
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
  );
}