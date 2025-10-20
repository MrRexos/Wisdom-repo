import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './polyfills';
import React, { useEffect, useMemo, useState } from 'react';
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
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar'

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Q6eHSP5JxrowksKBSbTF99MTGHyTaFq1WNsDMakQCmTlJgetqqycyGnDLaaI2ASO7U6WqucQJQpW87JAie0XpXn00u1jtdcEW';
//change to .env in future


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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar translucent={false} />
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
    </SafeAreaProvider>
  );
}

