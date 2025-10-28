import React, { useState } from 'react';
import { Text, View, StatusBar, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import { ensureSupportedLanguage } from '../../utils/language';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { Check } from "react-native-feather";
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../utils/api';



export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [refreshing, setRefreshing] = useState(false);

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
    const resolvedLanguage = ensureSupportedLanguage(language);
    setSelectedLanguage(resolvedLanguage);  // Cambiar el estado localmente
    await i18n.changeLanguage(resolvedLanguage);
    const userData = await getDataLocally('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        user.language = resolvedLanguage;
        user.selectedLanguage = resolvedLanguage;
        await storeDataLocally('user', JSON.stringify(user));

        if (user?.id) {
          try {
            await api.put(`/api/user/${user.id}/language`, { language: resolvedLanguage });
          } catch (apiError) {
            console.error('Failed to update language on backend', apiError);
          }
        }
      } catch (error) {
        console.error('Failed to update language in AsyncStorage', error);
      }
    } else {
      console.log('Not user found in Asyncstorage');
    }
  };

  useRefreshOnFocus(() => {});

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  return (
    <View
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}
      className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="pt-6 bg-[#f2f2f2] dark:bg-[#272626] w-full justify-center items-center">
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

      <ScrollView className="flex-1 px-6 pt-9 space-y-9" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {Sections.map(({ items }, sectionIndex) => (
          <View key={sectionIndex} style={{ borderRadius: 12, overflow: 'hidden' }}>
            {items.map(({ label, id }, index) => (
              <View key={id} className="pl-5 bg-[#fcfcfc] dark:bg-[#323131]">
                <TouchableOpacity onPress={() => changeLanguage(id)}>
                  <View className="flex-row items-center justify-start">
                    <View
                      className="h-[45px] flex-1 flex-row items-center justify-between pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]"
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
    </View>
  );
}
