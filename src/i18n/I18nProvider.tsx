import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { I18nDict, Lang } from './types';
import { ru } from '../content/ru';
import { en } from '../content/en';

type I18nState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: I18nDict;
};

export const I18nContext = createContext<I18nState | null>(null);

const STORAGE_KEY = 'lu_lang';

function getInitialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' ? 'en' : 'ru';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return getInitialLang();
    } catch {
      return 'ru';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => (lang === 'ru' ? ru : en), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}


