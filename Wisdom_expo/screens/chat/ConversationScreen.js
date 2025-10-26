import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
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
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
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
import { MoreHorizontal, Image as ImageIcon, Folder, Check, Edit2, Trash2, File, CornerUpLeft, Camera } from "react-native-feather";
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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import { containsContactInfo } from '../../utils/moderation';
import defaultProfilePic from '../../assets/defaultProfilePic.jpg';
import DoubleCheck from '../../assets/DoubleCheck';

const DATE_LOCALE_MAP = {
  en: 'en-US',
  es: 'es-ES',
  ca: 'ca-ES',
  ar: 'ar',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

export default function ConversationScreen() {
  // --------------------------------------------------------------------------
  // • HOOKS & HELPERS
  // --------------------------------------------------------------------------
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const statusUnreadColor = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const statusReadColorStrong = colorScheme === 'dark' ? '#fcfcfc' : '#323131';
  const flatListRef = useRef(null);
  const attachSheet = useRef(null);

  // ---------------------------------------------------------------------------
  // • STATE
  // ---------------------------------------------------------------------------
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, participants, name } = route.params;
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const otherUserId = participants?.find((id) => id !== userId);
  const msgSheet = useRef(null);
  const convSheet = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const inputRef = useRef(null);

  const isLastOfStreak = (msgs, idx) =>
    idx === msgs.length - 1 || msgs[idx].fromMe !== msgs[idx + 1].fromMe;
  const swipeRefs = useRef({});
  const imageMessages = useMemo(() => messages.filter((m) => m.type === 'image'), [messages]);
  const initialLoadRef = useRef(true);
  const [shouldMaintainPosition, setShouldMaintainPosition] = useState(false);
  const locale = useMemo(() => DATE_LOCALE_MAP[i18n.language] || DATE_LOCALE_MAP.en, [i18n.language]);

  useEffect(() => {
    initialLoadRef.current = true;
    setShouldMaintainPosition(false);
  }, [conversationId]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
  
    const subShow = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const subHide = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
  
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const scrollToBottom = useCallback((options = {}) => {
    if (!flatListRef.current) return;
    const { animated = false } = options;
    flatListRef.current.scrollToOffset({ offset: 0, animated });
  }, []);

  // Autoscroll al enfocar pantalla
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      scrollToBottom({ animated: false });
    });
    return unsub;
  }, [navigation, scrollToBottom]);

  useEffect(() => {
    let unsub;
    const init = async () => {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const user = JSON.parse(userData);
      setUserId(user.id);
      setCurrentUser(user);
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'desc')
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
        for (let i = 0; i < raw.length; i++) {
          const m = raw[i];
          const prev = raw[i - 1]; // más nuevo (visual abajo) 
          const next = raw[i + 1]; // más antiguo (visual arriba) 

          // Extremo inferior visual de la racha (donde debe ir hora y check) 
          const tail = !prev || prev.senderId !== m.senderId;
          processed.push({ ...m, _isTail: tail });

          // Insertar la etiqueta de FECHA al terminar el bloque de ese día. 
          const currDate = m.createdAt?.seconds
            ? new Date(m.createdAt.seconds * 1000).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })
            : null;
          const nextDate = next?.createdAt?.seconds
            ? new Date(next.createdAt.seconds * 1000).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })
            : null;
          if (currDate && currDate !== nextDate) {
            // Al ir después en el array (desc) y la lista estar invertida, 
            // esta etiqueta se verá ARRIBA del bloque del día. 
            processed.push({ id: `label-${m.id}`, type: 'label', text: currDate });
          }
        }
        setMessages(processed);

        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          setShouldMaintainPosition(true);
          requestAnimationFrame(() => scrollToBottom({ animated: false }));
        }

        // Marca como leído lo que no es tuyo
        raw.forEach(async (m) => {
          if (!m.fromMe && !m.read) {
            await updateDoc(doc(db, 'conversations', conversationId, 'messages', m.id), { read: true });
          }
        });
        await updateDoc(doc(db, 'conversations', conversationId), { readBy: arrayUnion(user.id) });

      });
    };
    init();

    return () => unsub && unsub();
  }, [conversationId, scrollToBottom, locale]);

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

  const uploadFile = async (uri, path, mime, onProgress) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const fileRef = ref(storage, path);
    const task = uploadBytesResumable(fileRef, blob, { contentType: mime });

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => onProgress && onProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        reject,
        async () => {
          blob.close?.();
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
    if (isSending) return;

    const trimmed = text.trim();
    const hasAttachment = !!attachment;
    const hasText = !!trimmed;

    if (!hasAttachment && !hasText) return;

    if (hasText && containsContactInfo(trimmed)) {
      Alert.alert(t('contact_not_allowed'));
      if (currentUser?.is_professional) {
        try {
          await api.post(`/api/user/${currentUser.id}/strike`);
        } catch (err) {
          console.error('strike error', err);
        }
      }
      return;
    }

    const replyData = replyTo
      ? (() => {
          const base = { id: replyTo.id, type: replyTo.type, senderId: replyTo.senderId };
          if (replyTo.text) base.text = replyTo.text;
          return base;
        })()
      : null;

    const currentAttachment = attachment;

    try {
      setIsSending(true);

      if (hasAttachment && currentAttachment) {
        setIsUploading(true); // 🔹 spinner solo para adjuntos

        const filePath = `chat/${conversationId}/${Date.now()}_${currentAttachment.name}`;
        const url = await uploadFile(currentAttachment.uri, filePath, currentAttachment.type);

        const isImage = currentAttachment.type.startsWith('image');

        await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
          senderId: userId,
          type: isImage ? 'image' : 'file',
          uri: url,
          name: currentAttachment.name,
          createdAt: serverTimestamp(),
          replyTo: replyData,
          read: false,
        });

        await updateDoc(doc(db, 'conversations', conversationId), {
          participants,
          name,
          lastMessage: isImage ? t('image') : t('file'),
          updatedAt: serverTimestamp(),
          lastMessageSenderId: userId,
          readBy: arrayUnion(userId),
        });

      }

      if (hasText) {
        const newMsg = {
          senderId: userId,
          type: 'text',
          text: trimmed,
          createdAt: serverTimestamp(),
          replyTo: replyData,
          read: false,
        };
        await addDoc(collection(db, 'conversations', conversationId, 'messages'), newMsg);
        await setDoc(
          doc(db, 'conversations', conversationId),
          {
            participants,
            name,
            lastMessage: trimmed,
            updatedAt: serverTimestamp(),
            lastMessageSenderId: userId,
            readBy: [userId],
            deletedFor: arrayRemove(userId),
          },
          { merge: true }
        );

        inputRef.current?.focus();
      }

      setAttachment(null);
      setText('');
      setReplyTo(null);
      requestAnimationFrame(() => scrollToBottom({ animated: true }));
    } catch (err) {
      console.error('Error enviando mensaje', err);
    } finally {
      setIsUploading(false); // 🔹 apaga spinner de adjuntos
      setIsSending(false); // 🔒 libera el bloqueo de envío
    }
  };

  const handleImagePick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(
        t('allow_wisdom_to_access_gallery'),
        t('need_gallery_access_chat'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('settings'), onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
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

  const handleCameraCapture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(
        t('allow_wisdom_to_access_camera'),
        t('need_camera_access_chat'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('settings'), onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachment({ type: 'image', uri: asset.uri, name: asset.fileName || 'image.jpg' });
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
  const bubbleBase = 'rounded-2xl px-3 py-2 max-w-[70%] my-[2] flex-row items-end ';

  const renderMessage = ({ item, index }) => {
    if (item.type === 'label') {
      return (
        <View className="justify-center items-center ">
          <View className="rounded-full px-4 py-1 mt-4 mb-4">
            <Text className="text-[12px] font-medium text-[#979797]">{item.text}</Text>
          </View>
        </View>
      );
    }

    const tail = item._isTail;
    const LeftStub = () => <View style={{ width: 64 }} />;
    const RightStub = () => <View style={{ width: 64 }} />; // ▶️ ahora también muestra zona a la derecha

    const common = item.fromMe
      ? 'self-end bg-[#FCFCFC] dark:bg-[#706f6e]'
      : 'self-start bg-[#D4D4D3] dark:bg-[#474646]';
    const corner = item.fromMe ? (tail ? ' rounded-br' : '') : tail ? ' rounded-bl' : '';
    const fromMeStyles = common + corner;
    const textColor = 'text-[15px] font-medium text-[#515150] dark:text-[#d4d4d3]';

    const renderStatusTime = () => (
      <View
        className={`flex-row items-center mt-0.5 mb-2 ${item.fromMe ? 'justify-end pr-1' : 'justify-start pl-1'
          }`}
      >
        {item.fromMe && (
          <DoubleCheck
            height={16}
            width={16}
            color={item.read ? statusReadColorStrong : statusUnreadColor}
          />
        )}
        <Text className="text-[13px] text-[#b6b5b5] dark:text-[#706f6e] ml-1">
          {item.createdAt &&
            new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
        </Text>
      </View>
    );

    const onSwipeOpen = (dir) => {
      // ↔️ Ambos sentidos hacen lo mismo: responder
      if (dir === 'left' || dir === 'right') {
        swipeRefs.current[item.id]?.close();
        setReplyTo(item);
      }
    };

    if (item.type === 'image') {
      const imgIndex = imageMessages.findIndex((img) => img.id === item.id);
    
      const handleLongPress = () => {
        setSelectedMsg(item);
        setTimeout(() => msgSheet.current.open(), 0);
      };
    
      const content = (
        // ⬇️ El contenedor SOLO maneja long-press (no onPress)
        <Pressable
          onLongPress={handleLongPress}
          // no pongas onPress aquí
        >
          <View
            className={`${item.replyTo
              ? `${bubbleBase} ${fromMeStyles}`
              : `py-1 flex-row items-end ${item.fromMe ? 'self-end' : 'self-start'}`
              }`}
          >
            {item.replyTo && (
              <View className="border-l-2 border-[#3695FF] pl-2 mb-1">
                <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]">
                  {item.replyTo.senderId === userId ? t('you') : otherUserInfo?.first_name}
                </Text>
                <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                  {item.replyTo.type === 'text'
                    ? item.replyTo.text
                    : item.replyTo.type === 'image'
                      ? t('image')
                      : t('file')}
                </Text>
              </View>
            )}
    
            {/* ⬇️ ESTE es el único Pressable con onPress para abrir el visor */}
            <Pressable
              onPress={() =>
                navigation.navigate('ChatImageViewer', { images: imageMessages, index: imgIndex })
              }
              onLongPress={handleLongPress}     // también permite long-press sobre la imagen
              hitSlop={6}                       // toque un pelín fuera del borde
              style={{ alignSelf: 'flex-start' }} // asegura que no se estire de ancho
            >
              <Image source={{ uri: item.uri }} className="w-40 h-[170px] rounded-xl" />
            </Pressable>
          </View>
        </Pressable>
      );
    
      return (
        <Swipeable
          ref={(ref) => { swipeRefs.current[item.id] = ref; }}
          renderLeftActions={() => <View style={{ width: 64 }} />}
          renderRightActions={() => <View style={{ width: 64 }} />}
          friction={1.5}
          activeOffsetX={[-10, 10]}
          onSwipeableOpen={(dir) => {
            if (dir === 'left' || dir === 'right') {
              swipeRefs.current[item.id]?.close();
              setReplyTo(item);
            }
          }}
        >
          {/* ⬇️ El tiempo/estado queda FUERA de cualquier onPress */}
          <View>
            {content}
            {item._isTail && renderStatusTime()}
          </View>
        </Swipeable>
      );
    }

    if (item.type === 'file') {
      const content = (
        <View className={`${bubbleBase} ${fromMeStyles}`}>
          {item.replyTo && (
            <View className="border-l-2 border-[#3695FF] pl-2 mb-1">
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]">
                {item.replyTo.senderId === userId ? t('you') : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {item.replyTo.type === 'text'
                  ? item.replyTo.text
                  : item.replyTo.type === 'image'
                    ? t('image')
                    : t('file')}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => Linking.openURL(item.uri)} className="flex-row gap-x-2">
            <View className="h-10 w-10 my-1 rounded-lg bg-[#323131] dark:bg-[#fcfcfc] items-center justify-center">
              <File height={24} width={24} color={colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'} strokeWidth={2} />
            </View>
            <View className="flex-1 justify-center">
              <Text numberOfLines={1} className={`${textColor}`}>
                {item.name}
              </Text>
              <Text numberOfLines={1} className="text-[14px] font-medium text-[#979797]">
                {item.name?.includes('.') ? item.name.split('.').pop().toUpperCase() : t('unknown')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
      return (
        <Swipeable
          ref={(ref) => {
            swipeRefs.current[item.id] = ref;
          }}
          renderLeftActions={LeftStub}
          renderRightActions={RightStub}
          friction={1.5}
          activeOffsetX={[-10, 10]}
          onSwipeableOpen={onSwipeOpen}
        >
          <Pressable
            onLongPress={() => {
              setSelectedMsg(item);
              setTimeout(() => msgSheet.current.open(), 0);
            }}
          >
            {content}
            {tail && renderStatusTime()}
          </Pressable>
        </Swipeable>
      );
    }

    const content = (
      <View className={`${bubbleBase} ${fromMeStyles}`}>
        <View>
          {item.replyTo && (
            <View className="border-l-2 border-[#3695FF] py-1 pl-2 pr-2 rounded-lg mb-2 bg-[#f2f2f2]/80 dark:bg-[#272626]/20">
              <Text className="font-inter-semibold text-xs text-[#515150] dark:text-[#d4d4d3]">
                {item.replyTo.senderId === userId ? t('you') : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {item.replyTo.type === 'text'
                  ? item.replyTo.text
                  : item.replyTo.type === 'image'
                    ? t('image')
                    : item.replyTo.type === 'file'
                      ? t('file')
                      : ''}
              </Text>
            </View>
          )}
          <Text className={`text-[15px] leading-[20px] flex-shrink ${textColor}`}>{item.text}</Text>
        </View>
      </View>
    );

    return (
      <Swipeable
        ref={(ref) => {
          swipeRefs.current[item.id] = ref;
        }}
        renderLeftActions={LeftStub}
        renderRightActions={RightStub}
        friction={1.5}
        activeOffsetX={[-10, 10]}
        onSwipeableOpen={onSwipeOpen}
      >
        <Pressable
          onLongPress={() => {
            setSelectedMsg(item);
            setTimeout(() => msgSheet.current.open(), 0);
          }}
        >
          {content}
          {tail && renderStatusTime()}
        </Pressable>
      </Swipeable>
    );
  };

  // ---------------------------------------------------------------------------
  // • MAIN UI
  // ---------------------------------------------------------------------------
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> 
    <View className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
      <SafeAreaView className="bg-[#fcfcfc] dark:bg-[#202020] rounded-b-[30px]">
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
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages list ------------------------------------------------------- */}
        <View className="flex-1 px-1 bg-[#f4f4f4] dark:bg-[#272626]">
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16 }}
            inverted
            maintainVisibleContentPosition={
              shouldMaintainPosition ? { minIndexForVisible: 0, autoscrollToTopThreshold: 20 } : undefined
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="never"   // mantiene interacciones útiles
            keyboardDismissMode="none"         // al arrastrar, cierra teclado
            ListFooterComponent={<View style={{ height: 4 }} />}
            initialNumToRender={20}
            windowSize={10}
          />
        </View>

        {/* Composer ------------------------------------------------------------ */}
        {replyTo && (
          <View className="flex-row items-center px-4 py-2 bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-t-xl ">
            <View className="flex-1 border-l-[3px] border-[#3695FF] pl-2">
              <Text className="font-inter-semibold text-xs text-[#515150] dark:text-[#d4d4d3]">
                {replyTo.senderId === userId ? t('you') : otherUserInfo?.first_name}
              </Text>
              <Text className="text-xs text-[#515150] dark:text-[#d4d4d3]" numberOfLines={1}>
                {replyTo.type === 'text' ? replyTo.text : replyTo.type === 'image' ? t('image') : t('file')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} className="p-1 ml-2">
              <XMarkIcon height={22} width={22} color={iconColor} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        )}

        <View className={`flex-row items-end px-3 py-2 bg-[#f4f4f4] dark:bg-[#272626] gap-x-2 ${keyboardOpen ? 'mb-2' : 'mb-6'}`}>
          {/* Attachment – bolita aparte */}
          <TouchableOpacity
            onPress={() => attachSheet.current.open()}
            hitSlop={8}
            disabled={isSending}
            className={`h-12 w-12 rounded-full items-center justify-center ${isSending ? 'opacity-60' : ''
              } bg-[#e5e5e5] dark:bg-[#3d3d3d]`}
          >
            <PaperClipIcon height={26} width={26} color={'#979797'} strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Campo de texto + botón send */}
          <View className="flex-1 flex-row items-center bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-[25px] pl-4 pr-2 ">
            {attachment && (
              <View className="relative mr-2">
                {attachment.type === 'image' ? (
                  <Image source={{ uri: attachment.uri }} className="h-10 w-10 rounded-lg" />
                ) : (
                  <View className="h-10 w-10 rounded-lg bg-[#323131] dark:bg-[#fcfcfc] items-center justify-center">
                    <File height={24} width={24} color={colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'} strokeWidth={2} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setAttachment(null)}
                  hitSlop={8}
                  disabled={isSending}
                  className="absolute -top-1 -right-1 bg-[#d4d4d3] dark:bg-[#474646] rounded-full p-[1px]"
                >
                  <XMarkIcon height={16} width={16} color={iconColor} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
            <View className="flex-1 justify-center">
              <TextInput
                ref={inputRef}
                className="py-2 pr-2 font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]"
                placeholder={t('your_message')}
                placeholderTextColor="#979797"
                multiline={true}
                value={text}
                onChangeText={setText}
                editable={!isUploading}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                style={{ paddingVertical: 0 }}
                textAlignVertical="center"
              />
            </View>
            <View className="self-stretch items-center justify-end">
              <TouchableOpacity
                onPress={handleSend}
                disabled={isSending || (!text.trim() && !attachment)}
                className={`h-8 w-8 my-2 rounded-full items-center justify-center ${text.trim() || attachment ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#d4d4d3] dark:bg-[#474646]'} ${isSending ? 'opacity-70' : ''}`}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'} />
                ) : (
                  <ArrowUpIcon
                    height={16}
                    width={16}
                    strokeWidth={3}
                    color={
                      text.trim() || attachment
                        ? colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'
                        : '#ffffff'
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
      

      {/* Sheets */}
      <RBSheet
        ref={attachSheet}
        height={240}
        openDuration={200}
        closeDuration={200}
        draggable={true}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >
        <View className="pb-5 pt-2 px-7 gap-y-4">
          <TouchableOpacity onPress={handleCameraCapture} className="py-2 flex-row justify-start items-center ">
            <Camera height={24} width={24} color={iconColor} strokeWidth={2} />
            <Text className=" ml-6 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">
              {t('take_photo')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImagePick} className="py-2 flex-row justify-start items-center ">
            <ImageIcon height={24} width={24} color={iconColor} strokeWidth={2} />
            <Text className=" ml-6 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">
              {t('choose_image')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFilePick} className="py-2 flex-row justify-start items-center">
            <Folder height={24} width={24} color={iconColor} strokeWidth={2} />
            <Text className="ml-6 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">
              {t('choose_file')}
            </Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      <RBSheet
        ref={msgSheet}
        height={selectedMsg?.fromMe ? 270 : 170}
        openDuration={200}
        closeDuration={200}
        draggable={true}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >
        <View className="pt-3 py-5 px-7 ">      
          <TouchableOpacity onPress={handleReplyMessage} className="pb-6 flex-row justify-start items-center ">
            <CornerUpLeft height={23} width={23} color={iconColor} strokeWidth={2} />
            <Text className="ml-6 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('reply')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopyMessage} className="pt-1 pb-6 flex-row justify-start items-center ">
            <DocumentDuplicateIcon height={23} width={23} color={iconColor} strokeWidth={2} />
            <Text className="ml-6 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('copy')}</Text>
          </TouchableOpacity>
          {selectedMsg?.fromMe && (
            <>
              <TouchableOpacity onPress={handleEditMessage} className="pt-1 pb-6 flex-row justify-start items-center ">
                <Edit2 height={23} width={23} color={iconColor} strokeWidth={2} />
                <Text className="ml-6 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteMessage} className="pt-1 pb-6 flex-row justify-start items-center ">
                <Trash2 height={23} width={23} color={"#FF633E"} strokeWidth={2} />
                <Text className="ml-6 text-[16px] font-inter-medium text-[#FF633E]">{t('delete_message')}</Text>
              </TouchableOpacity>
            </>
          )}
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
        <View className="py-4 px-7 gap-y-4">
          <TouchableOpacity
            onPress={async () => {
              await updateDoc(doc(db, 'conversations', conversationId), { deletedFor: arrayUnion(userId) });
              convSheet.current.close();
              navigation.goBack();
            }}
            className="py-2 flex-row justify-start items-center "
          >
            <MoreHorizontal height={0} width={0} color={'transparent'} />
            <Trash2 height={23} width={23} color={"#FF633E"} strokeWidth={2} />
            <Text className="ml-3 text-[16px] font-inter-medium text-[#FF633E]">{t('delete_chat')}</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
    </TouchableWithoutFeedback>
  );
}