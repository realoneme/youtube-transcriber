'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';

interface PlayerProps {
  src: string;
}

export interface PlayerRef {
  playSegment: (start: number, end: number) => void;
}

const Player = forwardRef<PlayerRef, PlayerProps>(({ src }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  // No user-interaction gating; rely on Range support + autoplay after seek

  useImperativeHandle(ref, () => ({
    playSegment: (start: number, end: number) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      // Robust seek flow: pause → seek → onseeked → play, and guard by timeupdate
      try {
        audio.pause();
      } catch {}

      const onSeeked = () => {
        audio.removeEventListener('seeked', onSeeked);
        audio.play().catch(() => {});
      };
      audio.addEventListener('seeked', onSeeked);

      // If metadata not loaded yet, wait for it then set currentTime
      if (audio.readyState < 1) {
        const onLoaded = () => {
          audio.removeEventListener('loadedmetadata', onLoaded);
          audio.currentTime = start;
        };
        audio.addEventListener('loadedmetadata', onLoaded);
        try {
          audio.load();
        } catch {}
      } else {
        audio.currentTime = start;
      }

      const handleTimeUpdate = () => {
        if (audio.currentTime >= end) {
          audio.pause();
          audio.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
      audio.addEventListener('timeupdate', handleTimeUpdate);
    },
  }));

  return (
    <div className='w-full max-w-2xl mx-auto'>
      <audio
        ref={audioRef}
        src={src}
        controls
        className='w-full'
        preload='auto'
        playsInline
      />
    </div>
  );
});

Player.displayName = 'Player';

export default Player;
