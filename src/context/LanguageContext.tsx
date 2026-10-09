import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SupportedLanguage, getTranslation, SUPPORTED_LANGUAGES, LanguageOption, autoTranslateText } from '../utils/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  languages: SUPPORTED_LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('sme_app_language');
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as SupportedLanguage;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return 'en';
  });

  const prevLangRef = useRef<SupportedLanguage>(language);

  // Sync Google Translate Combo and Cookies
  const triggerGoogleTranslate = (lang: SupportedLanguage) => {
    try {
      const cookieVal = lang === 'en' ? '/en/en' : `/en/${lang}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        document.cookie = `googtrans=${cookieVal}; domain=.${domainParts.slice(-2).join('.')}; path=/;`;
      }

      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change'));
        }
      }
    } catch (err) {
      console.warn('Google translate sync warning:', err);
    }
  };

  // Perform DOM tree walk to translate remaining unkeyed English strings
  const walkAndTranslate = (targetLang: SupportedLanguage) => {
    if (targetLang === 'en' || typeof document === 'undefined') return;

    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (['script', 'style', 'code', 'pre', 'noscript'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('[translate="no"]') || parent.classList.contains('notranslate')) {
              return NodeFilter.FILTER_REJECT;
            }
            const text = node.nodeValue?.trim();
            if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const original = node.nodeValue;
        if (original) {
          const translated = autoTranslateText(original, targetLang);
          if (translated !== original) {
            node.nodeValue = translated;
          }
        }
      }
    } catch (err) {
      console.warn('DOM translation pass warning:', err);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    triggerGoogleTranslate(language);

    // If switching back to English from another language, reload to get fresh un-mutated DOM
    if (language === 'en' && prevLangRef.current !== 'en') {
      prevLangRef.current = 'en';
      try {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.reload();
      } catch (e) {
        // Ignore
      }
      return;
    }
    prevLangRef.current = language;

    if (language !== 'en') {
      // Execute DOM translation pass
      const timer1 = setTimeout(() => walkAndTranslate(language), 150);
      const timer2 = setTimeout(() => {
        triggerGoogleTranslate(language);
        walkAndTranslate(language);
      }, 700);
      const timer3 = setTimeout(() => {
        triggerGoogleTranslate(language);
      }, 1800);

      // Mutation observer for dynamically loaded views and modals
      let debounceTimer: any = null;
      const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          walkAndTranslate(language);
        }, 300);
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(debounceTimer);
        observer.disconnect();
      };
    }
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sme_app_language', lang);
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  const t = (key: string, fallback?: string) => {
    return getTranslation(language, key, fallback);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

