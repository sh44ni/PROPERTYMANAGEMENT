'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, Translations } from '@/locales/en';
import { ar } from '@/locales/ar';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { en, ar };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        const saved = localStorage.getItem('telal-language') as Language;
        if (saved && (saved === 'en' || saved === 'ar')) {
            setLanguageState(saved);
        }
        setMounted(true);
    }, []);

    // Update HTML attributes when language changes
    useEffect(() => {
        if (!mounted) return;

        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

        // Add/remove RTL class for Tailwind
        if (language === 'ar') {
            document.documentElement.classList.add('rtl');
        } else {
            document.documentElement.classList.remove('rtl');
        }
    }, [language, mounted]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('telal-language', lang);
    }, []);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translations[language],
        isRTL: language === 'ar',
    };

    // Prevent flash of wrong language
    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Alias for shorter usage
export const useTranslation = useLanguage;
