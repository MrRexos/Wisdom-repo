import { View, Text, Switch, Button, TouchableOpacity } from 'react-native'
import { useColorScheme } from 'nativewind'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getDataLocally } from '../utils/asyncStorage';
import i18n from '../languages/i18n';
import { Search, Heart, MessageSquare } from "react-native-feather";



export default function WelcomeVideoScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
  

    useEffect(()=>{
      const loadLanguage = async () => {
        let language = await getDataLocally('selectedLanguage')
        if (language) {
          i18n.changeLanguage(language);
        };
      };
      const loadColorScheme = async () => {
        let storedColorScheme = await getDataLocally('colorScheme');
        if (storedColorScheme && storedColorScheme !== colorScheme) {
          // Si el esquema de color almacenado es diferente del actual, lo alternamos
          toggleColorScheme();
        }
      };
      
      loadLanguage()
      loadColorScheme()
    },[])

    return (
        <View className='flex-1 justify-end items-center bg-[#f2f2f2] dark:bg-[#272626]'>
          <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          <TouchableOpacity onPress={() => navigation.navigate('Loading')}>
            <Text className='text-[#272626] dark:text-[#f2f2f2] font-inter-semibold m-[75]'>{t('skip_intro')}</Text>
          </TouchableOpacity>
      </View>
    )
}