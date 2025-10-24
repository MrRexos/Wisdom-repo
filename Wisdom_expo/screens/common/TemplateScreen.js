
import React, { useEffect } from 'react'
import {View, StatusBar, Platform} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';


export default function TemplateScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
    </SafeAreaView>
  );
}