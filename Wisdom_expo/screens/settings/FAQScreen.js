import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';


export default function FAQScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const Sections = [
    {
      items: [
        { id: 'question1', label: 'Can I book services without being a professional?', answer: 'Of course, both professionals and clients can book all the services they are interested in.' },
        { id: 'question2', label: 'How does a booking work?', answer: `Once you have booked the service, the professional will have 48 hours to confirm the request. If he/she refuses or does not reply, the deposit will be refunded in full.
  
  If you accept it, at the end of the service you will have to pay the full price of the service.`},
      ],
    },
  ];

  // Estado para almacenar qué preguntas están abiertas
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Maneja el clic para expandir/contraer preguntas
  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id], // Alterna entre abierto y cerrado
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[90] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
          <View className="flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('faq')}</Text>
          </View>
          <View className="flex-1"></View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-[75] gap-y-9">
        {Sections.map(({ items }, sectionIndex) => (
          <View key={sectionIndex} style={{ borderRadius: 12, overflow: 'hidden' }}>
            {items.map(({ label, id, answer }, index) => (
              <View key={id} className="pl-5 bg-[#fcfcfc] dark:bg-[#323131]">
                <TouchableOpacity onPress={() => toggleQuestion(id)}>
                  <View className="flex-row items-center justify-between pr-[14] py-[10] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{ borderTopWidth: 1 }, index === 0 && { borderTopWidth: 0 }]}>
                    <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                    {expandedQuestions[id] ? (
                      <ChevronUpIcon size={23} strokeWidth={1.8} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} />
                    ) : (
                      <ChevronDownIcon size={23} strokeWidth={1.8} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedQuestions[id] && (
                  <View className="mt-2 mb-4 pr-7">
                    <Text className="font-inter-medium text-[#979797] pl-4">{answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
        <View className="h-10"></View>
      </ScrollView>
    </SafeAreaView>
  );
}
