import React, { useEffect, useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, FlatList, Button, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, MapPinIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { Search, Clock, MapPin } from "react-native-feather";
import * as Location from 'expo-location';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';

export default function SearchServiceScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation(); // Eliminamos la redundancia de i18n
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {prevScreen} = route.params;
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [historySearchedServices, setHistorySearchedServices] = useState([]);
  const [userId, setUserId] = useState();
  const [isSearchOptionsVisible, setSearchOptionsVisible] = useState(true);
  const [blurVisible, setBlurVisible] = useState(false);


  useEffect(() => {
    if (route.params && route.params.blurVisible !== undefined) {
      setBlurVisible(true);
    }
  }, [route.params]);

  const handleClearText = () => {
    setSearchText('');
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const fetchSuggestions = async (input) => {
    try {
      setSuggestions([]); // Se limpia correctamente con un array vacío
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const saveHistorySearchedService = async (newService) => {
    try {
      let history = await getDataLocally('historySearchedServices');
      history = history ? JSON.parse(history) : [];

      // Verificar si el servicio ya existe en el historial
      const exists = history.some(service => JSON.stringify(service) === JSON.stringify(newService));

      if (!exists) {
        if (history.length >= 8) {
          history.shift();
        }
        history.push(newService);
        await storeDataLocally('historySearchedServices', JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error saving services history:', error);
    }
  };

  const getHistorySearchedServices = async () => {
    try {
      const history = await getDataLocally('historySearchedServices');
      const parsedHistory = history ? JSON.parse(history) : [];
      setHistorySearchedServices(parsedHistory);
    } catch (error) {
      console.error('Error retrieving service history:', error);
    }
  };

  const handleSelected = async (serviceId) => {
    saveHistorySearchedService(serviceId);

    const searchedService = {};
    await storeDataLocally('searchedService', JSON.stringify(searchedService));
    navigation.navigate(prevScreen, {blurVisible});
  };

  const clearHistory = async () => {
    await storeDataLocally('historySearchedServices', JSON.stringify([])); // Corregido a 'historySearchedServices'
    getHistorySearchedServices(); // Corregido a getHistorySearchedServices
  };

  useEffect(() => {
    const getUserId = async () => {
      const userData = await getDataLocally('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user?.id); // Verificación adicional para evitar errores
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (searchText.length > 0) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchText);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      getHistorySearchedServices();
    }
  }, [searchText]);

  const renderSuggestions = ({ item }) => (
    <TouchableOpacity className="pb-7 flex-row justify-between items-center" onPress={() => {
      if (searchText.length > 0) {
        handleSelected(item.service_id);
      }
    }}>
      <View className="flex-row justify-start items-center">
        <View className="w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
          {item.place_id === 'your_location' ?
            <MapPinIcon height={21} color={iconColor} strokeWidth="1.7" /> :
            searchText.length > 0 ? <Search height={17} color={iconColor} strokeWidth="2" /> :
              <Clock height={19} color={iconColor} strokeWidth="2" />}
        </View>
        <Text className="ml-4 text-[15px] text-[#444343] dark:text-[#f2f2f2]">{item.description}</Text>
      </View>
      <ChevronRightIcon size={18} color={colorScheme === 'dark' ? '#706F6E' : '#b6b5b5'} strokeWidth="2.5" className="p-6" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      

      <View className="px-5 pt-4 flex-1">

        <View className="flex-row justify-start items-center mb-5">
          <TouchableOpacity onPress={() => navigation.navigate(prevScreen, {blurVisible})}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6" />
          </TouchableOpacity>

          <View className="h-[55] ml-4 pl-3 pr-1 flex-1 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            <Search height={20} color={iconColor} strokeWidth="2" />
            <TextInput
              placeholder='Search a service...'
              autoFocus={true}
              selectionColor={cursorColorChange}
              placeholderTextColor={placeHolderTextColorChange}
              onChangeText={handleSearch}
              value={searchText}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              className="flex-1 px-3 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]" />

            {searchText.length > 0 ? (
              <TouchableOpacity onPress={handleClearText}>
                <View className='mr-2 h-[25] w-[25] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                  <XMarkIcon height={17} color={iconColor} strokeWidth="2" />
                </View>
              </TouchableOpacity>
            ) : null}

          </View>
        </View>

        {searchText.length < 1 ? (
          <View className="mb-6 flex-row justify-between items-center">
            <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">Recent searches</Text>
            {historySearchedServices.length > 1 ? (
              <TouchableOpacity onPress={() => clearHistory()} className="px-3 py-2 rounded-full justify-center items-center bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                <Text className="font-inter-semibold text-[10px] text-[#706f6e] dark:text-[#b6b5b5]">CLEAR</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <FlatList
          data={searchText.length < 1 ? historySearchedServices : suggestions}
          keyExtractor={(item) => item.service_id || item.place_id} // Asegúrate de que service_id o place_id existan
          renderItem={renderSuggestions}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(151, 151, 151, 0.5)', // Fondo con opacidad
  },
  blur: {
    ...StyleSheet.absoluteFillObject, // Ocupa todo el fondo
  },
});
