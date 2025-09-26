import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIco, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { ChatBubbleLeftRightIcon } from 'react-native-heroicons/solid';
import { Calendar, Search } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { SwipeListView } from 'react-native-swipe-list-view';
import defaultProfilePic from '../../assets/defaultProfilePic.jpg';
import { db } from '../../utils/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';


export default function ChatScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [userId, setUserId] = useState();
  const [conversations, setConversations] = useState([]);
  const [usersInfo, setUsersInfo] = useState({});
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const unsubscribeRef = useRef(null);

  const suggestions = [
    { label: t('all'), value: 'all', id: 1 },
    { label: t('not_read'), value: 'not_read', id: 2 },
    { label: t('professionals'), value: 'professionals', id: 3 },
    { label: t('clients'), value: 'clients', id: 4 },
    { label: t('help'), value: 'help', id: 5 },
  ];

  const handleDeleteConversation = async (id) => {
    try {
      await updateDoc(doc(db, 'conversations', id), {
        deletedFor: arrayUnion(userId),
      });
    } catch (err) {
      console.error('delete conversation error:', err);
    }
  };

  const fetchUserInfo = async (uid) => {
    try {
      const res = await api.get(`/api/user/${uid}`);
      const info = res.data;
      setUsersInfo(prev => ({ ...prev, [uid]: info }));
    } catch (err) {
      console.error('fetchUserInfo error:', err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    // 3) Unificar bandera de ayuda (compatibilidad con documentos antiguos)
    const isHelp =
      c.type === 'help' ||
      c.isHelp === true ||
      c.help === true;

    // Id del otro participante
    const otherId = c.participants?.find(id => id !== userId);
    const info = otherId ? usersInfo[otherId] : null;

    // 1) Búsqueda más robusta (evita crash y busca por "display name")
    const q = (searchQuery || '').toLowerCase();

    const nameToSearch = (c.name || '').toLowerCase();
    const displayNameToSearch = info
      ? `${info.first_name || ''} ${info.surname || ''}`.trim().toLowerCase()
      : '';

    const base = searchActive
      ? (nameToSearch.includes(q) || displayNameToSearch.includes(q))
      : true;

    if (!base) return false;

    // no leído
    const unread =
      c.lastMessageSenderId !== userId &&
      !(c.readBy || []).includes(userId);

    // 2) Evitar parpadeo: prioriza datos denormalizados en la conversación
    //    participantesMeta: { [uid]: { is_professional: boolean } }
    //    otherIsProfessional: boolean (alias sencillo si lo prefieres)
    const otherIsProfessional =
      (c.participantsMeta && otherId != null
        ? c.participantsMeta[otherId]?.is_professional
        : undefined) ??
      c.otherIsProfessional ??
      (info != null ? !!info.is_professional : undefined);

    switch (selectedStatus) {
      case 'professionals':
        // Si ya tenemos el flag denormalizado, filtra sin esperar a usuarios;
        // si no está, cae al valor de usersInfo; si sigue undefined, NO lo excluye.
        return otherIsProfessional === true;
      case 'clients':
        return otherIsProfessional === false;
      case 'not_read':
        return unread;
      case 'help':
        return isHelp;
      default:
        return true;
    }
  });

  useEffect(() => {
    if (!userId) return;

    // Por cada conversación, si ya conocemos el otro usuario y su info,
    // persiste en la conversación `participantsMeta[otherId].is_professional`
    // (o `otherIsProfessional` si prefieres un alias plano).
    const updates = conversations.map(async (c) => {
      const otherId = c.participants?.find(id => id !== userId);
      if (!otherId) return;

      const info = usersInfo[otherId];
      if (!info || typeof info.is_professional === 'undefined') return;

      const hasParticipantsMeta = !!c.participantsMeta;
      const alreadyCached =
        hasParticipantsMeta &&
        typeof c.participantsMeta?.[otherId]?.is_professional !== 'undefined';

      const alreadyCachedAlias =
        typeof c.otherIsProfessional !== 'undefined';

      if (alreadyCached || alreadyCachedAlias) return;

      try {
        // Opción A: estructura detallada por participante
        await updateDoc(doc(db, 'conversations', c.id), {
          [`participantsMeta.${otherId}.is_professional`]: !!info.is_professional,
          // Opción B (alias plano, por si te resulta útil en el filtro):
          otherIsProfessional: !!info.is_professional,
        });
      } catch (err) {
        console.error('denormalize is_professional error:', err);
      }
    });

    Promise.allSettled(updates);
  }, [conversations, usersInfo, userId]);

  const loadConversations = async () => {
    const userData = await getDataLocally('user');
    if (!userData) return;
    const user = JSON.parse(userData);
    setUserId(user.id);
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );
    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = data.filter(c => !(c.deletedFor || []).includes(user.id));
      setConversations(filtered);
    });
    console.log(conversations);
  };

  useEffect(() => {
    loadConversations();
    return () => unsubscribeRef.current && unsubscribeRef.current();
  }, []);

  useRefreshOnFocus(loadConversations);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!userId) return;
    conversations.forEach(c => {
      const otherId = c.participants?.find(id => id !== userId);
      if (otherId && !usersInfo[otherId]) fetchUserInfo(otherId);
    });
  }, [conversations, userId]);

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

      <View className="px-6 pt-[55px] pb-4 flex-row items-center">
        <Text className="flex-1 mb-2 font-inter-bold text-[30px] text-[#444343] dark:text-[#f2f2f2]">
          {t('chat')}
        </Text>
        {searchActive && (
          <TextInput
            className="font-inter-medium flex-1 mr-2 px-3 py-[11px] rounded-full bg-[#fcfcfc] dark:bg-[#323131] text-[#323131] dark:text-[#fcfcfc]"
            placeholder={t('search')}
            placeholderTextColor="#979797"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}
        <TouchableOpacity
          onPress={() => {
            if (searchActive) {
              setSearchActive(false);
              setSearchQuery('');
            } else {
              setSearchActive(true);
            }
          }}
          className={`bg-[#fcfcfc] dark:bg-[#323131] rounded-full ${searchActive ? 'p-[10px]' : 'p-[12px]'}`}
        >
          {searchActive ? (
            <XMarkIcon height={22} width={22} color={iconColor} strokeWidth={2.1} />
          ) : (
            <Search height={18} width={18} color={iconColor} strokeWidth={2.1} />
          )}
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


      {filteredConversations.length < 1 ? (
        <View className="flex-1 justify-center items-center">
          <ChatBubbleLeftRightIcon height={65} width={70} fill={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
          <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
            {t('no_chats_found')}
          </Text>
          <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-5 w-[260px]">
            {t('write_to_professionals_and_talk_about_your_bookings')}
          </Text>
        </View>

      ) : (

        <SwipeListView
          data={filteredConversations}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const otherId = item.participants?.find(id => id !== userId);
            const info = otherId ? usersInfo[otherId] : null;
            const displayName = info ? `${info.first_name} ${info.surname}` : item.name;
            const profilePic = info?.profile_picture;
            const unread = item.lastMessageSenderId !== userId && !(item.readBy || []).includes(userId);
            const timeStr = item.updatedAt?.seconds
              ? new Date(item.updatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <View>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Conversation', {
                      conversationId: item.id,
                      participants: item.participants,
                      name: displayName,
                    })
                  }
                >
                  <View className="flex-row items-center px-6 py-4 bg-[#f2f2f2] dark:bg-[#272626]">

                    <Image source={profilePic ? { uri: profilePic } : defaultProfilePic} className="h-[55px] w-[55px] rounded-full bg-[#e0e0e0] dark:bg-[#3d3d3d] mr-3" />

                    <View className="flex-1 flex-row justify-between items-center">

                      <View className="flex-1 justify-center items-start">
                        <Text className="font-inter-semibold text-[16px] text-[#323131] dark:text-[#fcfcfc]">{displayName}</Text>
                        <Text className="mt-[2px] font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]" numberOfLines={1}>{item.lastMessage}</Text>
                      </View>

                      <View className="justify-center items-center">
                        <Text className={`text-[12px] font-inter-medium ${unread ? 'text-[#3695FF]' : 'text-[#b6b5b5] dark:text-[#706F6E]'}`}>{timeStr}</Text>
                        {unread && <View className="mt-2 h-3 w-3 rounded-full bg-[#3695FF]" />}
                      </View>
                    </View>

                  </View>

                </Pressable>
              </View>
            );
          }}
          renderHiddenItem={({ item }) => (
            <View className="flex-row justify-end items-center h-full bg-red-500">
              <TouchableOpacity
                onPress={() => handleDeleteConversation(item.id)}
                className="bg-red-500 justify-center items-center w-20 h-full"
              >
                <Text className="text-white font-inter-semibold">{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-80}
          disableRightSwipe
        />

      )}

    </SafeAreaView>
  );
}