import React, { useState } from 'react';
import { Text, View, StatusBar, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { MaterialIcons } from '@expo/vector-icons';
import { Check } from "react-native-feather";



export default function LanguageScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const Sections = [
    {
      items: [
        { id: 'en', label: 'English' },
        { id: 'es', label: 'Español' },
        { id: 'ca', label: 'Català' },
        { id: 'fr', label: 'Français' },
        { id: 'zh', label: '中文' },
        { id: 'ar', label: 'العربية' },
      ],
    },
  ];

  const changeLanguage = async (language) => {
    setSelectedLanguage(language);  // Cambiar el estado localmente
    await i18n.changeLanguage(language);
    const userData = await getDataLocally('user')
    if (userData) {
      user = JSON.parse(userData);
      user.language = language; 
      await storeDataLocally('user', JSON.stringify(user));
    } else {
      console.log('Not user found in Asyncstorage')
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[90] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
          <View className="flex-1 ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center ">
            <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('language')}</Text>
          </View>
          <View className="flex-1"></View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-[75] gap-y-9">
        {Sections.map(({ items }, sectionIndex) => (
          <View key={sectionIndex} style={{ borderRadius: 12, overflow: 'hidden' }}>
            {items.map(({ label, id }, index) => (
              <View key={id} className="pl-5 bg-[#fcfcfc] dark:bg-[#323131]">
                <TouchableOpacity onPress={() => changeLanguage(id)}>
                  <View className="flex-row items-center justify-start">
                    <View
                      className="h-[45] flex-1 flex-row items-center justify-between pr-[14] border-[#e0e0e0] dark:border-[#3d3d3d]"
                      style={[{ borderTopWidth: 1 }, index === 0 && { borderTopWidth: 0 }]}
                    >
                      <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                      {selectedLanguage === id && (
                        <Check height={15} strokeWidth={3} color={iconColor} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        <View className="h-10"></View>
      </ScrollView>
    </SafeAreaView>
  );
}
