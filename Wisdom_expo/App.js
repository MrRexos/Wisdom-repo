import { StyleSheet } from 'react-native';
import Navigation from './navigation/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './languages/i18n';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import "./global.css"


export default function App() {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Prevenir que la pantalla de splash se oculte automáticamente
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
        'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
      });
      setFontsLoaded(true);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Ocultar la pantalla de splash cuando las fuentes estén cargadas
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Puedes mostrar un componente de carga aquí si lo deseas
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      className={`${colorScheme} color-scheme-${colorScheme}`}
    >
      <Navigation />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
