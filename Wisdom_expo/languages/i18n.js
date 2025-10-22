import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';
import ca from './ca.json';
import ar from './ar.json';
import fr from './fr.json';
import zh from './zh.json';

const resources = {
  en,
  es,
  ca,
  ar,
  fr,
  zh,
};

export const SUPPORTED_LANGUAGES = Object.keys(resources);
export const DEFAULT_LANGUAGE = 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
});

export { i18n };
export default i18n;