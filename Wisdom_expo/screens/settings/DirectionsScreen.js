import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, ScrollView, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Check, MapPin, MoreHorizontal, Plus } from "react-native-feather";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';


export default function DirectionsScreen() {

  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [userId, setUserId] = useState();
  const [directions, setDirections] = useState([]);
  const sheet = useRef();
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const EditButtons = [
    {
      items: [
        { id: 'edit', label: 'Edit direction', type: 'select', link: 'FAQ' },
        { id: 'delete', label: 'Delete', type: 'delete' },
      ],
    },
  ];

  const fetchDirections = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);

    try {
      const response = await api.get(`/api/directions/${user.id}`);
      return response.data.directions;
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  useEffect(() => {
    const loadDirections = async () => {
      const directionList = await fetchDirections();
      setDirections(directionList);
    };
    loadDirections();
  }, []);

  const deleteDirection = async (addressId) => {
    console.log(addressId)
     try {
       await api.delete(`/api/address/${addressId}`);
       setDirections(directions.filter((direction) => direction.id !== addressId)); // Actualiza la lista localmente
     } catch (error) {
       console.error('Error deleting address:', error);
     }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <RBSheet
        height={250}
        openDuration={300}
        closeDuration={300}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >
        <View className="flex-1 w-full justify-start items-center mt-6 pb-5 px-5">
          {EditButtons.map(({ items }, sectionIndex) => (
            <View key={sectionIndex} style={{ borderRadius: 12, overflow: 'hidden' }} className="w-full">
              {items.map(({ label, id, type, link }, index) => (
                <View key={id} className="pl-5 bg-[#e0e0e0] dark:bg-[#3d3d3d]">
                  <TouchableOpacity
                    onPress={() => {
                      if (type === 'delete') {
                        deleteDirection(selectedAddressId);
                        sheet.current.close();
                      } else if (type === 'select') {
                        navigation.navigate(link);
                        sheet.current.close();
                      }
                    }}
                  >
                    <View className="flex-row items-center justify-start">
                      <View className={`py-[12] flex-1 flex-row items-center justify-start pr-[14] border-[#b6b5b5] dark:border-[#706f6e]`} style={[{ borderTopWidth: 1 }, index === 0 && { borderTopWidth: 0 }]}>
                        <Text className={`font-inter-medium text-[15px] ${type === 'delete' ? 'text-red-600' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>
                          {label}
                        </Text>
                        <View className="flex-1" />

                        {['select', 'link'].includes(type) && <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>
      </RBSheet>

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[90] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
          <View className="flex-1 ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center ">
            <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">Directions</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('AddDirection')} className="flex-1 justify-center items-end">
            <Plus height={25} width={25} strokeWidth={1.7} color={iconColor} className="mr-3" />
          </TouchableOpacity>
        </View>
      </View>

      {(!directions || directions.length<1)? (

        <View className="flex-1 justify-center items-center">
          <MapPin height={55} width={60} strokeWidth={1.7} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
          <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
            No directions found
          </Text>
          <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[300]">Search for addresses to be automatically saved for you</Text>
        </View>
    
      ) : (

      <ScrollView className="flex-1 px-6 mt-[75] ">
        {directions.map((direction) => (
          <View key={direction.direction_id} className="pb-5 mb-5 flex-row w-full justify-center items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
            <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              <MapPin height={22} width={22} strokeWidth={1.6} color={iconColor} />
            </View>

            <View className="pl-4 pr-3 flex-1 justify-center items-start">
              <Text numberOfLines={1} className="mb-[6] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                {[direction.address_1, direction.street_number].filter(Boolean).join(', ')}
              </Text>
              <Text numberOfLines={1} className="font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
                {[direction.postal_code, direction.city, direction.state, direction.country].filter(Boolean).join(', ')}
              </Text>
            </View>

            <View className="h-full justify-start items-center">
              <TouchableOpacity onPress={() => { setSelectedAddressId(direction.address_id); sheet.current.open(); }}>
                <MoreHorizontal height={20} width={20} strokeWidth={1.7} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      )}

    </SafeAreaView>
  );
}
