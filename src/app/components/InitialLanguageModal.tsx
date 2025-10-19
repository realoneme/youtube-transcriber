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

export default function InitialLanguageModal() {
  const {
    uiLang,
    setUiLang,
    t,
    hasChosen,
    confirmUiLang,
    detectedLang,
  } = useI18n();

  if (hasChosen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-bg-surface border border-outline rounded-2xl p-6 w-[90%] max-w-md shadow-xl'>
        <h2 className='text-xl font-semibold text-text-main mb-4 text-center'>
          {t('lang.select.title')}
        </h2>
        <p className='text-center text-text-secondary mb-3'>
          {t('lang.detect.prefix')}
          {detectedLang}
        </p>
        <div className='flex items-center justify-center gap-3 mb-4'>
          <span className='text-text-secondary'>{t('lang.detect.change')}</span>
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
        <div className='flex justify-center'>
          <button
            onClick={confirmUiLang}
            className='px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition'
          >
            {t('lang.select.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
