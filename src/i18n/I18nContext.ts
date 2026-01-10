import { createContext } from 'react';
import type { I18nDict, Lang } from './types';

export type I18nState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: I18nDict;
};

export const I18nContext = createContext<I18nState | null>(null);

