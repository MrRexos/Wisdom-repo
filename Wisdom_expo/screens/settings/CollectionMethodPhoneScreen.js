import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function CollectionMethodPhoneScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName, dni, dateOfBirth, frontImage, backImage } = route.params;
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
                </View>
            </TouchableOpacity>
            <View className="justify-center items-center">
              <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('enter_phone_number')}</Text>
            </View>
            <View className="flex-1 px-4 pb-[60px] justify-center items-center">
              <View className="w-full h-10 mb-6 p-2 border-b-[1px] border-[#444343] dark:border-[#f2f2f2]">
                <TextInput
                placeholder={t('phone_number')}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeholderTextColorChange}
                onChangeText={setPhone}
                value={phone}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                keyboardType="phone-pad"
                className="h-[50px] w-full flex-1 font-inter-medium text-[18px] text-[#515150] dark:text-[#d4d4d3]"
                />
              </View>
            </View>
            <View className="flex-row justify-center items-center">
              <TouchableOpacity
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
              disabled={phone.length < 1}
              onPress={() => navigation.navigate('CollectionMethod2', { fullName, dni, dateOfBirth, phone, frontImage, backImage })}
              style={{opacity: phone.length < 1 ? 0.5 : 1.0}}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}
