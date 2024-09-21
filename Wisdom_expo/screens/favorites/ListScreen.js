import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StatusBar, SafeAreaView, Platform, Text, TouchableOpacity, FlatList, TextInput, Image, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRightIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import api from '../../utils/api.js';
import {EllipsisHorizontalIcon} from 'react-native-heroicons/outline';
import RBSheet from 'react-native-raw-bottom-sheet';
import BookMarksFillIcon from 'react-native-bootstrap-icons/icons/bookmarks-fill';

export default function ListScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { listId, listTitle, itemCount } = route.params;
  const [currentTitle, setCurrentTitle] = useState(listTitle);
  const [items, setItems] = useState([]);
  const sheet = useRef();
  const [editing, setEditing] = useState(null); 
  const [sheetHeight, setSheetHeight] = useState(350);
  const [optionsText, setOptionsText] = useState('');
  const [showDone, setShowDone] = useState(false);
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

  useEffect(() => {
    fetchItems();  
  }, []);
  
  useEffect(() => {
    if (!items.empty) {
    const initialNotes = {};
    items.forEach(item => {
      if (item.note) {
        initialNotes[item.item_id] = item.note;
      }
    });
    setNotes(initialNotes);
    }
  }, [items]);

  const handleNoteChange = (itemId, text) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [itemId]: text,
    }));
  };

  const inputOptionsChanged = (event) => {
    const newText = event.nativeEvent.text;
    setOptionsText (newText);
    if (newText.length>0){
      setShowDone(true);
    } else {
      setShowDone(false)
    }
    
};
  
  const submitOptions = () => {
    if (editing === 'share') {
      shareList('edit');
    } else if (editing === 'shareRead') {
      shareList('read');
    } else {
      updateListName(listId);
    }
    setShowDone(false);
  }

  const updateNote = async (itemId) => {
    try {
      await api.put(`/api/items/${itemId}/note`, {
        note: notes[itemId],
      });
    } catch (error) {
      console.log('Error al actualizar la nota:', error);
    }
  };

  const deleteList = async (listId) => {
    try {
      await api.delete(`/api/list/${listId}`);
    } catch (error) {
      console.log('Error al borrar la lista:', error);
    }
    sheet.current.close();
    navigation.navigate('FavoritesScreen');
  };

  const updateListName = async (listId) => {
    try {
      await api.put(`/api/list/${listId}`,{
        newName: optionsText
      });
      setCurrentTitle(optionsText);
    } catch (error) {
      console.log('Error al alctualizar el nombre de la lista:', error);
    }
    sheet.current.close();
    
  };

  const shareList = async (permissions) => {
    try {
      const response = await api.post(`/api/list/share`,{
        listId: listId,
        user: optionsText,
        permissions: permissions
      });
      if (response.data.notFound) {
        Alert.alert(
          'User not found',
          'Username or email are incorrect.',
          [
            {
              text: 'Ok',
              onPress: null,
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        sheet.current.close();
      }
    } catch (error) {
      console.log('Error al compartir lista:', error);
    }
  };

  const openSheetWithInput = (mode) => {
    setEditing(mode);
    if (mode===null) {
      setSheetHeight(350);
    } else {
      setOptionsText("");
      setSheetHeight(250)
    };
    setTimeout(() => {
      sheet.current.open();
    }, 0);
    
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
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
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
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => {
          setEditing(null);
          setSheetHeight(350);
        }}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: {backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2'}
        }}>     
          
            {editing === 'share' || editing === 'changeName' || editing === 'shareRead' ? (                 
              <View className="flex-1 w-full justify-start items-center pt-3 pb-5 px-5"> 
                <View className="flex-row justify-between items-center mb-10">
                  <View className="flex-1 justify-center">
                    <TouchableOpacity onPress={() => openSheetWithInput(null)} >
                        <ChevronLeftIcon size={25} strokeWidth={1.7} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">Change name</Text>
                  </View>
                  <View className="flex-1">
                    {
                      showDone? (
                        <TouchableOpacity onPress={submitOptions} className=" flex-1 justify-center items-end px-2">
                          <Text className="font-inter-semibold text-[#f2f2f2] dark:text-[#706f6e] text-[13px]">Done</Text>
                        </TouchableOpacity>
                      ):null
                    }
                  </View>
                </View>
                <View className="w-full mx-2 py-2 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                  <TextInput
                    placeholder={editing === 'share' ? 'Username or email...' : editing === 'shareRead' ? 'Username or email...' : 'Change name...'}
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeholderTextColorChange}
                    autoFocus={true}
                    onChange = {inputOptionsChanged} 
                    value={optionsText}
                    onSubmitEditing={submitOptions}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={{ flex: 1, padding: 10}}  
                    className="px-5 flex-1 text-[14px] text-[#444343] dark:text-[#f2f2f2]"
                                 
                  />
                </View>
              </View>
            ) : (
              <View className="flex-1 w-full justify-center items-center pt-3 pb-14 px-5">
                <TouchableOpacity onPress={() => openSheetWithInput('share')} className="w-full pl-5 py-[2] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-t-xl justify-center items-start border-[#e0e0e0] dark:border-[#474646] border-b-[1px]">
                    <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">Share this list</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSheetWithInput('shareRead')} className="w-full mb-2 pl-5 py-[2] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-b-xl justify-center items-start">           
                    <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">Share in read-only</Text>            
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSheetWithInput('changeName')} className="w-full my-2 pl-5 py-[2] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-xl justify-center items-start">
                    <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">Change the name</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={ () => Alert.alert(
                  'Are you sure you want to delete this list?',
                  'This list will not be recoverable and will disappear for everyone.',
                  [
                    {
                      text: 'Cancel',
                      onPress: null,
                      style: 'cancel',
                    },
                    {
                      text: 'Delete',
                      onPress: () => deleteList(listId),                      
                      style: 'destructive', 
                    },
                  ],
                  { cancelable: false }
                )} 
                className="w-full my-2 pl-5 py-[2] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-xl justify-center items-start">
                    <Text className="font-inter-medium text-[14px] text-[#ff633e]">Delete</Text>
                </TouchableOpacity>  
              </View>
            )}          
          
      </RBSheet>
      <TouchableOpacity onPress={() => navigation.goBack()} className="pl-4 pt-2">
        <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
      </TouchableOpacity>
      <View className="px-6 pt-8 mb-9">
        <View  className="flex-row justify-between items-center">
          <Text className="font-inter-semibold text-[24px] text-[#444343] dark:text-[#f2f2f2]">
            {currentTitle}
          </Text>
          <TouchableOpacity onPress={() =>sheet.current.open()}>
            <EllipsisHorizontalIcon size={25} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'}/>
          </TouchableOpacity>
        </View>
        {!items.empty ? (
        <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5] pt-3">{itemCount === 0 ? 'empty' : itemCount === 1 ? `${itemCount} service` : `${itemCount} services`}</Text>
        ):null}
        <View className="pb-7"></View>
        <View className="absolute bottom-0 left-0 w-[700] h-1 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]"/>
        </View>
      {items.length<1 || items.empty ? (
      // Si la lista está vacía, muestra este mensaje
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <BookMarksFillIcon height={60} width={60} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
        <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
          Empty list
        </Text>
        <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[250]">
          Save services to this list to easily access them.
        </Text>
      </View>
      ) : (
        // Si la lista tiene items, renderiza el FlatList
        <FlatList
          data={items}
          keyExtractor={(item) => item.item_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            justifyContent: 'space-between',
          }}
        />
      )}
    </SafeAreaView>
  );
}
