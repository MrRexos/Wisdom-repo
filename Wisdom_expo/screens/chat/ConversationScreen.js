import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  PaperClipIcon,
  ArrowUpIcon,
} from 'react-native-heroicons/outline';
import { CheckIcon } from 'react-native-heroicons/solid';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';


export default function ConversationScreen() {
  // ---------------------------------------------------------------------------
  // • HOOKS & HELPERS
  // ---------------------------------------------------------------------------
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // ---------------------------------------------------------------------------
  // • STATE (mock)
  // ---------------------------------------------------------------------------
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      fromMe: true,
      text: 'Hola!',
      time: '11:20',
      read: true,
    },
    
    {
      id: '2',
      type: 'label',
      text: 'Lorem ipsum',
    },
    {
      id: '3',
      fromMe: false,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed',
      time: '11:20',
    }, 
    {
      id: '4',
      fromMe: true,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed',
      time: '11:20',
      read: true,
    },
    {
      id: '5',
      fromMe: true,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed',
      time: '11:20',
      read: true,
    },
  ]);
  const isLastOfStreak = (msgs, idx) =>
    idx === msgs.length - 1 || msgs[idx].fromMe !== msgs[idx + 1].fromMe;

  // ---------------------------------------------------------------------------
  // • ACTIONS
  // ---------------------------------------------------------------------------
  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      fromMe: true,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // ---------------------------------------------------------------------------
  // • RENDER HELPERS
  // ---------------------------------------------------------------------------
  const renderMessage = ({ item, index }) => {           // ← añade index
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
      'rounded-2xl px-4 py-2 max-w-[70%] my-[2] flex-row items-end';
  
    // Común a todos los propios / ajenos
    const common =
      item.fromMe
        ? 'self-end bg-[#FCFCFC] dark:bg-[#323131]'
        : 'self-start bg-[#D4D4D3] dark:bg-[#3d3d3d]';
  
    // Sólo quitamos esquina exterior si es el último de la racha
    const corner =
      item.fromMe
        ? lastOfStreak ? ' rounded-br' : ''
        : lastOfStreak ? ' rounded-bl' : '';
  
    const fromMeStyles = common + corner;
  
    const textColor = 'text-[15px] font-medium text-[#515150] dark:text-[#d4d4d3]';
  
    return (
      <View>                                         {/* ← contenedor nuevo */}
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
              <CheckIcon height={14} width={14} color="#9ca3af" />
            )}
            <Text className="text-[13px] text-[#b6b5b5] dark:text-[#706f6e] ml-1">
              {item.time}
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
    <View className="flex-1">
    <SafeTop edges={['top']} className="bg-[#fcfcfc] dark:bg-[#202020] rounded-b-[30px]">
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header -------------------------------------------------------------- */}

      <View
        className="flex-row items-center px-2 pt-4 pb-8 dark:border-[#3d3d3d]"
        style={{
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 28,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ChevronLeftIcon height={24} width={24} color={iconColor} strokeWidth={2} />
        </Pressable>

        <View className="h-8 w-8 rounded-full bg-gray-300 dark:bg-[#3d3d3d] mx-2" />
        <Text className="flex-1 text-base font-inter-semibold text-[#444343] dark:text-[#f2f2f2]">
          Nom Cognom
        </Text>

        <Pressable hitSlop={8} className="p-1">
          <EllipsisHorizontalIcon height={24} width={24} color={iconColor} strokeWidth={2} />
        </Pressable>
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
                    space-x-2"                /* separación entre adjunto y campo */
        >
          {/* Attachment – bolita aparte */}
          <Pressable
            hitSlop={8}
            className="h-11 w-11 rounded-full              /* idéntico alto-ancho */
                      items-center justify-center
                      bg-[#e5e5e5] dark:bg-[#3d3d3d]"
          >
            <PaperClipIcon height={24} width={24} color={"#979797"} strokeWidth={1.5} />
          </Pressable>

          {/* Campo de texto + botón send dentro del mismo “pill” ---------------- */}
          <View
            className="flex-1 flex-row items-center
                      bg-[#e0e0e0] dark:bg-[#3d3d3d]
                      rounded-3xl pl-4 pr-2 "
          >
            <View className="flex-1 justify-center">
            <TextInput
              className="my-2 mr-2 font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]"
              placeholder={t('your_message')}
              placeholderTextColor="#979797"
              multiline={true}
              value={text}
              onChangeText={setText}
              style={{ paddingVertical: 0 }}
              textAlignVertical="center" 
            />
            </View>
            <View className="self-stretch items-center justify-end">

            <Pressable
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
            </Pressable>
            </View>
          </View>
        </View>

      </KeyboardAvoidingView>
    
      </View>
  );
}
