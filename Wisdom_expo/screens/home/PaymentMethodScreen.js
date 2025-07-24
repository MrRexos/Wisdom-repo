import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { CreditCard } from 'react-native-feather';
import { storeDataLocally } from '../../utils/asyncStorage';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import api from '../../utils/api';

export default function PaymentMethodScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState({});
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const clientSecret = route.params?.clientSecret;
  const onSuccess = route.params?.onSuccess;
  const bookingId = route.params?.bookingId;
  const isFinal = route.params?.isFinal;
  const origin = route.params?.origin;
  const prevParams = route.params?.prevParams;
  const role = route.params?.role;
  console.log(prevParams)

  const handleBack = () => {
    if (origin === 'Booking') {
      navigation.navigate('Booking', { ...prevParams, bookingId });
    } else if (origin === 'BookingDetails') {
      navigation.navigate('BookingDetails', { bookingId, role });
    } else {
      navigation.goBack();
    }
  };

  const handleDone = async () => {
    if (!cardDetails.complete) return;
    try {
      if (clientSecret) {
        const { error } = await confirmPayment(clientSecret, { paymentMethodType: 'Card' });
        if (error) {
          console.log('Payment error', error);
          return;
        }
      } else if (isFinal && bookingId) {
        const { paymentMethod, error } = await createPaymentMethod({
          paymentMethodType: 'Card',
          card: cardDetails,
        });
        if (error) {
          console.log('Payment method error', error);
          return;
        }
        await api.post(`/api/bookings/${bookingId}/final-payment-transfer`, {
          payment_method_id: paymentMethod.id,
        });
      }

      if (onSuccess) {
        navigation.navigate(onSuccess, bookingId ? { bookingId } : {});
      } else {
        handleBack();
      }
    } catch (e) {
      console.log('handleDone error', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <View className='absolute bg-[#f2f2f2] dark:bg-[#272626] h-[100px] w-full z-10 justify-end'>
        <View className='flex-row justify-between items-center mt-8 pb-4 px-2'>
          <View className='flex-1'>
            <TouchableOpacity onPress={handleBack} className='ml-3'>
              <ChevronLeftIcon size={24} strokeWidth={1.8} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View className='flex-3 justify-center items-center'>
            <Text className='font-inter-bold text-center text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
              {t('payment_method')}
            </Text>
          </View>
          <View className='flex-1 h-2'></View>
        </View>
      </View>

      <View className='h-[70px] w-full justify-end' />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className='mt-8 flex-1 justify-between items-center'>
          <View className='flex-1 w-full px-4 justify-start items-start'>
            <CardField
              postalCodeEnabled={false}
              autofocus
              cardStyle={{
                backgroundColor: colorScheme === 'dark' ? '#3D3D3D' : '#E0E0E0',
                textColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
              }}
              style={{ width: '100%', height: 50 }}
              onCardChange={setCardDetails}
            />
          </View>

          <View className='flex-row justify-center items-center pb-3 px-6'>
            <TouchableOpacity
              onPress={handleDone}
              disabled={!cardDetails.complete}
              style={{ opacity: cardDetails.complete ? 1 : 0.5 }}
              className='bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center'
            >
              <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                {t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
