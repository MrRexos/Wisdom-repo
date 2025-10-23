import { Platform, NativeModules } from 'react-native';
import i18n, { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../languages/i18n';
import * as Localization from 'expo-localization';

const SETTINGS_MANAGER = NativeModules?.SettingsManager;
const I18N_MANAGER = NativeModules?.I18nManager;

const normalizeLanguage = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.replace('_', '-').split('-')[0].toLowerCase();
  return normalized || undefined;
};

export const ensureSupportedLanguage = (language, fallback = DEFAULT_LANGUAGE) => {
  const normalized = normalizeLanguage(language);
  if (normalized && SUPPORTED_LANGUAGES.includes(normalized)) {
    return normalized;
  }
  return fallback;
};

export const detectDeviceLanguage = (fallback = DEFAULT_LANGUAGE) => {
  try {
    const locales =
      typeof Localization?.getLocales === 'function' ? Localization.getLocales() : undefined;
    if (Array.isArray(locales) && locales.length > 0) {
      const { languageCode, languageTag } = locales[0] ?? {};
      const expoLocale = languageCode || languageTag;
      if (expoLocale) {
        return ensureSupportedLanguage(expoLocale, fallback);
      }
    }

    if (typeof Localization?.locale === 'string' && Localization.locale) {
      return ensureSupportedLanguage(Localization.locale, fallback);
    }
    if (Platform.OS === 'ios') {
      const locale =
        SETTINGS_MANAGER?.settings?.AppleLocale ||
        (Array.isArray(SETTINGS_MANAGER?.settings?.AppleLanguages)
          ? SETTINGS_MANAGER.settings.AppleLanguages[0]
          : undefined);
      return ensureSupportedLanguage(locale, fallback);
    }

    const locale = I18N_MANAGER?.localeIdentifier;
    return ensureSupportedLanguage(locale, fallback);
  } catch (error) {
    return fallback;
  }
};

export const resolveInitialLanguage = (user) => {
  const stored = user?.selectedLanguage ?? user?.language;
  if (stored) {
    const ensured = ensureSupportedLanguage(stored);
    return {
      language: ensured,
      shouldPersist:
        ensured !== stored || user?.selectedLanguage !== ensured || user?.language !== ensured,
    };
  }

  const detected = detectDeviceLanguage();
  console.log('[Language] Detected device language:', detected);
  return { language: detected, shouldPersist: Boolean(user) };
};

export const persistLanguageIfNeeded = async (user, nextLanguage, persistCallback) => {
  if (!user) {
    return;
  }

  const currentLanguage = user.selectedLanguage ?? user.language;
  if (currentLanguage === nextLanguage) {
    if (user.language !== nextLanguage || user.selectedLanguage !== nextLanguage) {
      const updatedUser = { ...user, language: nextLanguage, selectedLanguage: nextLanguage };
      await persistCallback(updatedUser);
    }
    return;
  }

  const updatedUser = { ...user, language: nextLanguage, selectedLanguage: nextLanguage };
  await persistCallback(updatedUser);
};

export const applyLanguagePreference = async (user, persistCallback) => {
  const { language, shouldPersist } = resolveInitialLanguage(user);

  if (language !== i18n.language) {
    await i18n.changeLanguage(language);
  }

  if (shouldPersist && persistCallback) {
    await persistLanguageIfNeeded(user, language, persistCallback);
  }

  return language;
};

export default {
  applyLanguagePreference,
  detectDeviceLanguage,
  ensureSupportedLanguage,
  resolveInitialLanguage,
};
