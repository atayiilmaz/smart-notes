import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en';
import tr from './locales/tr';

const resources = {
    en: {
        translation: en,
    },
    tr: {
        translation: tr,
    },
};

const LANG_CODES = Object.keys(resources);

const LANGUAGE_DETECTOR = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lng: string) => void) => {
        try {
            const savedLanguage = await AsyncStorage.getItem('language');
            if (savedLanguage && LANG_CODES.includes(savedLanguage)) {
                callback(savedLanguage);
                return;
            }
            callback('en');
        } catch (error) {
            console.error('Error reading language', error);
            callback('en');
        }
    },
    init: () => {},
    cacheUserLanguage: async (lng: string) => {
        try {
            await AsyncStorage.setItem('language', lng);
        } catch (error) {
            console.error('Error saving language', error);
        }
    },
};

i18n
    .use(LANGUAGE_DETECTOR)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n; 