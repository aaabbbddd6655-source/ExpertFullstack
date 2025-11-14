import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation types
export type Language = 'en' | 'ar';
export type TranslationKey = string;
export type Translations = Record<string, any>;

// Language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation files
import enTranslations from './translations/en.json';
import arTranslations from './translations/ar.json';

const translations: Record<Language, Translations> = {
  en: enTranslations,
  ar: arTranslations,
};

// Helper to get nested translation value
function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored === 'ar' || stored === 'en') ? stored : 'en';
  });

  // Direction based on language
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Translation function
  const t = (key: string): string => {
    return getNestedTranslation(translations[language], key);
  };

  // Update localStorage and HTML dir when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  // Wrapper to update language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use translations
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
