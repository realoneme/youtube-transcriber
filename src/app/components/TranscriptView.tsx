'use client';

import React from 'react';

export interface TranscriptSegment {
  original: string;
  translated: string;
  start?: number;
  end?: number;
}

interface TranscriptViewProps {
  segments: TranscriptSegment[];
  onSegmentClick?: (start: number, end: number) => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  segments,
  onSegmentClick,
}) => {
  const handleSegmentClick = (seg: TranscriptSegment) => {
    if (onSegmentClick && seg.start !== undefined && seg.end !== undefined) {
      onSegmentClick(seg.start, seg.end);
    }
  };

  return (
    <div className='w-full max-w-3xl mx-auto space-y-4 p-4'>
      {segments.map((seg, i) => (
        <div
          key={i}
          onClick={() => handleSegmentClick(seg)}
          className={`group p-4 rounded-md border border-[var(--color-outline)] bg-[var(--color-bg-surface)] 
                     transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-glow-red)] 
                     animate-fade-in ${
                       seg.start !== undefined && seg.end !== undefined
                         ? 'cursor-pointer hover:bg-[var(--color-bg-elevated)]'
                         : 'cursor-default'
                     }`}
        >
          {/* 原文 */}
          <p className='text-[var(--color-text-main)] text-lg leading-snug'>
            {seg.original}
          </p>

          {/* 翻译 */}
          <p className='text-[var(--color-text-secondary)] text-base italic mt-1'>
            {seg.translated}
          </p>

          {/* 可点击的时间戳 */}
          {seg.start !== undefined && seg.end !== undefined && (
            <div className='mt-2 flex items-center gap-2'>
              <button
                onClick={() => onSegmentClick?.(seg.start!, seg.end!)}
                className='text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors'
              >
                {formatTime(seg.start)}
              </button>
              <span className='text-xs text-[var(--color-text-disabled)] opacity-70'>
                →
              </span>
              <button
                onClick={() => onSegmentClick?.(seg.end!, seg.end! + 1)}
                className='text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors'
              >
                {formatTime(seg.end)}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default TranscriptView;
