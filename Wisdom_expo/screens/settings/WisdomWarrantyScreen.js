import React from 'react';
import { View, StatusBar, SafeAreaView, Platform, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function WisdomWarrantyScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const titleColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textColor = '#979797';
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textStyle = 'mb-2 font-inter-medium';

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <View className="pl-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <Text style={{ color: titleColor }} className="text-2xl font-inter-bold mb-10">
          {t('wisdom_warranty')}
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
