import React, { useEffect, useMemo, useState } from 'react';
import type { Lang } from './types';
import { ru } from '../content/ru';
import { en } from '../content/en';
import { es } from '../content/es';
import { I18nContext } from './I18nContext';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return ru;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}


