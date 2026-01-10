import React, { useEffect, useMemo, useState } from 'react';
import type { Lang } from './types';
import { ru } from '../content/ru';
import { en } from '../content/en';
import { I18nContext } from './I18nContext';

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


