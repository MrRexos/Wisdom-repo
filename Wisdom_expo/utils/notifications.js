import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const EXPO_GO_PUSH_UNAVAILABLE_MESSAGE =
  'Push notifications cannot be enabled when running the app with Expo Go on Android. '
  + 'They will remain disabled until you use a development build.';

let cachedModule;
let moduleLoaded = false;

function loadNotificationsModule() {
  if (moduleLoaded) {
    return cachedModule;
  }

  moduleLoaded = true;

  if (Constants?.appOwnership === 'expo' && Platform.OS === 'android') {
    cachedModule = null;
    return cachedModule;
  }

  try {
    cachedModule = require('expo-notifications');
  } catch (error) {
    console.warn('[notifications] expo-notifications module is unavailable:', error);
    cachedModule = null;
  }

  return cachedModule;
}

export function isPushNotificationsSupported() {
  return !!loadNotificationsModule();
}

export async function requestPermissionsAsync() {
  const module = loadNotificationsModule();
  if (!module) {
    return { status: 'denied', granted: false, canAskAgain: false };
  }

  return module.requestPermissionsAsync();
}

export async function getPermissionsAsync() {
  const module = loadNotificationsModule();
  if (!module) {
    return { status: 'denied', granted: false, canAskAgain: false };
  }

  return module.getPermissionsAsync();
}
