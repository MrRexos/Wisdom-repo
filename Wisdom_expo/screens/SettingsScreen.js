
import React from 'react';
import { Text, View, Button, Switch, Platform, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storeDataLocally } from '../utils/asyncStorage';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';


export default function SettingsScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = async (language) => {
    await i18n.changeLanguage(language);
    storeDataLocally('selectedLanguage', language);
  };
  const handleToggleColorScheme = () => {
    // Cambiar el esquema de colores
    toggleColorScheme();
    // Almacenar el esquema de colores localmente
    storeDataLocally('colorScheme', colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <ScrollView>
        <Text className='text-[#444343] dark:text-[#f2f2f2] text-3xl font-inter-bold px-6 pt-14'>{t('profile')}</Text>
        <Switch value={colorScheme==='dark'} onChange={handleToggleColorScheme}/>
        <Button title="Español" onPress={() => changeLanguage('es')} />
        <Button title="Inglés" onPress={() => changeLanguage('en')} />
        <Button title="Català" onPress={() => changeLanguage('ca')} />
        <Button title="Français" onPress={() => changeLanguage('fr')} />
        <Button title="中文" onPress={() => changeLanguage('zh')} />
        <Button title="العربية" onPress={() => changeLanguage('ar')} />

      </ScrollView>
    </SafeAreaView>
  );
}