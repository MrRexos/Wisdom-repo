import React, { useState, useEffect } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Alert } from 'react-native';import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { CreditCard } from 'react-native-feather';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import api from '../../utils/api';
import ModalMessage from '../../components/ModalMessage';

export default function PaymentMethodScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState({});
  const isAutoPay = !!(route.params?.autoConfirm && route.params?.clientSecret && route.params?.paymentMethodId);
  const [processing, setProcessing] = useState(isAutoPay);
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const clientSecret = route.params?.clientSecret;
  const onSuccess = route.params?.onSuccess;
  const bookingId = route.params?.bookingId;
  const origin = route.params?.origin;
  const prevParams = route.params?.prevParams;
  const role = route.params?.role;
  const paymentMethodId = route.params?.paymentMethodId;

  const [paymentErrorVisible, setPaymentErrorVisible] = useState(false);

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
    // Autoconfirmación cuando venimos de SCA con clientSecret + paymentMethodId
    if (!isAutoPay) return;
    let mounted = true;
    (async () => {
      setProcessing(true);
      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { paymentMethodId },
      });
      if (!mounted) return;
      setProcessing(false);
      if (error) {
        console.log('Payment error', error);
        Alert.alert(t('payment_error'), t('payment_error_message'), [{ text: t('ok') }]);
        return;
      }
      if (onSuccess) navigation.navigate(onSuccess, bookingId ? { bookingId } : {});
      else handleBack();
    })();
    return () => { mounted = false; };
  }, [isAutoPay]);

  const handleDone = async () => {
    if (!cardDetails.complete) return;
    try {
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        card: cardDetails,
      });
      if (error) {
        console.log('Payment method error', error);
        Alert.alert(t('payment_error'), t('payment_error_message'), [{ text: t('ok') }]);
        return;
      }
  
      // Guarda localmente la tarjeta (opcional, como ya hacías)
      const cardData = {
        id: paymentMethod.id,
        last4: cardDetails.last4,
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
      };
  
      // Si venimos con un Intent pendiente (depósito o SCA), confírmalo ahora
      if (clientSecret) {
        setProcessing(true);
        const { error: confirmErr } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
          paymentMethodData: { paymentMethodId: paymentMethod.id },
        });
        if (confirmErr) {
          console.log('Confirm error', confirmErr);
          setProcessing(false);
          Alert.alert(t('payment_error'), t('payment_error_message'), [{ text: t('ok') }]);
          return;
        }
        setProcessing(false);
        if (onSuccess) {
          navigation.navigate(onSuccess, bookingId ? { bookingId } : {});
        } else {
          handleBack();
        }
        return;
      }
  
      // Solo guardar para el flujo actual → devolvemos a origen con el PM en params
     setProcessing(false);
     if (origin === 'Booking') {
       navigation.navigate('Booking', { ...prevParams, savedPaymentMethod: cardData });
     } else if (origin === 'BookingDetails') {
       navigation.navigate('BookingDetails', { bookingId, role, savedPaymentMethod: cardData });
     } else {
       handleBack();
     }
    } catch (e) {
      console.log('handleDone error', e);
      setProcessing(false);
      Alert.alert(t('payment_error'), t('payment_error_message'), [{ text: t('ok') }]);
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
                {t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <ModalMessage
        visible={paymentErrorVisible}
        title={t('payment_error')}
        description={t('payment_error_description')}
        showCancel={false}
        confirmText={t('ok')}
        onConfirm={() => setPaymentErrorVisible(false)}
      />
    </SafeAreaView>
  );
}
