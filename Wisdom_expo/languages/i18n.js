import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';
import ca from './ca.json';
import ar from './ar.json';
import fr from './fr.json';
import zh from './zh.json';

const resources = {
  en: en,
  es: es,
  ca: ca,
  ar: ar,
  fr: fr,
  zh: zh,
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'es',// default language to use.
    fallbackLng: 'en',
  });

export default i18n;