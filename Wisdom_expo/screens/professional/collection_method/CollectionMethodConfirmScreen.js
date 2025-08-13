import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import api from '../../../utils/api.js';
import { getDataLocally, storeDataLocally } from '../../../utils/asyncStorage';

export default function CollectionMethodConfirmScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName, dni, dateOfBirth, phone, frontImage, backImage, iban, country, state, city, street, postalCode, streetNumber, address2 } = route.params;
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';

  const [loading, setLoading] = useState(false);

  const uploadDni = async (image) => {
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'dni.jpg',
    });
    const res = await api.post('/api/upload-dni', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.fileToken;
  };

  const handleFinish = async () => {
    setLoading(true);
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    try {
      const fileTokenAnverso = await uploadDni(frontImage);
      const fileTokenReverso = await uploadDni(backImage);
      const response = await api.post(`/api/user/${user.id}/collection-method`, {
        full_name: fullName,
        date_of_birth: dateOfBirth,
        nif: dni,
        iban: iban,
        address_type: "residential",
        street_number: streetNumber,
        address_1: street,
        address_2: address2,
        postal_code: postalCode,
        city: city,
        state: state,
        country: country,
        phone: phone,
        fileTokenAnverso,
        fileTokenReverso
      });
      if (response.data && response.data.stripe_account_id) {
        user.stripe_account_id = response.data.stripe_account_id;
        await storeDataLocally('user', JSON.stringify(user));
      }
      navigation.navigate('WalletPro');
    } catch (error) {
      console.error('Error creating collection method:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.navigate('WalletPro')}>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
                </View>
            </TouchableOpacity>
            <View className="justify-center items-center mb-2">
              <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('review_information')}</Text>
            </View>

            {/* Card de confirmación */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 50 }}
              className="flex-1"
              showsVerticalScrollIndicator={false}
            >
              <View
                className="w-full rounded-2xl px-5 py-6 bg-[#E0E0E0] dark:bg-[#3D3D3D]"
              >
                <View className="mb-4">
                  <Text className="font-inter-medium text-[12px] mb-1 text-[#b6b5b5] dark:text-[#706f6e]">{t('full_name')}</Text>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{fullName}</Text>
                </View>
                <View className="mb-4">
                  <Text className="font-inter-medium text-[12px] mb-1 text-[#b6b5b5] dark:text-[#706f6e]">{t('dni')}</Text>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{dni}</Text>
                </View>
                <View className="mb-4">
                  <Text className="font-inter-medium text-[12px] mb-1 text-[#b6b5b5] dark:text-[#706f6e]">{t('date_of_birth')}</Text>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{dateOfBirth}</Text>
                </View>
                <View className="mb-4">
                  <Text className="font-inter-medium text-[12px] mb-1 text-[#b6b5b5] dark:text-[#706f6e]">{t('phone_number')}</Text>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{phone}</Text>
                </View>
                <View className="mb-4">
                  <Text className="font-inter-medium text-[12px] mb-1 text-[#b6b5b5] dark:text-[#706f6e]">{t('iban')}</Text>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{iban}</Text>
                </View>

                <View className="mb-2">
                  <Text className="font-inter-medium text-[12px] mb-1 text-[#b6b5b5] dark:text-[#706f6e]">{t('direction')}</Text>
                  <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{street} {streetNumber}, {postalCode}, {city}, {state}, {t(`countries.${country}`)}</Text>
                </View>
                
                
              </View>
            </ScrollView>

            <View className="flex-row justify-center items-center mt-4">
              <TouchableOpacity
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
              disabled={loading}
              onPress={handleFinish}
              style={{opacity: loading ? 0.5 : 1.0}}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                  {loading ? (
                    <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
                  ) : (
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('finish')}</Text>
                  )}
              </TouchableOpacity>
            </View>
        </View>
        
    </SafeAreaView>
  );
}
 