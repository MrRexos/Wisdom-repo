import React, { useEffect, useState, useRef } from 'react';
import { View, StatusBar, SafeAreaView, Platform, Text, TouchableOpacity, FlatList, TextInput, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRightIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import api from '../../utils/api.js';
import {EllipsisHorizontalIcon} from 'react-native-heroicons/outline';
import RBSheet from 'react-native-raw-bottom-sheet';

export default function ListScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { listId, listTitle, itemCount } = route.params;
  const [items, setItems] = useState([]);
  const sheet = useRef();
  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  // Estado para manejar el texto de la nota
  const [notes, setNotes] = useState({});

  const fetchItems = async () => {
    try {
      const response = await api.get(`/api/lists/${listId}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };

  const options = async () => {
    null
  };

  useEffect(() => {
    fetchItems();
    
  }, []);
  
  useEffect(() => {
    const initialNotes = {};
    items.forEach(item => {
      if (item.note) {
        initialNotes[item.item_id] = item.note;
      }
    });
    setNotes(initialNotes);
  }, [items]);

  const handleNoteChange = (itemId, text) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [itemId]: text,
    }));
  };
  
  const updateNote = async (itemId) => {
    try {
      await api.put(`/api/items/${itemId}/note`, {
        note: notes[itemId],
      });
    } catch (error) {
      console.log('Error al actualizar la nota:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    const getFormattedPrice = () => {
      const numericPrice = parseFloat(item.price);
      const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
      if (item.price_type === 'hour') {
        return (
          <>
            <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]}</Text>
            <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">/hour</Text>
          </>
        );
      } else if (item.price_type === 'fix') {
        return (
          <>
            <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">Fixed Price: </Text>
            <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]}</Text>
          </>
        );
      } else {
        return <Text className="font-inter-bold text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">Price on budget</Text>;
      }
    };

    return (
      <TouchableOpacity onPress={null} className="h-[170]">
        <View className="flex-row">
          <Image source={item.profile_picture ? { uri: item.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[85] w-[85] bg-[#706B5B] rounded-xl ml-6" />
          <View className="flex-1">
            <View className="flex-row justify-between">
              <Text className="ml-4 mt-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
              <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} style={{ marginRight: 20 }} />
            </View>
            <Text className="ml-4 mt-1 font-inter-semibold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{item.first_name} {item.surname}</Text>
            <View className="justify-center items-center flex-1">
              <View className="flex-row items-center">
                <Text className="mr-4">
                  {getFormattedPrice()}
                </Text>
                {item.review_count > 0 && (
                  <View className="flex-row items-center">
                    <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                    <Text className="ml-[3]">
                      <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(item.average_rating).toFixed(1)}</Text>
                      <Text> </Text>
                      <Text className="font-inter-medium text-[10px] text-[#706F6E] dark:text-[#B6B5B5]">({item.review_count === 1 ? `${item.review_count} review` : `${item.review_count} reviews`})</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        <View className="px-5">
          <View className="px-[14] py-4 border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{ borderBottomWidth: 1 }, index === items.length - 1 && { borderBottomWidth: 0 }]}>
            <View className="h-9 bg-[#D4D4D3] dark:bg-[#474646] rounded-md justify-center items-start">
            <TextInput
              placeholder='Add a note...'
              selectionColor={cursorColorChange}
              placeholderTextColor={placeholderTextColorChange}
              onChangeText={(text) => handleNoteChange(item.item_id, text)}
              value={notes[item.item_id] || ''}
              onSubmitEditing={() => updateNote(item.item_id)}
              className="px-4 h-[32] w-[300] flex-1 text-[13px] text-[#515150] dark:text-[#d4d4d3]"
            />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <RBSheet
        height={310}
        openDuration={250}
        closeDuration={250}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
        }}>     
          <View>
            <View className=" mx-5 my-3 bg-[#f2f2f2] dark:bg-[#272626] flex-1 rounded-xl"></View>
            <Text>a</Text>
          </View>
      </RBSheet>
      <TouchableOpacity onPress={() => navigation.goBack()} className="pl-4 pt-2">
        <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
      </TouchableOpacity>
      <View className="px-6 pt-8 pb-9">
        <View className="flex-row justify-between items-center">
          <Text className="font-inter-semibold text-[24px] text-[#444343] dark:text-[#f2f2f2]">
            {listTitle}
          </Text>
          <TouchableOpacity onPress={() =>sheet.current.open()}>
            <EllipsisHorizontalIcon size={25} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'}/>
          </TouchableOpacity>
        </View>
        <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5] pt-4">{itemCount === 0 ? 'empty' : itemCount === 1 ? `${itemCount} service` : `${itemCount} services`}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.item_id}
        renderItem={renderItem}
        contentContainerStyle={{
          justifyContent: 'space-between',
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
  }
})