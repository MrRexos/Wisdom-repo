import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
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
import { StatusBar } from 'expo-status-bar';
import * as StoreReview from 'expo-store-review';


const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Q6eHSP5JxrowksKBSbTF99MTGHyTaFq1WNsDMakQCmTlJgetqqycyGnDLaaI2ASO7U6WqucQJQpW87JAie0XpXn00u1jtdcEW';
//change to .env in future


export default function App() {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const REVIEW_LAUNCH_KEY = 'appLaunchCount';
  const REVIEW_LAST_PROMPT_KEY = 'appLastReviewPrompt';
  const REVIEW_INITIAL_THRESHOLD = Platform.select({
    ios: 12,        // que el usuario haya formado opinión
    android: 12,    // Android tolera un poco más de “velocity”
    default: 10,
  });
  const REVIEW_REMINDER_INTERVAL = Platform.select({
    ios: 25,       // heavy-users: evita pedir demasiado a menudo
    android: 10,   // algo más frecuente para maximizar volumen
    default: 20,
  });
  const REVIEW_COOLDOWN_DAYS = Platform.select({
    ios: 90,       // respeta límites de iOS y reduce fatiga
    android: 60,   // más corto para captar más reseñas
    default: 75,
  });
  const REVIEW_RANDOM_PROBABILITY = 0.4;

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
    if (!fontsLoaded) return;

    const maybeRequestReview = async () => {
      try {
        if (!StoreReview.hasAction() || !(await StoreReview.isAvailableAsync())) {
          return;
        }

        const storedLaunchCount = await AsyncStorage.getItem(REVIEW_LAUNCH_KEY);
        const launchCount = (Number.parseInt(storedLaunchCount ?? '0', 10) || 0) + 1;
        await AsyncStorage.setItem(REVIEW_LAUNCH_KEY, String(launchCount));

        const meetsThreshold =
          launchCount === REVIEW_INITIAL_THRESHOLD ||
          (launchCount > REVIEW_INITIAL_THRESHOLD &&
            (launchCount - REVIEW_INITIAL_THRESHOLD) % REVIEW_REMINDER_INTERVAL === 0);

        // usa la probabilidad configurable
        if (!meetsThreshold || Math.random() >= REVIEW_RANDOM_PROBABILITY) {
          return;
        }

        // solo si pasó el random, miramos el cooldown
        const lastPromptRaw = await AsyncStorage.getItem(REVIEW_LAST_PROMPT_KEY);
        const lastPromptDate = lastPromptRaw ? new Date(lastPromptRaw) : null;
        const now = new Date();

        if (
          lastPromptDate &&
          (now.getTime() - lastPromptDate.getTime()) / (1000 * 60 * 60 * 24) < REVIEW_COOLDOWN_DAYS
        ) {
          return;
        }

        await StoreReview.requestReview();
        await AsyncStorage.setItem(REVIEW_LAST_PROMPT_KEY, now.toISOString());
      } catch (error) {
        console.warn('Error solicitando reseña en la tienda', error);
      }
    };

    maybeRequestReview();
  }, [fontsLoaded]);

  useEffect(() => {
    // Se llamará automáticamente cuando el refresh retorne 401
    setOnAuthExpired(async () => {
      try {
        // asegúrate de limpiar cualquier resto (por si algo quedó)
        await clearTokens();
        const currentLanguage = i18n.language;
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({ token: false, language: currentLanguage, selectedLanguage: currentLanguage })
        );
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

