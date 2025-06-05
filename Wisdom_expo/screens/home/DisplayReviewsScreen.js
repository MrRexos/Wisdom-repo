import React from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../languages/i18n.js';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';

export default function DisplayReviewsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { reviews } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const renderItem = ({ item }) => (
    <View className="mb-4 py-5 px-4 w-[320] bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">
      <View className="flex-row justify-between items-center">
        <View className="flex-row justify-start items-center">
          <Image source={{ uri: item.user.profile_picture }} className="mr-3 h-10 w-10 rounded-full bg-[#706F6E] dark:bg-[#b6b5b5]" />
          <View className="justify-center items-start">
            <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">
              {item.user.first_name} {item.user.surname}
            </Text>
            <Text className="mt-1 font-inter-medium text-[9px] text-[#706F6E] dark:text-[#b6b5b5]">
              {new Date(item.review_datetime).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-end items-center">
          <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1 }] }} />
          <Text className="ml-1 mr-2 font-inter-bold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{item.rating}</Text>
        </View>
      </View>
      <Text className="mt-5 mb-3 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.rating}</Text>
      <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="px-6 pt-10 pb-3 justify-center items-center">
        <View className="mb-6 w-full flex-row justify-center items-center">
          <View className="flex-1 justify-center items-start">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{t('reviews')}</Text>
          </View>
          <View className="flex-1 justify-center items-start"></View>
        </View>

        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, marginTop: 10, height: '100%', width: '100%' }}
        />
      </View>
    </SafeAreaView>
  );
}
