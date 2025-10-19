'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { UiLanguage, dictionaries, getDefaultUiLanguage } from './dictionaries';

interface I18nContextValue {
  uiLang: UiLanguage;
  setUiLang: (lang: UiLanguage) => void;
  t: (key: string) => string;
  hasChosen: boolean;
  confirmUiLang: () => void;
  detectedLang: UiLanguage;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'ui.language';
const STORAGE_KEY_CHOSEN = 'ui.language.chosen';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [uiLang, setUiLangState] = useState<UiLanguage>('en');
  const [hasChosen, setHasChosen] = useState<boolean>(true);
  const [detectedLang, setDetectedLang] = useState<UiLanguage>('en');

  useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? (localStorage.getItem(STORAGE_KEY) as UiLanguage | null)
        : null;
    const chosenSaved =
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY_CHOSEN)
        : null;
    const detected = getDefaultUiLanguage();
    setDetectedLang(detected);
    setUiLangState(saved ?? detected);
    setHasChosen(chosenSaved === 'true');
  }, []);

  const setUiLang = (lang: UiLanguage) => {
    setUiLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const confirmUiLang = () => {
    setHasChosen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CHOSEN, 'true');
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[uiLang] ?? dictionaries.en;
    const t = (key: string) => dict[key] ?? key;
    return { uiLang, setUiLang, t, hasChosen, confirmUiLang, detectedLang };
  }, [uiLang, hasChosen, detectedLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
