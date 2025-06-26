import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView as SafeTop, SafeAreaView as SafeBottom } from 'react-native-safe-area-context';
import {
  SafeAreaView,
  View,
  StatusBar,
  Platform,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeftIcon,
  PaperClipIcon,
  ArrowUpIcon,
} from 'react-native-heroicons/outline';
import { MoreHorizontal, Image as ImageIcon, Folder, Check } from "react-native-feather";
import { useTranslation } from 'react-i18next';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import defaultProfilePic from '../../assets/defaultProfilePic.jpg';
import DoubleCheck from '../../assets/DoubleCheck'


export default function ConversationScreen() {
  // ---------------------------------------------------------------------------
  // • HOOKS & HELPERS
  // ---------------------------------------------------------------------------
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const attachSheet = useRef(null);

  // ---------------------------------------------------------------------------
  // • STATE
  // ---------------------------------------------------------------------------
  const route = useRoute();
  const { conversationId, participants, name } = route.params;
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const otherUserId = participants?.find((id) => id !== userId);
  const isLastOfStreak = (msgs, idx) =>
    idx === msgs.length - 1 || msgs[idx].fromMe !== msgs[idx + 1].fromMe;

  useEffect(() => {
    let unsub;
    const init = async () => {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const user = JSON.parse(userData);
      setUserId(user.id);
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt')
      );
      unsub = onSnapshot(q, async (snap) => {
        const data = snap.docs.map((d) => {
          const msg = d.data();
          return {
            id: d.id,
            fromMe: msg.senderId === user.id,
            ...msg,
          };
        });
        setMessages(data);
        flatListRef.current?.scrollToEnd({ animated: true });
        data.forEach(async m => {
          if (!m.fromMe && !m.read) {
            await updateDoc(doc(db, 'conversations', conversationId, 'messages', m.id), { read: true });
          }
        });
        await updateDoc(doc(db, 'conversations', conversationId), { readBy: arrayUnion(user.id) });
      });
    };
    init();
    return () => unsub && unsub();
  }, [conversationId]);

  useEffect(() => {
    const loadInfo = async () => {
      if (!otherUserId) return;
      try {
        const res = await api.get(`/api/user/${otherUserId}`);
        setOtherUserInfo(res.data);
      } catch (err) {
        console.error('load other user error:', err);
      }
    };
    loadInfo();
  }, [otherUserId]);



  // ---------------------------------------------------------------------------
  // • ACTIONS
  // ---------------------------------------------------------------------------
  const handleSend = async () => {
    if (!text.trim()) return;
    const newMsg = {
      senderId: userId,
      type: 'text',
      text: text.trim(),
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), newMsg);
    await setDoc(
      doc(db, 'conversations', conversationId),
      {
        participants,
        name,
        lastMessage: text.trim(),
        updatedAt: serverTimestamp(),
        lastMessageSenderId: userId,
        readBy: [userId],
      },
      { merge: true }
    );
    setText('');
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileRef = ref(
        storage,
        `chat/${conversationId}/${Date.now()}_${asset.fileName || 'image.jpg'}`
      );
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: userId,
        type: 'image',
        uri: downloadURL,
        name: asset.fileName || 'image',
        createdAt: serverTimestamp(),
      });
      await setDoc(
        doc(db, 'conversations', conversationId),
        {
          participants,
          name,
          lastMessage: '📷',
          updatedAt: serverTimestamp(),
          lastMessageSenderId: userId,
          readBy: [userId],
        },
        { merge: true }
      );
    }
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const fileRef = ref(
        storage,
        `chat/${conversationId}/${Date.now()}_${result.name}`
      );
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: userId,
        type: 'file',
        uri: downloadURL,
        name: result.name,
        createdAt: serverTimestamp(),
      });
      await setDoc(
        doc(db, 'conversations', conversationId),
        {
          participants,
          name,
          lastMessage: '📎',
          updatedAt: serverTimestamp(),
          lastMessageSenderId: userId,
          readBy: [userId],
        },
        { merge: true }
      );
    }
  };

  // ---------------------------------------------------------------------------
  // • RENDER HELPERS
  // ---------------------------------------------------------------------------
  const renderMessage = ({ item, index }) => {           
    if (item.type === 'label') {
      return (
        <View className="self-start bg-[#D4D4D3] dark:bg-[#3d3d3d] rounded-full px-3 py-2 my-1">
          <Text className="text-[15px] font-medium text-[#515150] dark:text-[#d4d4d3]">
            {item.text}
          </Text>
        </View>

      );
    }

    const lastOfStreak = isLastOfStreak(messages, index);

    const bubbleBase =
      'rounded-2xl px-4 py-2 max-w-[70%] my-[2] flex-row items-end shadow-xs';

    const common =
      item.fromMe
        ? 'self-end bg-[#FCFCFC] dark:bg-[#706f6e]'
        : 'self-start bg-[#D4D4D3] dark:bg-[#3d3d3d]';

    const corner =
      item.fromMe
        ? lastOfStreak ? ' rounded-br' : ''
        : lastOfStreak ? ' rounded-bl' : '';

    const fromMeStyles = common + corner;

    const textColor = 'text-[15px] font-medium text-[#515150] dark:text-[#d4d4d3]';

    if (item.type === 'image') {
      return (
        <View>
          <View className={`${bubbleBase} ${fromMeStyles}`}>
            <Image source={{ uri: item.uri }} className="w-40 h-40 rounded-lg" />
          </View>
          {lastOfStreak && (
            <View
              className={`${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'} flex-row items-center mt-0.5 mb-2`}
            >
              {item.fromMe && item.read && (
                <Check height={14} width={14} color="#9ca3af" strokeWidth={3}/>
              )}
              <Text className="text-[13px] text-[#b6b5b5] dark:text-[#706f6e] ml-1">
                {item.createdAt &&
                  new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (item.type === 'file') {
      return (
        <View>
          <TouchableOpacity onPress={() => Linking.openURL(item.uri)} className={`${bubbleBase} ${fromMeStyles}`}> 
            <Text className={textColor}>{item.name}</Text>
          </TouchableOpacity>
          {lastOfStreak && (
            <View
              className={`${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'} flex-row items-center mt-0.5 mb-2`}
            >
              {item.fromMe && item.read && (
                <Check height={14} width={14} color="#9ca3af" strokeWidth={3}/>
              )}
              <Text className="text-[13px] text-[#b6b5b5] dark:text-[#706f6e] ml-1">
                {item.createdAt &&
                  new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View>
        <View className={`${bubbleBase} ${fromMeStyles}`}>
          <Text className={`text-sm leading-5 flex-shrink ${textColor}`}>
            {item.text}
          </Text>
        </View>
  
        {lastOfStreak && (
          <View
            className={`
              flex-row items-center mt-0.5 mb-2
              ${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'}
            `}
          >
            {item.fromMe && item.read && (
              <Check height={14} width={14} color="#9ca3af" strokeWidth={3}/>
            )}
            <Text className="text-[13px] text-[#b6b5b5] dark:text-[#706f6e] ml-1">
              {item.createdAt &&
                new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // • MAIN UI
  // ---------------------------------------------------------------------------
  return (
    <View className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
    <SafeTop edges={['top']} className="bg-[#fcfcfc] dark:bg-[#202020] rounded-b-[30px]">
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}

      <View
        className="flex-row items-center px-2 pt-4 pb-8 dark:border-[#3d3d3d]"
        style={{
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 28,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ChevronLeftIcon height={24} width={24} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>

        <Image
          source={otherUserInfo?.profile_picture ? { uri: otherUserInfo.profile_picture } : defaultProfilePic}
          className="h-10 w-10 rounded-full bg-gray-300 dark:bg-[#3d3d3d] mx-2"
        />
        <Text className="flex-1 text-[16px] font-inter-semibold text-[#444343] dark:text-[#f2f2f2]">
          {otherUserInfo ? `${otherUserInfo.first_name} ${otherUserInfo.surname}` : name}
        </Text>

        <TouchableOpacity hitSlop={8} className="p-1 mr-4">
          <MoreHorizontal height={24} width={24} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </SafeTop>

      <View className="flex-1 px-1 bg-[#f4f4f4] dark:bg-[#272626]">
        {/* Messages list ------------------------------------------------------- */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Composer ------------------------------------------------------------ */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{ backgroundColor: colorScheme === 'dark' ? '#272626' : '#f4f4f4',  flex: 0, marginBottom: 30 }}
      >
        <View
          className=" flex-row items-end px-3 py-2 bg-[#f4f4f4] dark:bg-[#272626]
                    space-x-2"                
        >
          {/* Attachment – bolita aparte */}
          <TouchableOpacity
            onPress={() => attachSheet.current.open()}
            hitSlop={8}
            className="h-11 w-11 rounded-full              /* idéntico alto-ancho */
                      items-center justify-center
                      bg-[#e5e5e5] dark:bg-[#3d3d3d]"
          >
            <PaperClipIcon height={24} width={24} color={"#979797"} strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Campo de texto + botón send dentro del mismo “pill” ---------------- */}
          <View
            className="flex-1 flex-row items-center
                      bg-[#e0e0e0] dark:bg-[#3d3d3d]
                      rounded-3xl pl-4 pr-2 "
          >
            <View className="flex-1 justify-center">
            <TextInput
              className="my-2 mr-2 font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc] "
              placeholder={t('your_message')}
              placeholderTextColor="#979797"
              multiline={true}
              value={text}
              onChangeText={setText}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              style={{ paddingVertical: 0 }}
              textAlignVertical="center"
            />
            </View>
            <View className="self-stretch items-center justify-end">
              <TouchableOpacity
                onPress={handleSend}
                disabled={!text.trim()}
                className={`h-8 w-8 my-2 rounded-full items-center justify-center
                            ${text.trim()
                              ? 'bg-[#323131] dark:bg-[#fcfcfc]'
                              : 'bg-[#d4d4d3] dark:bg-[#474646]'}`}
              >
                <ArrowUpIcon
                  height={14}
                  width={14}
                  strokeWidth={3}
                  color={
                    text.trim()
                      ? colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'
                      : '#ffffff'
                  }
                />
              </TouchableOpacity>
            </View>
            </View>

          
        </View>

      </KeyboardAvoidingView>

      <RBSheet
        ref={attachSheet}
        height={160}
        openDuration={200}
        closeDuration={200}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >
        <View className="py-4 px-7 space-y-4">
          <TouchableOpacity onPress={handleImagePick} className="py-2 flex-row justify-start items-center ">
            <ImageIcon height={24} width={24} color={iconColor} strokeWidth={2} />
            <Text className=" ml-3 text-base font-inter-medium text-[#444343] dark:text-[#f2f2f2]">Choose image</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFilePick} className="py-1 flex-row justify-start items-center">
            <Folder height={24} width={24} color={iconColor} strokeWidth={2} />
            <Text className="ml-3 text-base font-inter-medium text-[#444343] dark:text-[#f2f2f2]">Choose file</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      </View>
  );
}