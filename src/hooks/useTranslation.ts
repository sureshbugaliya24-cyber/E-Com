import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

const translations = {
    en,
    hi
};

type Language = 'en' | 'hi';

export function useTranslation() {
    const language = useSelector((state: RootState) => state.ui.language) as Language;
    
    // Fallback to english if something goes wrong
    const activeTranslations = translations[language] || translations.en;

    // Helper function to get nested keys like "home.hero.title"
    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = activeTranslations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // return the key path itself if not found
            }
        }
        
        return value as string;
    };

    return { t, language };
}
