import React, { useState, useCallback, useRef } from 'react'
import { View, StatusBar, Platform, Text, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus } from "react-native-feather";
import { BookmarkIcon } from 'react-native-heroicons/solid';
import { ChevronLeftIcon, XMarkIcon, PlusIcon } from 'react-native-heroicons/outline';
import { getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNowStrict } from 'date-fns';
import { enUS, es, fr, ar, ca, zhCN } from 'date-fns/locale';
import RBSheet from 'react-native-raw-bottom-sheet';

export default function FavoritesScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const normalizedLanguage = i18n.language?.split('-')[0];
  const insets = useSafeAreaInsets();
  const dateFnsLocaleMap = {
    en: enUS,
    es,
    ca,
    ar,
    fr,
    zh: zhCN,
  };
  const dateFnsLocale = dateFnsLocaleMap[normalizedLanguage] || enUS;
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [listName, setListName] = useState('');
  const sheetRef = useRef(null);
  const sheetHeight = 300;

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        const userData = await getDataLocally('user');
        console.log(userData);

        // Comprobar si userData indica que no hay usuario
        if (!userData) {
          return;
        }

        try {
          const user = JSON.parse(userData);
          if (!user?.token) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'GetStarted' }],
            });
          }
        } catch (error) {
          console.error('Failed to parse user data', error);
        }
      };

      checkUserData();
    }, [navigation])
  );

  const fetchLists = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/lists`);  // Usa userData.id directamente
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  const inputListNameChanged = (text) => {
    setListName(text);
  };

  const handleClearText = () => {
    setListName('');
  };

  const closeSheet = () => {
    sheetRef.current?.close();
    setListName('');
  };

  const handleCreateList = async () => {
    if (!listName.trim()) {
      return;
    }

    try {
      await api.post('/api/lists', {
        user_id: userId,
        list_name: listName.trim(),
      });
      await fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      closeSheet();
    }
  };

  const openSheet = () => {
    setListName('');
    sheetRef.current?.open();
  };


  useRefreshOnFocus(fetchLists);

  if (loading) {
    return <View className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"></View>;
  } // ESTILIZAR

  const getImageSource = (service) => (service?.image_url ? { uri: service.image_url } : null);

  const renderPreviewImages = (services = []) => {
    const previews = services.slice(0, 3);

    if (previews.length === 0) {
      return <View className="h-full w-full bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-2xl" />;
    }

    if (previews.length === 1) {
      return (
        <Image
          source={getImageSource(previews[0])}
          resizeMode="cover"
          className="h-full w-full bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-2xl"
        />
      );
    }

    if (previews.length === 2) {
      const [first, second] = previews;
      return (
        <View className="flex-row h-full w-full">
          <Image
            source={getImageSource(first)}
            resizeMode="cover"
            className="flex-1 bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-l-2xl"
          />
          <Image
            source={getImageSource(second)}
            resizeMode="cover"
            className="flex-1 bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-r-2xl"
          />
        </View>
      );
    }

    return (
      <View className="flex-row h-full w-full">
        <Image
          source={getImageSource(previews[0])}
          resizeMode="cover"
          className="flex-[2px] bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-l-2xl"
        />
        <View className="flex-[1px] justify-between">
          <Image
            source={getImageSource(previews[1])}
            resizeMode="cover"
            className="flex-1 bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-tr-2xl"
          />
          <Image
            source={getImageSource(previews[2])}
            resizeMode="cover"
            className="flex-1 bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-br-2xl"
          />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View className="mb-7 ">
      <TouchableOpacity
        className="mb-7"
        onPress={() => navigation.navigate('List', { listId: item.id, listTitle: item.title, itemCount: item.item_count })}
      >
        <View className="h-[105px] w-[150px]">
          {renderPreviewImages(item.services)}
        </View>
        <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2] ml-2 mt-2">{item.title}</Text>
        <View className="flex-row mt-2">
          <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5] ml-2 ">{item.item_count === 0 ? t('empty') : item.item_count === 1 ? `${item.item_count} ${t('service')}` : `${item.item_count} ${t('services')}`}</Text>
          <Text className="font-inter-medium text-[12px] text-[#B6B5B5] dark:text-[#706F6E] ml-3">{item.last_item_date ? formatDistanceToNowStrict(new Date(item.last_item_date), { addSuffix: false, locale: dateFnsLocale }) : null}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] '>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 px-6 pt-[55px]">

        <RBSheet
          height={sheetHeight}
          openDuration={300}
          closeDuration={300}
          draggable={true}
          ref={sheetRef}
          customStyles={{
            container: {
              borderTopRightRadius: 25,
              borderTopLeftRadius: 25,
              backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
            },
            draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' }
          }}
          onClose={() => setListName('')}
        >
          <View className="flex-1 justify-start items-center">
            <View className="mt-3 mb-12 flex-row justify-center items-center">
              <View className="flex-1 items-start">
                <TouchableOpacity onPress={closeSheet} className="ml-5">
                  <ChevronLeftIcon height={21} width={21} strokeWidth={2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center items-center">
                <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('new_list')}</Text>
              </View>

              <View className="flex-1 items-end">
                {listName.trim().length > 0 ? (
                  <TouchableOpacity onPress={handleCreateList}>
                    <Text className="mr-7 text-center font-inter-medium text-[14px] text-[#979797]">{t('done')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View className="w-full px-5">
              <View className="w-full h-[55px] px-4  bg-[#f2f2f2] dark:bg-[#272626] rounded-full flex-row justify-start items-center">
                <TextInput
                  placeholder={t('list_name_placeholder')}
                  autoFocus={true}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={inputListNameChanged}
                  value={listName}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                />

                {listName.length > 0 ? (
                  <TouchableOpacity onPress={handleClearText}>
                    <View className='h-[23px] w-[23px] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                      <XMarkIcon height={13} color={iconColor} strokeWidth={2.6} />
                    </View>
                  </TouchableOpacity>
                ) : null}

              </View>
            </View>
          </View>
        </RBSheet>

        <View className="flex-row justify-between mb-1">

          <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
            {t('favorites')}
          </Text>

          <TouchableOpacity
            className="items-center p-[10px] justify-center bg-[#fcfcfc] dark:bg-[#323131] rounded-full"
            onPress={openSheet}
          >
            <PlusIcon height={21} width={21} strokeWidth={1.9} color={iconColor} />
          </TouchableOpacity>

        </View>

        {(!lists || lists.length === 0) ? (
          <View className='flex-1 justify-center items-center'>
            <BookmarkIcon
              color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'}
              size={65}
            />
            <Text className="mt-5 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
              {t('no_favorite_lists')}
            </Text>
            <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[250px]">
              {t('create_or_save_to_start')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => String(item.id)}
            numColumns={2} // Define el número de columnas
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{
              justifyContent: 'space-between',
              paddingTop: 48,
            }}
            columnWrapperStyle={{
              justifyContent: 'space-between',
            }}
          />
        )}
      </View>
    </View>
  );
}