
import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, Text} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';


export default function FavoritesScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="flex-1 justify-between px-6">
        <Text className="font-inter-bold text-[28px] text-[#444343] dark:text-[#f2f2f2]">
            Favorites
        </Text>
      </View>
    </SafeAreaView>
  );
}