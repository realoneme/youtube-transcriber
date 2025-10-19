'use client';

import React from 'react';
import { useI18n } from '@/app/i18n/Provider';
import type { UiLanguage } from '@/app/i18n/dictionaries';

const options: { value: UiLanguage; labelKey: string }[] = [
  { value: 'zh', labelKey: 'lang.zh' },
  { value: 'ja', labelKey: 'lang.ja' },
  { value: 'en', labelKey: 'lang.en' },
  { value: 'ko', labelKey: 'lang.ko' },
  { value: 'fr', labelKey: 'lang.fr' },
];

export default function LanguageSelector() {
  const { uiLang, setUiLang, t } = useI18n();

  return (
    <div className='flex items-center gap-2'>
      <select
        value={uiLang}
        onChange={(e) => setUiLang(e.target.value as UiLanguage)}
        className='bg-bg-surface text-text-main border-outline border rounded-2xl px-3 py-2 focus:border-primary focus:shadow-glow-red focus:outline-none transition-all'
        aria-label={t('lang.select.title')}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
