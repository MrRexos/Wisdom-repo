
import React from 'react';
import { Text, View, Button, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../languages/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeDataLocally } from '../utils/asyncStorage';
import { useColorScheme } from 'nativewind'


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
    <View className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] p-8'>
      <Text>{t('hello')}</Text>
      <Switch value={colorScheme==='dark'} onChange={handleToggleColorScheme}/>
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