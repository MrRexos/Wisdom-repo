import { StyleSheet } from 'react-native';
import Navigation from './navigation/navigation';
import { StripeProvider } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './languages/i18n';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, TailwindProvider } from 'nativewind';
import "./global.css"

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Rg2dQP10ZOJm6Hd0zRenwmVfliHq3DqcvM8axw3tK1N2M5zIKuoOcwDLgsely52VYPsl51QHaxsS0n2Y66GCknJ00Y0xoUNXS';



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
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <Navigation />
      </StripeProvider>
    </GestureHandlerRootView>
  );
}

