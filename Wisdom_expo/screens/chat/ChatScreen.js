import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIco, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { ChatBubbleLeftRightIcon } from 'react-native-heroicons/solid';
import { Calendar, Search } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';


export default function ChatScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [userId, setUserId] = useState();

  const suggestions = [
    { label: t('all'), value: 'all', id: 1 },
    { label: t('professionals'), value: 'professionals', id: 2 },
    { label: t('help'), value: 'help', id: 3 },
  ];

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        const userData = await getDataLocally('user');
        console.log(userData);

        // Comprobar si userData indica que no hay usuario
        if (userData === '{"userToken":false}') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'GetStarted' }],
          });
        }
      };

      checkUserData();
    }, [navigation])
  );


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 pt-[55] pb-3">

        <View className="mb-4 px-6 w-full flex-row justify-between items-center">
          <Text className="mb-2 font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
            {t('chat')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Conversation')} className="p-[12] bg-[#fcfcfc] dark:bg-[#323131] rounded-full">
            <Search height={18} width={18} color={iconColor} strokeWidth={2.1} />
          </TouchableOpacity>
        </View>

        <View className="pb-5 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="pl-6">
            {suggestions.map((item, index) => (
              <View key={index} className="pr-2">
                <TouchableOpacity
                  className={`px-4 py-3 rounded-full ${selectedStatus === item.value ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#e0e0e0] dark:bg-[#3d3d3d]'}`}
                  onPress={() => setSelectedStatus(item.value)}
                >
                  <Text className={`font-inter-medium text-[14px] ${selectedStatus === item.value ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {true ? (
          <View className="flex-1 justify-center items-center">
            <ChatBubbleLeftRightIcon height={65} width={70} fill={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
            <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
              {t('no_chats_found')}
            </Text>
            <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[260]">
              {t('write_to_professionals_and_talk_about_your_bookings')}
            </Text>
          </View>

        ) : (

          <View className="flex-1 justify-center items-center">
          </View>

        )}

      </View>
    </SafeAreaView>
  );
}