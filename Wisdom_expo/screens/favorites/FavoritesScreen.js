import React, { useEffect, useState, useCallback } from 'react'
import { View, StatusBar, Platform, Text, TouchableOpacity, ScrollView, FlatList, Alert, Image, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Edit2, X, Check } from "react-native-feather";
import { BookmarkIcon } from 'react-native-heroicons/solid';
import { getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNowStrict } from 'date-fns';
import { enUS, es, fr, ar, ca, zhCN } from 'date-fns/locale';

export default function FavoritesScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const normalizedLanguage = i18n.language?.split('-')[0];
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
  const [editing, setEditing] = useState(false);  // Nuevo estado para controlar el modo de edición
  const [refreshing, setRefreshing] = useState(false);

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

  const deleteList = async (listId) => {
    Alert.alert(
      t('are_you_sure_you_want_to_delete_this_list'),
      t('list_will_disappear_for_everyone'),
      [
        {
          text: t('cancel'),
          onPress: null,
          style: 'cancel',
        },
        {
          text: t('delete'),
          onPress: async () => {
            try {
              const response = await api.delete(`/api/lists/${listId}`);
              console.log('Éxito', response.data.message);
              setLists(lists.filter(list => list.id !== listId));  // Actualiza la lista después de eliminar
            } catch (error) {
              console.error('Error al eliminar la lista:', error);
              console.log('Error', 'No se pudo eliminar la lista');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

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


  useRefreshOnFocus(fetchLists);

  if (loading) {
    return <View className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"></View>;
  } // ESTILIZAR

  const renderItem = ({ item }) => (
    <View className="mb-7">
      <TouchableOpacity
        disabled={editing}  // Desactiva el clic en el ítem si no estamos en modo de edición
        className="mb-7"
        onPress={() => navigation.navigate('List', { listId: item.id, listTitle: item.title, itemCount: item.item_count })}
      >
        <View className="flex-row h-[105px] w-[150px]">
          <Image source={item.services[0] ? item.services[0].image_url ? { uri: item.services[0].image_url } : null : null} className="flex-[2px] bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-l-2xl" />
          <View className="flex-[1px] justify-between">
            <Image source={item.services[1] ? item.services[1].image_url ? { uri: item.services[1].image_url } : null : null} className="flex-1 bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-tr-2xl" />
            <Image source={item.services[2] ? item.services[2].image_url ? { uri: item.services[2].image_url } : null : null} className="flex-1 bg-[#d4d4d3] dark:bg-[#474646] m-[1px] rounded-br-2xl" />
          </View>
        </View>
        <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2] ml-2 mt-2">{item.title}</Text>
        <View className="flex-row mt-2">
          <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#B6B5B5] ml-2 ">{item.item_count === 0 ? t('empty') : item.item_count === 1 ? `${item.item_count} ${t('service')}` : `${item.item_count} ${t('services')}`}</Text>
          <Text className="font-inter-medium text-[12px] text-[#B6B5B5] dark:text-[#706F6E] ml-3">{item.last_item_date ? formatDistanceToNowStrict(new Date(item.last_item_date), { addSuffix: false, locale: dateFnsLocale }) : null}</Text>
        </View>
      </TouchableOpacity>
      {editing && (
        <TouchableOpacity onPress={() => deleteList(item.id)} className="absolute top-2 left-2">
          <View className="rounded-full bg-[#E0E0E0] dark:bg-[#3d3d3d] p-[2px]">
            <X height={20} width={20} strokeWidth={1.7} color={iconColor} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] '>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 px-6 pt-[55px]">

        <View className="flex-row justify-between mb-1">

          <Text className="font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
            {t('favorites')}
          </Text>

          {!(!lists || lists.length === 0) && (

          <TouchableOpacity
            className="px-3 items-center justify-center"
            onPress={() => setEditing(!editing)}
          >
            {editing ? (
              <Check height={22} strokeWidth={1.7} color={iconColor} />
            ) : (
              <Edit2 height={22} strokeWidth={1.7} color={iconColor} />
            )}
          </TouchableOpacity>

          )}

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
            keyExtractor={(item) => item.id}
            numColumns={2} // Define el número de columnas
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
    </SafeAreaView>
  );
}