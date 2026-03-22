import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import en from '../locales/en';
import uk from '../locales/uk';

type Lang = 'en' | 'uk';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tc: (categoryName: string) => string;
}

const locales: Record<Lang, Record<string, unknown>> = { en, uk };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'en'
  );

  function setLang(newLang: Lang): void {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  }

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const parts = key.split('.');
      let val: unknown = locales[lang];
      for (const part of parts) val = (val as Record<string, unknown>)?.[part];

      if (val === undefined) {
        // Fallback to English
        val = locales.en;
        for (const part of parts) val = (val as Record<string, unknown>)?.[part];
      }

      if (typeof val !== 'string') return key;

      if (vars) {
        return val.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
      }

      return val;
    },
    [lang]
  );

  // Translate a category name: known defaults get translated, custom names stay as-is
  const tc = useCallback(
    (name: string): string => {
      if (!name) return name;
      const categories = (locales[lang] as Record<string, unknown>)?.categories as Record<string, string> | undefined;
      return categories?.[name] || name;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tc }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
