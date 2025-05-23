import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationEN from './locales/en/translation.json';
import authEN from './locales/en/auth.json';
import translationVI from './locales/vi/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
    auth: authEN
  },
  vi: {
    translation: translationVI
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;