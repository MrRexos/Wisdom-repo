import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LocaleConfig } from 'react-native-calendars';
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

const CALENDAR_LOCALES = {
  en: {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today',
  },
  es: {
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    today: 'Hoy',
  },
  ca: {
    monthNames: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
    monthNamesShort: ['gen', 'feb', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'des'],
    dayNames: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
    dayNamesShort: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
    today: 'Avui',
  },
  ar: {
    monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
    dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    dayNamesShort: ['أحد', 'إثن', 'ثلث', 'أرب', 'خمس', 'جمع', 'سبت'],
    today: 'اليوم',
  },
  fr: {
    monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    today: "Aujourd'hui",
  },
  zh: {
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    today: '今天',
  },
};

Object.entries(CALENDAR_LOCALES).forEach(([locale, config]) => {
  LocaleConfig.locales[locale] = config;
});

LocaleConfig.defaultLocale = DEFAULT_LANGUAGE;

i18n.on('languageChanged', (lng) => {
  LocaleConfig.defaultLocale = SUPPORTED_LANGUAGES.includes(lng) ? lng : DEFAULT_LANGUAGE;
});

export { i18n };
export default i18n;