'use client';

import React from 'react';
import LanguageSelector from '@/app/components/LanguageSelector';

export default function TopRightLanguage() {
  return (
    <div className='fixed top-4 right-4 z-40 flex items-center gap-2'>
      <span className='material-symbols-outlined text-text-main'>language</span>
      <LanguageSelector />
    </div>
  );
}
