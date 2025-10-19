'use client';

import React from 'react';
import { useI18n } from '@/app/i18n/Provider';
import { HistoryItem, removeHistory } from '@/app/utils/history';

interface Props {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete?: (id: string) => void;
}

export default function HistoryList({ items, onSelect, onDelete }: Props) {
  const { t } = useI18n();

  if (!items.length) {
    return (
      <div className='text-text-secondary text-sm'>{t('history.empty')}</div>
    );
  }

  return (
    <div className='space-y-2'>
      {items.map((it) => (
        <div
          key={it.id}
          className='flex items-center justify-between border border-outline rounded-xl px-3 py-2 hover:bg-[var(--color-bg-elevated)] transition cursor-pointer'
        >
          <div className='flex-1 pr-3' onClick={() => onSelect(it)}>
            <div className='text-text-main text-sm'>
              {it.title || t('history.item.untitled')}
            </div>
            <div className='text-text-secondary text-xs opacity-70'>
              {new Date(it.createdAt).toLocaleString()}
            </div>
          </div>
          <button
            className='text-xs text-red-400 hover:text-red-300'
            onClick={() => {
              onDelete ? onDelete(it.id) : removeHistory(it.id);
            }}
            aria-label={t('history.delete')}
          >
            {t('history.delete')}
          </button>
        </div>
      ))}
    </div>
  );
}
