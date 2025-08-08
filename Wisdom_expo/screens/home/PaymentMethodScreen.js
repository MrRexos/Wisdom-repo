import React, { useState, useEffect } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { CreditCard } from 'react-native-feather';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import api from '../../utils/api';
import { storeDataLocally } from '../../utils/asyncStorage';

export default function PaymentMethodScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState({});
  const isAutoPay = !!(route.params?.clientSecret && route.params?.paymentMethodId);
  const [processing, setProcessing] = useState(isAutoPay);
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const clientSecret = route.params?.clientSecret;
  const onSuccess = route.params?.onSuccess;
  const bookingId = route.params?.bookingId;
  const isFinal = route.params?.isFinal;
  const origin = route.params?.origin;
  const prevParams = route.params?.prevParams;
  const role = route.params?.role;
  const paymentMethodId = route.params?.paymentMethodId;

  const handleBack = () => {
    if (origin === 'Booking') {
      if (bookingId) {
        navigation.navigate('Booking', { ...prevParams, bookingId });
      } else {
        navigation.navigate('Booking', { ...prevParams });
      }
    } else if (origin === 'BookingDetails') {
      navigation.navigate('BookingDetails', { bookingId, role });
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (!clientSecret || !paymentMethodId) return;
    let mounted = true;
    (async () => {
      setProcessing(true);
      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodId,
      });
      if (!mounted) return;
      if (error) {
        console.log('Payment error', error);
        setProcessing(false);
        return;
      }
      setProcessing(false);
      if (onSuccess) navigation.navigate(onSuccess, bookingId ? { bookingId } : {});
      else handleBack();
    })();
    return () => { mounted = false; };
  }, [clientSecret, paymentMethodId]);

  const handleDone = async () => {
    if (!cardDetails.complete) return;
    try {
      if (isFinal && bookingId) {
        setProcessing(true);
        const { paymentMethod, error } = await createPaymentMethod({
          paymentMethodType: 'Card',
          card: cardDetails,
        });
        if (error) {
          console.log('Payment method error', error);
          setProcessing(false);
          return;
        }
        await api.post(`/api/bookings/${bookingId}/final-payment-transfer`, {
          payment_method_id: paymentMethod.id,
        });
      } else {
        const { paymentMethod, error } = await createPaymentMethod({
          paymentMethodType: 'Card',
          card: cardDetails,
        });
        if (error) {
          console.log('Payment method error', error);
          return;
        }
        const cardData = {
          id: paymentMethod.id,
          last4: paymentMethod.card?.last4,
          expiryMonth: paymentMethod.card?.expMonth ?? paymentMethod.card?.exp_month,
          expiryYear: paymentMethod.card?.expYear ?? paymentMethod.card?.exp_year,
        };
        await storeDataLocally('paymentMethod', JSON.stringify(cardData));
        handleBack();
        return;
      }

      handleBack();
    } catch (e) {
      console.log('handleDone error', e);
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] justify-center items-center'>
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        <CreditCard height={60} width={60} strokeWidth={1.5} color={iconColor} />
        <ActivityIndicator className='mt-4' size='large' color={colorScheme === 'dark' ? '#fcfcfc' : '#323131'} />
        <Text className='mt-2 font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]'>
          {t('processing_payment')}
        </Text>
      </SafeAreaView>
    );
  }

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
                {origin === 'BookingDetails' ? t('pay') : t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
