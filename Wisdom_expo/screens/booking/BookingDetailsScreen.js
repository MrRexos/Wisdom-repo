import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import api from '../../utils/api.js';

export default function BookingDetailsScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, role } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [booking, setBooking] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState({});

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      setBooking(response.data);
      setEdited(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const saveChanges = async () => {
    try {
      await api.put(`/api/bookings/${bookingId}`, edited);
      setBooking(edited);
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

  if (!booking) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className='flex-row items-center justify-between px-6 pt-[55] pb-4 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]'>
        <TouchableOpacity onPress={() => navigation.goBack()} className='p-2'>
          <XMarkIcon size={22} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>
        <Text className='font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
          {t('booking_details')}
        </Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)} className='p-2'>
          <Text className='font-inter-medium text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>
            {editMode ? t('save') : t('edit')}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView className='flex-1 px-6 mt-4'>
        <View className='mb-4'>
          <Text className='font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('service')}</Text>
          <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>{booking.service_title}</Text>
        </View>
        <View className='mb-4'>
          <Text className='font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('date')}</Text>
          {editMode ? (
            <TextInput
              value={edited.booking_start_datetime || ''}
              onChangeText={(text) => setEdited({ ...edited, booking_start_datetime: text })}
              className='px-3 py-2 rounded-xl bg-[#fcfcfc] dark:bg-[#323131] text-[#444343] dark:text-[#f2f2f2]'
            />
          ) : (
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>{booking.booking_start_datetime}</Text>
          )}
        </View>
        <View className='mb-4'>
          <Text className='font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>{t('description')}</Text>
          {editMode ? (
            <TextInput
              value={edited.description || ''}
              onChangeText={(text) => setEdited({ ...edited, description: text })}
              multiline
              className='px-3 py-2 rounded-xl bg-[#fcfcfc] dark:bg-[#323131] text-[#444343] dark:text-[#f2f2f2]'
            />
          ) : (
            <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>{booking.description || '-'}</Text>
          )}
        </View>
        {editMode && (
          <TouchableOpacity onPress={saveChanges} className='mt-2 mb-4 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-3'>
            <Text className='font-inter-medium text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
              {t('save_changes')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Chat')} className='mt-2 mb-4 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-3'>
          <Text className='font-inter-medium text-[15px] text-[#fcfcfc] dark:text-[#323131]'>{t('write')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmCancel} className='mt-2 mb-10 bg-red-600 rounded-full items-center py-3'>
          <Text className='font-inter-medium text-[15px] text-[#fcfcfc]'>{t('cancel_booking')}</Text>
        </TouchableOpacity>
        {role === 'pro' && booking.booking_status === 'requested' && (
          <View className='flex-row justify-between mt-4'>
            <TouchableOpacity onPress={() => updateStatus('rejected')} className='flex-1 mr-2 bg-red-600 rounded-full items-center py-3'>
              <Text className='font-inter-medium text-[15px] text-[#fcfcfc]'>{t('reject')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateStatus('accepted')} className='flex-1 ml-2 bg-green-600 rounded-full items-center py-3'>
              <Text className='font-inter-medium text-[15px] text-[#fcfcfc]'>{t('accept')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}