import React from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon, CheckCircleIcon } from 'react-native-heroicons/outline';
import api from '../../utils/api.js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';


export default function ConfirmPaymentScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const downloadInvoice = async () => {
    if (!route.params?.bookingId) return;
    try {
      const res = await api.get(`/api/bookings/${route.params.bookingId}/invoice`, { responseType: 'arraybuffer' });
      const path = FileSystem.documentDirectory + `invoice_${route.params.bookingId}.pdf`;
      const base64 = Buffer.from(res.data, 'binary').toString('base64');
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path);
    } catch (e) {
      console.log('download invoice error', e);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <View className="flex-1 justify-start items-center">

        <View className="w-full items-end px-6 mt-2">
          <TouchableOpacity onPress={() => {
            if (route?.params?.serviceId) {
              navigation.navigate('AddReview', { serviceId: route.params.serviceId });
            } else {
              navigation.navigate('HomeScreen', { screen: 'Home', params: { screen: 'HomeScreen' } });
            }
          }} className="ml-3">
            <XMarkIcon height={24} width={24} strokeWidth={1.8} color={iconColor} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center">

          <CheckCircleIcon height={130} width={130} strokeWidth={1.5} color={iconColor} />

          <View className="mt-10 w-[300px] justify-center items-center">
            <Text className="font-inter-bold text-center text-[25px] text-[#444343] dark:text-[#f2f2f2]">{t('booking_successfully_completed')}</Text>
          </View>

          {route.params?.bookingId && (
            <TouchableOpacity onPress={downloadInvoice} className='mt-8 bg-[#323131] dark:bg-[#fcfcfc] rounded-full px-6 py-3'>
              <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                {t('download_invoice')}
              </Text>
            </TouchableOpacity>
          )}

        </View>



      </View>


    </SafeAreaView>
  );
}