import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity, FlatList, TextInput, Image, Alert, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRightIcon, ChevronLeftIcon, EllipsisHorizontalIcon, TrashIcon } from 'react-native-heroicons/outline';
import { BookmarkIcon } from 'react-native-heroicons/solid';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import api from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import ModalMessage from '../../components/ModalMessage';

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { listId, listTitle } = route.params;
  const [currentTitle, setCurrentTitle] = useState(listTitle);
  const [items, setItems] = useState([]);
  const sheet = useRef();
  const [editing, setEditing] = useState(null);
  const [sheetHeight, setSheetHeight] = useState(350);
  const [optionsText, setOptionsText] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemSheet = useRef();
  const [selectedItem, setSelectedItem] = useState(null);
  const swipeRefs = useRef({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState({ type: null, item: null });
  const currentItemCount = items.length;
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useRefreshOnFocus(fetchItems);
  
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

  const deleteListRequest = useCallback(async () => {
    try {
      await api.delete(`/api/list/${listId}`);
      navigation.navigate('FavoritesScreen');
    } catch (error) {
      console.log('Error al borrar la lista:', error);
    }
  }, [listId, navigation]);

  const deleteItemFromList = useCallback(async (listItemId) => {
    try {
      await api.delete(`/api/lists/${listId}/items/${listItemId}`);
      setItems((prevItems) => prevItems.filter((listItem) => listItem.item_id !== listItemId));
      setNotes((prevNotes) => {
        const updatedNotes = { ...prevNotes };
        delete updatedNotes[listItemId];
        return updatedNotes;
      });
      setSelectedItem((prevSelected) => (prevSelected?.item_id === listItemId ? null : prevSelected));
    } catch (error) {
      console.log('Error al borrar el item de la lista:', error);
    }
  }, [listId]);

  const openItemSheet = useCallback((item) => {
    setSelectedItem(item);
    setTimeout(() => {
      itemSheet.current?.open();
    }, 0);
  }, []);

  const handleItemSheetClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const openDeleteModalForList = useCallback(() => {
    sheet.current?.close();
    setDeleteModalData({ type: 'list', item: null });
    setDeleteModalVisible(true);
  }, []);

  const openDeleteModalForItem = useCallback((item) => {
    itemSheet.current?.close();
    setDeleteModalData({ type: 'item', item });
    setDeleteModalVisible(true);
  }, []);

  const handleDeleteModalDismiss = useCallback(() => {
    setDeleteModalVisible(false);
    setDeleteModalData({ type: null, item: null });
    setSelectedItem(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteModalData.type === 'list') {
      await deleteListRequest();
    } else if (deleteModalData.type === 'item' && deleteModalData.item) {
      await deleteItemFromList(deleteModalData.item.item_id);
    }
  }, [deleteItemFromList, deleteListRequest, deleteModalData]);

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
          t('user_not_found'),
          t('username_or_email_incorrect'),
          [
            {
              text: t('ok'),
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
            <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">{t('per_hour')}</Text>
          </>
        );
      } else if (item.price_type === 'fix') {
        return (
          <>
            <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">{t('fixed_price_prefix')}</Text>
            <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]}</Text>
          </>
        );
      } else {
        return <Text className="font-inter-bold text-[12px] text-[#706F6E] dark:text-[#B6B5B5]">{t('price_on_budget')}</Text>;
      }
    };

    const handleSwipeableOpen = (direction) => {
      if (direction === 'right') {
        const swipeRef = swipeRefs.current[item.item_id];
        swipeRef?.close();
        openDeleteModalForItem(item);
      }
    };

    const renderRightActions = () => (
      <View className="flex-row h-full bg-[#ff633e]">
        <View className="w-[110px] bg-[#ff633e] h-full justify-center items-center rounded-l-2xl">
          <TrashIcon size={22} color="#fcfcfc" />
        </View>
      </View>
    );

    return (
      <ReanimatedSwipeable
        ref={(ref) => {
          if (ref) {
            swipeRefs.current[item.item_id] = ref;
          } else {
            delete swipeRefs.current[item.item_id];
          }
        }}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        onSwipeableOpen={handleSwipeableOpen}
      >
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('ServiceProfile', { serviceId: item.service_id })}
          onLongPress={() => openItemSheet(item)}
          delayLongPress={250}
          className="h-[170px] bg-[#f2f2f2] dark:bg-[#272626]"
        >
          <>
          <View className="flex-row">
            <Image source={item.profile_picture ? { uri: item.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[85px] w-[85px] bg-[#706B5B] rounded-xl" />
            <View className="flex-1 ">
              <View className="flex-row justify-between">
                <Text className="ml-4 mt-1 font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
                <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'}  />
              </View>
              <Text className="ml-4 mt-1 font-inter-semibold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{item.first_name} {item.surname}</Text>
              <View className="justify-center items-center flex-1 ">
                <View className="pl-4 pr-9 flex-row w-full items-center  justify-between ">
                  <View className=" flex-row items-start justify-start ">
                    <Text className="mr-4">
                      {getFormattedPrice()}
                    </Text>
                  </View>
                  {item.review_count > 0 && (
                    <View className="flex-row items-center justify-end ">
                      <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                      <Text className="ml-[3px]">
                        <Text className="font-inter-bold text-[12px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(item.average_rating).toFixed(1)}</Text>
                        <Text> </Text>
                        <Text className="font-inter-medium text-[10px] text-[#706F6E] dark:text-[#B6B5B5]">({item.review_count === 1 ? `${item.review_count} ${t('review')}` : `${item.review_count} ${t('reviews')}`})</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View className="">
            <View className="px-[12px] py-4 border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{ borderBottomWidth: 1 }, index === items.length - 1 && { borderBottomWidth: 0 }]}>
              <View className="h-9 bg-[#D4D4D3] dark:bg-[#474646] rounded-md justify-center items-start">
              <TextInput
                placeholder={t('add_a_note')}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeholderTextColorChange}
                onChangeText={(text) => handleNoteChange(item.item_id, text)}
                value={notes[item.item_id] || ''}
                onSubmitEditing={() => updateNote(item.item_id)}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="px-4 h-[32px] w-[300px] flex-1 text-[13px] text-[#515150] dark:text-[#d4d4d3]"
              />
              </View>
            </View>
          </View>
          </>
        </TouchableWithoutFeedback>
      </ReanimatedSwipeable>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
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
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('change_name')}</Text>
                  </View>
                  <View className="flex-1">
                    {
                      showDone? (
                        <TouchableOpacity onPress={submitOptions} className=" flex-1 justify-center items-end px-2">
                          <Text className="font-inter-semibold text-[#f2f2f2] dark:text-[#706f6e] text-[13px]">{t('done')}</Text>
                        </TouchableOpacity>
                      ):null
                    }
                  </View>
                </View>
                <View className="w-full mx-2 py-2 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                  <TextInput
                    placeholder={editing === 'share' ? t('username_or_email_placeholder') : editing === 'shareRead' ? t('username_or_email_placeholder') : t('change_name_placeholder')}
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
                <TouchableOpacity onPress={() => openSheetWithInput('share')} className="w-full pl-5 py-[2px] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-t-xl justify-center items-start border-[#e0e0e0] dark:border-[#474646] border-b-[1px]">
                    <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('share_this_list')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSheetWithInput('shareRead')} className="w-full mb-2 pl-5 py-[2px] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-b-xl justify-center items-start">           
                    <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('share_in_read_only')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSheetWithInput('changeName')} className="w-full my-2 pl-5 py-[2px] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-xl justify-center items-start">
                    <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('change_the_name')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openDeleteModalForList}
                className="w-full my-2 pl-5 py-[2px] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-xl justify-center items-start">
                    <Text className="font-inter-medium text-[14px] text-[#ff633e]">{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            )}          
          
      </RBSheet>

      <RBSheet
        height={160}
        openDuration={300}
        closeDuration={300}
        onClose={handleItemSheetClose}
        draggable={true}
        ref={itemSheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >
        <View className="flex-1 w-full justify-start items-center pt-3 pb-6 px-5">
          <TouchableOpacity
            onPress={() => selectedItem && openDeleteModalForItem(selectedItem)}
            className="w-full pl-5 py-[2px] bg-[#f2f2f2] dark:bg-[#3d3d3d] flex-1 rounded-xl justify-center items-start"
          >
            <Text className="font-inter-medium text-[14px] text-[#ff633e]">{t('delete_service')}</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      <TouchableOpacity onPress={() => navigation.goBack()} className="pl-4 pt-4">
        <ChevronLeftIcon size={25} strokeWidth={2} color={iconColor} />
      </TouchableOpacity>

      <View className="px-6 pt-5 ">
        <View  className="flex-row justify-between items-center">
          <Text className="font-inter-semibold text-[24px] text-[#444343] dark:text-[#f2f2f2]">
            {currentTitle}
          </Text>
          <TouchableOpacity onPress={() =>sheet.current.open()}>
            <EllipsisHorizontalIcon size={25} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'}/>
          </TouchableOpacity>
        </View>
        {!items.empty ? (
        <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5] pt-3">{currentItemCount === 0 ? t('empty') : currentItemCount === 1 ? `${currentItemCount} ${t('service')}` : `${currentItemCount} ${t('services')}`}</Text>
        ):null}
        <View className="pb-7"></View>
        <View className="absolute bottom-0 left-0 w-[700px] h-1 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]"/>
        </View>
        
      {items.length<1 || items.empty ? (
        // Si la lista está vacía, muestra este mensaje
        <View className='flex-1 justify-center items-center'>
          
          <BookmarkIcon
            color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'}
            size={65}
          />
          
          <Text className="mt-5 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
            {t('empty_list')}
          </Text>
          <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[250px]">
            {t('save_services_to_this_list')}
          </Text>
        </View>
      ) : (
        // Si la lista tiene items, renderiza el FlatList
        <FlatList
          data={items}
          keyExtractor={(item) => item.item_id.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          className='pt-9 pr-[20px] pl-6'
          contentContainerStyle={{
            justifyContent: 'space-between',
          }}
        />
      )}
      <ModalMessage
        visible={deleteModalVisible}
        title={deleteModalData.type === 'list' ? t('delete_list_title') : t('delete_service_from_list_title')}
        description={deleteModalData.type === 'list' ? t('delete_list_description') : t('delete_service_from_list_description')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteModalDismiss}
        onDismiss={handleDeleteModalDismiss}
      />
    </View>
  );
}
