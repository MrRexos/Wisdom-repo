import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './polyfills';
import React, { useEffect, useState } from 'react';
import Navigation from './navigation/navigation';
import { StripeProvider } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnAuthExpired, clearTokens } from './utils/api';
import { navigationRef } from './navigation/navigation';
import { useTranslation } from 'react-i18next';
import './languages/i18n';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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

  useEffect(() => {
    // Se llamará automáticamente cuando el refresh retorne 401 
    setOnAuthExpired(async () => {
      try {
        // asegúrate de limpiar cualquier resto (por si algo quedó) 
        await clearTokens();
        await AsyncStorage.setItem('user', JSON.stringify({ token: false }));
      } catch { }
      // Resetea a GetStarted 
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'GetStarted' }] });
      } else {
        // Si aún no está listo, reintenta en próximo tick 
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.reset({ index: 0, routes: [{ name: 'GetStarted' }] });
          }
        }, 0);
      }
    });
  }, []);

  if (!fontsLoaded) {
    return null; // Puedes mostrar un componente de carga aquí si lo deseas
  }


  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      className={`${colorScheme} color-scheme-${colorScheme}`}
    >
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <BottomSheetModalProvider>
          <Navigation />
        </BottomSheetModalProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}

