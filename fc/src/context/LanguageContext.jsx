import { createContext, useContext, useState, useCallback } from 'react';
import en from '../locales/en';
import uk from '../locales/uk';

const locales = { en, uk };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('lang') || 'en'
  );

  function setLang(newLang) {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  }

  const t = useCallback(
    (key, vars) => {
      const parts = key.split('.');
      let val = locales[lang];
      for (const part of parts) val = val?.[part];

      if (val === undefined) {
        // Fallback to English
        val = locales.en;
        for (const part of parts) val = val?.[part];
      }

      if (typeof val !== 'string') return key;

      if (vars) {
        return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
      }

      return val;
    },
    [lang]
  );

  // Translate a category name: known defaults get translated, custom names stay as-is
  const tc = useCallback(
    (name) => {
      if (!name) return name;
      const translated = locales[lang]?.categories?.[name];
      return translated || name;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tc }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
