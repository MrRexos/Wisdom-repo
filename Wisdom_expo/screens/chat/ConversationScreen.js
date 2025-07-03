import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { Swipeable } from 'react-native-gesture-handler';

import * as Clipboard from 'expo-clipboard';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeftIcon,
  PaperClipIcon,
  ArrowUpIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
} from 'react-native-heroicons/outline';
import { MoreHorizontal, Image as ImageIcon, Folder, Check, Edit2, Trash2, File, CornerUpLeft } from "react-native-feather";
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
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  const statusReadColor = colorScheme === 'dark' ? '#d4d4d3' : '#515150';
  const statusUnreadColor = '#9ca3af';
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
  const [attachment, setAttachment] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const otherUserId = participants?.find((id) => id !== userId);
  const msgSheet = useRef(null);
  const convSheet = useRef(null);
  const isLastOfStreak = (msgs, idx) =>
    idx === msgs.length - 1 || msgs[idx].fromMe !== msgs[idx + 1].fromMe;
  // Objeto de refs para Swipeable
  const swipeRefs = useRef({});
  const imageMessages = useMemo(
    () => messages.filter(m => m.type === 'image'),
    [messages]
  );

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
        const raw = snap.docs.map((d) => {
          const msg = d.data();
          return {
            id: d.id,
            fromMe: msg.senderId === user.id,
            ...msg,
          };
        });
        const processed = [];
        let lastDate = null;
        raw.forEach((m) => {
          const dateStr = m.createdAt?.seconds
            ? new Date(m.createdAt.seconds * 1000).toDateString()
            : null;
          if (dateStr && dateStr !== lastDate) {
            processed.push({ id: `label-${m.id}`, type: 'label', text: dateStr });
            lastDate = dateStr;
          }
          processed.push(m);
        });
        setMessages(processed);
        raw.forEach(async m => {
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

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  const uploadFile = async (uri, path, mime, onProgress) => {
    // 1) URI → Blob fiable
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  
    // 2) Subida reanudable
    const fileRef = ref(storage, path);            // ya tienes `storage` importado arriba
    const task = uploadBytesResumable(fileRef, blob, { contentType: mime });
  
    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        snap => onProgress && onProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        reject,
        async () => {
          blob.close?.();                          // libera memoria en iOS
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };



  // ---------------------------------------------------------------------------
  // • ACTIONS
  // ---------------------------------------------------------------------------
  const handleSend = async () => {
    const replyData = replyTo
      ? (() => {
          const base = { id: replyTo.id, type: replyTo.type, senderId: replyTo.senderId };
          if (replyTo.text) base.text = replyTo.text;
          return base;
        })()
      : null;
    if (editingId) {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', editingId), {
        text: text.trim(),
      });
      setEditingId(null);
    } else if (attachment) {
      try {
        const filePath = `chat/${conversationId}/${Date.now()}_${attachment.name}`;
        const url = await uploadFile(
          attachment.uri,
          filePath,
          attachment.type     // "image/jpeg", "application/pdf", etc.
        );
    
        await addDoc(
          collection(db, 'conversations', conversationId, 'messages'),
          {
            senderId: userId,
            type: attachment.type.startsWith('image') ? 'image' : 'file',
            uri: url,
            name: attachment.name,
            createdAt: serverTimestamp(),
            replyTo: replyData,
          }
        );
    
        await updateDoc(
          doc(db, 'conversations', conversationId),
          {
            participants,
            name,
            lastMessage: attachment.type.startsWith('image') ? 'Image' : 'File',
            updatedAt: serverTimestamp(),
            lastMessageSenderId: userId,
            readBy: arrayUnion(userId),   // arrayUnion en vez de arrayRemove
          }
        );
    
        setAttachment(null);
      } catch (err) {
        console.error('Error subiendo archivo', err);
        // aquí podrías notificar al usuario
      }
    
    } else if (text.trim()) {
      const newMsg = {
        senderId: userId,
        type: 'text',
        text: text.trim(),
        createdAt: serverTimestamp(),
        replyTo: replyData,
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
          deletedFor: arrayRemove(userId),
        },
        { merge: true }
      );
    } else {
      return;
    }
    setText('');
    setReplyTo(null);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachment({ type: 'image', uri: asset.uri, name: asset.fileName || 'image.jpg' });
      attachSheet.current.close();
    }
    
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      
      const asset = result.assets?.[0] || result;
      setAttachment({ type: 'file', uri: asset.uri, name: asset.name });
      attachSheet.current.close();
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMsg) return;
    await deleteDoc(doc(db, 'conversations', conversationId, 'messages', selectedMsg.id));
    setSelectedMsg(null);
    msgSheet.current.close();
  };

  const handleEditMessage = () => {
    if (!selectedMsg) return;
    setText(selectedMsg.text);
    setEditingId(selectedMsg.id);
    msgSheet.current.close();
  };

  const handleCopyMessage = async () => {
    if (!selectedMsg) return;
    await Clipboard.setStringAsync(selectedMsg.text);

    msgSheet.current.close();
  };

  const handleReplyMessage = () => {
    if (!selectedMsg) return;
    setReplyTo(selectedMsg);
    msgSheet.current.close();
  };

  // ---------------------------------------------------------------------------
  // • RENDER HELPERS
  // ---------------------------------------------------------------------------
  const renderMessage = ({ item, index }) => {
    if (item.type === 'label') {
      return (
        <View className="justify-center items-center ">
          <View className="rounded-full px-4 py-1 mt-4 mb-4">
            <Text className="text-[12px] font-medium text-[#979797]">
              {item.text}
            </Text>
          </View>
        </View>

      );
    }

    const lastOfStreak = isLastOfStreak(messages, index);
    const LeftStub = () => <View style={{ width: 64 }} />
    const RightStub = () => null;


    const bubbleBase =
      'rounded-2xl px-3 py-2 max-w-[70%] my-[2] flex-row items-end shadow-xs';

    const common =
      item.fromMe
        ? 'self-end bg-[#FCFCFC] dark:bg-[#706f6e]'
        : 'self-start bg-[#D4D4D3] dark:bg-[#474646]';

    const corner =
      item.fromMe
        ? lastOfStreak ? ' rounded-br' : ''
        : lastOfStreak ? ' rounded-bl' : '';

    const fromMeStyles = common + corner;

    const textColor = 'text-[15px] font-medium text-[#515150] dark:text-[#d4d4d3]';

    if (item.type === 'image') {
      const imgIndex = imageMessages.findIndex(img => img.id === item.id);
      const content = (
        <View className={`${item.replyTo ? fromMeStyles && bubbleBase : `py-1 flex-row items-end shadow-xs ${item.fromMe? 'self-end': 'self-start'}`}`}>
          {item.replyTo && (
            <View className="border-l-2 border-[#3695FF] pl-2 mb-1">
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]">
                {item.replyTo.senderId === userId ? 'You' : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {item.replyTo.type === 'text' ? item.replyTo.text : item.replyTo.type === 'image' ? 'Image' : 'File'}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('ChatImageViewer', { images: imageMessages, index: imgIndex })}>
            <Image source={{ uri: item.uri }} className="w-40 h-[200px] rounded-xl" />
          </TouchableOpacity>
        </View>
      );
      return (
        <Swipeable
          ref={ref => { swipeRefs.current[item.id] = ref; }}
          renderLeftActions={LeftStub}        // ← se muestra al arrastrar a la derecha
          renderRightActions={RightStub}
          friction={1.5}
          activeOffsetX={[-10, 10]}           // margen para evitar falsos taps
          onSwipeableOpen={(dir) => {
            console.log(dir)         // callback nuevo
            if (dir === 'left') {
              swipeRefs.current[item.id]?.close();
              setReplyTo(item);
            }
          }}
        >
          <Pressable onLongPress={() => { setSelectedMsg(item); setTimeout(() => msgSheet.current.open(), 0); }}>
            {content}
            {lastOfStreak && (
              <View
                className={`${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'} flex-row items-center mt-0.5 mb-2`}
              >
                {item.fromMe && (
                  item.read ? (
                    <DoubleCheck height={14} width={14} color={statusReadColor} />
                  ) : (
                    <Check height={14} width={14} color={statusUnreadColor} strokeWidth={3} />
                  )
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
          </Pressable>
        </Swipeable>
      );
    }

    if (item.type === 'file') {
      const content = (
        <View className={`${bubbleBase} ${fromMeStyles}`}>
          {item.replyTo && (
            <View className="border-l-2 border-[#3695FF] pl-2 mb-1">
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]">
                {item.replyTo.senderId === userId ? 'You' : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {item.replyTo.type === 'text' ? item.replyTo.text : item.replyTo.type === 'image' ? 'Image' : 'File'}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => Linking.openURL(item.uri)} className="flex-row space-x-2">
            <View className="h-10 w-10 my-1 rounded-lg bg-[#323131] dark:bg-[#fcfcfc] items-center justify-center">
              <File height={22} width={22} color={colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'} strokeWidth={2} />
            </View>
            <View className="flex-1 justify-center">
              <Text numberOfLines={1} className={`${textColor} `}>{item.name} </Text>
              <Text numberOfLines={1} className='text-[14px] font-medium text-[#979797] '>{item.name?.includes(".") ? item.name.split(".").pop().toUpperCase() : "Desconocido"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
      return (
        <Swipeable
          ref={ref => { swipeRefs.current[item.id] = ref; }}
          renderLeftActions={LeftStub}        // ← se muestra al arrastrar a la derecha
          renderRightActions={RightStub}
          friction={1.5}
          activeOffsetX={[-10, 10]}           // margen para evitar falsos taps
          onSwipeableOpen={(dir) => {         // callback nuevo
            if (dir === 'left') {
              swipeRefs.current[item.id]?.close();           // 'left' = swipe hacia la derecha
              setReplyTo(item);
            }
          }}
        >
          <Pressable onLongPress={() => { setSelectedMsg(item); setTimeout(() => msgSheet.current.open(), 0); }}>
            {content}
            {lastOfStreak && (
              <View
                className={`${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'} flex-row items-center mt-0.5 mb-2`}
              >
                {item.fromMe && (
                  item.read ? (
                    <DoubleCheck height={14} width={14} color={statusReadColor} />
                  ) : (
                    <Check height={14} width={14} color={statusUnreadColor} strokeWidth={3} />
                  )
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
          </Pressable>
        </Swipeable>
      );
    }

    //Normal message
    const content = (
      <View className={`${bubbleBase} ${fromMeStyles}`}>
        <View>
          {item.replyTo && (
            <View className="border-l-2 border-[#3695FF] py-1 pl-2 pr-2 rounded-lg mb-2 bg-[#f2f2f2]/80 dark:bg-[#272626]/20">
              <Text className="font-inter-semibold text-xs text-[#515150] dark:text-[#d4d4d3]">
                {item.replyTo.senderId === userId ? 'You' : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {item.replyTo.type === 'text' ? item.replyTo.text : item.replyTo.type === 'image' ? 'Image' : 'File'}
              </Text>
            </View>
          )}
          <Text className={`text-sm leading-5  flex-shrink ${textColor} `}>{item.text}</Text>
        </View>
      </View>
    );
    return (
      <Swipeable
        ref={ref => { swipeRefs.current[item.id] = ref; }}
        renderLeftActions={LeftStub}        // ← se muestra al arrastrar a la derecha
        renderRightActions={RightStub}
        friction={1.5}
        activeOffsetX={[-10, 10]}           // margen para evitar falsos taps
        onSwipeableOpen={(dir) => {         // callback nuevo
          if (dir === 'left') {
            console.log("swipe left");              // 'left' = swipe hacia la derecha
            swipeRefs.current[item.id]?.close();
            setReplyTo(item);
          }
        }}
      >
        <Pressable onLongPress={() => { setSelectedMsg(item); setTimeout(() => msgSheet.current.open(), 0); }}>
          {content}

          {lastOfStreak && (
            <View
              className={`
                flex-row items-center mt-0.5 mb-2
                ${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'}
              `}
            >
              {item.fromMe && (
                item.read ? (
                  <DoubleCheck height={14} width={14} color={statusReadColor} />
                ) : (
                  <Check height={14} width={14} color={statusUnreadColor} strokeWidth={3} />
                )
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
        </Pressable>
      </Swipeable>
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

          <TouchableOpacity hitSlop={8} className="p-1 mr-4" onPress={() => convSheet.current.open()}>
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
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }

        />
      </View>

      {/* Composer ------------------------------------------------------------ */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{ backgroundColor: colorScheme === 'dark' ? '#272626' : '#f4f4f4', flex: 0, marginBottom: 30 }}
      >
        {replyTo && (
          <View className="flex-row items-center px-4 py-2 bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-t-xl ">
            <View className="flex-1 border-l-[3px] border-[#3695FF] pl-2">
              <Text className="font-inter-semibold text-xs text-[#515150] dark:text-[#d4d4d3]">
                {replyTo.senderId === userId ? 'You' : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {replyTo.type === 'text' ? replyTo.text : replyTo.type === 'image' ? 'Image' : 'File'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} className="p-1 ml-2">
              <XMarkIcon height={20} width={20} color={iconColor} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        )}
        <View
          className=" flex-row items-end px-3 py-2 bg-[#f4f4f4] dark:bg-[#272626]
                    space-x-2"
        >
          {/* Attachment – bolita aparte */}
          <TouchableOpacity
            onPress={() => attachSheet.current.open()}
            hitSlop={8}
            className="h-11 w-11 rounded-full              
                      items-center justify-center
                      bg-[#e5e5e5] dark:bg-[#3d3d3d]"
          >
            <PaperClipIcon height={24} width={24} color={"#979797"} strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Campo de texto + botón send dentro del mismo "pill" ---------------- */}
          <View
            className="flex-1 flex-row items-center
                      bg-[#e0e0e0] dark:bg-[#3d3d3d]
                      rounded-3xl pl-4 pr-2 "
          >
            {attachment && (
              <View className="relative mr-2">
              {attachment.type === 'image' ? (
                <Image source={{ uri: attachment.uri }} className="h-10 w-10 rounded-lg" />
              ) : (
                <View className="h-10 w-10 rounded-lg bg-[#323131] dark:bg-[#fcfcfc] items-center justify-center">
                  <File height={22} width={22} color={colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'} strokeWidth={2} />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setAttachment(null)}
                hitSlop={8}
                className="absolute -top-1 -right-1 bg-[#d4d4d3] dark:bg-[#474646] rounded-full p-[1]"
              >
                <XMarkIcon height={14} width={14} color={iconColor} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            )}
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
                disabled={!text.trim() && !attachment}
                className={`h-8 w-8 my-2 rounded-full items-center justify-center
                            ${text.trim() || attachment
                    ? 'bg-[#323131] dark:bg-[#fcfcfc]'
                    : 'bg-[#d4d4d3] dark:bg-[#474646]'}`}
              >
                <ArrowUpIcon
                  height={14}
                  width={14}
                  strokeWidth={3}
                  color={
                    text.trim() || attachment
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

      <RBSheet
        ref={msgSheet}
        height={selectedMsg?.fromMe ? 260 : 160}
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
        <View className="pt-7 pb-4 px-7 ">
          {selectedMsg?.fromMe && (
            <>
              <TouchableOpacity onPress={handleDeleteMessage} className="pb-6 flex-row justify-start items-center ">
                <Trash2 height={22} width={22} color={'#FF633E'} strokeWidth={2} />
                <Text className="ml-3 text-base font-inter-medium text-[#FF633E]">{t('delete_message')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditMessage} className="pt-1 pb-6 flex-row justify-start items-center ">
                <Edit2 height={23} width={23} color={iconColor} strokeWidth={2} />
                <Text className="ml-3 text-base font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('edit')}</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={handleReplyMessage} className="pt-1 pb-6 flex-row justify-start items-center ">
            <CornerUpLeft height={23} width={23} color={iconColor} strokeWidth={2} />
            <Text className="ml-3 text-base font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('reply')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopyMessage} className="py-1 flex-row justify-start items-center ">
            <DocumentDuplicateIcon height={23} width={23} color={iconColor} strokeWidth={2} />
            <Text className="ml-3 text-base font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('copy')}</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      <RBSheet
        ref={convSheet}
        height={120}
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
          <TouchableOpacity onPress={async () => { await updateDoc(doc(db, 'conversations', conversationId), { deletedFor: arrayUnion(userId) }); convSheet.current.close(); navigation.goBack(); }} className="py-2 flex-row justify-start items-center ">
            <Trash2 height={22} width={22} color={'#FF633E'} strokeWidth={2} />
            <Text className="ml-3 text-base font-inter-medium text-[#FF633E]">{t('delete_chat')}</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

    </View>
  );
}