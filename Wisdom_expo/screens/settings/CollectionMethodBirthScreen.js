import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function CollectionMethodBirthScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName } = route.params;
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const [date, setDate] = useState(new Date());
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate instanceof Date) {
      setDate(selectedDate);
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
        <View className="justify-center items-center">
          <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('date_of_birth')}</Text>
        </View>
        <View className="flex-1 justify-center items-center pb-4">
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            textColor={colorScheme === 'dark' ? '#f2f2f2' : '#444343'}
          />
          <View className="mt-10"/>
        </View>
        
        <View className="flex-row justify-center items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
            <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CollectionMethodDni', { fullName, dateOfBirth: date.toISOString().split('T')[0] })}
            className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

