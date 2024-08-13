
import React from 'react';
import { Text, View, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../languages/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    try{
      await AsyncStorage.setItem('selectedLanguage', lng); 
      console.log('data saved')
    }catch(err){
      console.log(`${err}`)
    }
  };

  return (
    <View className='p-8'>
      <Text>{t('hello')}</Text>
      <Button title="Español" onPress={() => changeLanguage('es')} />
      <Button title="Inglés" onPress={() => changeLanguage('en')} />
      <Button title="Català" onPress={() => changeLanguage('ca')} />
      <Button title="Français" onPress={() => changeLanguage('fr')} />
      <Button title="中文" onPress={() => changeLanguage('zh')} />
      <Button title="العربية" onPress={() => changeLanguage('ar')} />
      {/* Agrega más botones para otros idiomas */}
    </View>
  );
}