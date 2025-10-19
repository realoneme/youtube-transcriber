'use client';

import { useState, useRef, useEffect } from 'react';
import TranscriptView, {
  TranscriptSegment,
} from '@/app/components/TranscriptView';
import Player, { PlayerRef } from '@/app/components/Player';
import {
  transcribe,
  TranscribeResult,
  translateSegments,
} from './actions/transcribe';
import { Button, Tabs, ProgressBar } from '@/app/components/ui';
import { useI18n } from '@/app/i18n/Provider';
import LanguageSelector from '@/app/components/LanguageSelector';
import HistoryList from '@/app/components/HistoryList';
import {
  addHistory,
  loadHistory,
  removeHistory,
  HistoryItem,
} from '@/app/utils/history';

export default function Page() {
  const { t } = useI18n();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [progress, setProgress] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<'video' | 'audio'>('video');
  const [targetLang, setTargetLang] = useState<string>('zh');
  const playerRef = useRef<PlayerRef>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [translatedCache, setTranslatedCache] = useState<
    Record<string, string[]>
  >({});

  // 提取 YouTube 视频 ID
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // URL 变化时，自动根据是否有 videoId 设置显示模式
  useEffect(() => {
    const hasVideo = !!getYouTubeVideoId(url);
    if (!hasVideo && displayMode !== 'audio') {
      setDisplayMode('audio');
    }
  }, [url]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // 目标语言变更：若已有段落，优先使用缓存；否则调用翻译
  useEffect(() => {
    if (!segments.length) return;
    const cached = translatedCache[targetLang];
    if (cached && cached.length === segments.length) {
      setSegments(segments.map((s, i) => ({ ...s, translated: cached[i] })));
      return;
    }
    (async () => {
      try {
        const translatedArr = await translateSegments(segments, targetLang);
        setTranslatedCache((prev) => ({
          ...prev,
          [targetLang]: translatedArr,
        }));
        setSegments(
          segments.map((s, i) => ({ ...s, translated: translatedArr[i] }))
        );
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLang]);

  // 处理字幕点击
  const handleSegmentClick = (start: number, end: number) => {
    if (displayMode === 'video' && url) {
      // 控制YouTube视频播放
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        // 重新加载iframe以跳转到指定时间
        const iframe = document.querySelector(
          'iframe[title="YouTube video player"]'
        ) as HTMLIFrameElement;
        if (iframe) {
          iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&start=${Math.floor(
            start
          )}`;
        }
      }
    } else if (displayMode === 'audio' && playerRef.current) {
      playerRef.current.playSegment(start, end);
    }
  };

  const handleTranscribe = async () => {
    setLoading(true);
    setSegments([]);
    setProgress(0);

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // 保持在90%直到任务完成
        }
        return prev + Math.random() * 15; // 随机增加进度
      });
    }, 200);

    try {
      const result = await transcribe(url, targetLang);
      clearInterval(progressInterval);
      setProgress(100);

      // 短暂延迟后完成
      setTimeout(() => {
        setSegments(result.segments);
        setAudioSrc(result.audioPath);
        // 无视频源时自动切换为音频显示
        const hasVideo = !!getYouTubeVideoId(url);
        if (!hasVideo) setDisplayMode('audio');
        setLoading(false);
        setProgress(0);

        // 缓存本次语言的翻译
        try {
          const transArr = result.segments.map((s) => s.translated);
          setTranslatedCache((prev) => ({ ...prev, [targetLang]: transArr }));
        } catch {}

        // 保存历史
        try {
          const title = url || t('history.item.untitled');
          const item: HistoryItem = {
            id: `${Date.now()}`,
            url,
            title,
            audioPath: result.audioPath,
            createdAt: Date.now(),
            segments: result.segments,
          };
          addHistory(item);
          setHistory(loadHistory());
        } catch {}
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setUrl(item.url);
    setAudioSrc(item.audioPath);
    setSegments(item.segments as any);
    setDisplayMode(item.url ? 'video' : 'audio');
  };

  const handleDeleteHistory = (id: string) => {
    removeHistory(id);
    setHistory(loadHistory());
  };

  // 合并所有段落为全文
  const fullText = {
    original: segments.map((seg) => seg.original).join(' '),
    translated: segments.map((seg) => seg.translated).join(' '),
  };

  return (
    <main className='p-10 bg-bg-main min-h-screen'>
      <h1 className='text-2xl font-bold mb-4 text-text-main text-center'>
        RoboSub Crew
      </h1>
      <div className='flex flex-col gap-3 mb-6'>
        <div className='w-full max-w-3xl mx-auto'>
          <h2 className='text-text-main font-semibold mb-2'>
            {t('history.title')}
          </h2>
          <HistoryList
            items={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
          />
        </div>
        <div className='flex gap-3 justify-center items-center'>
          <label htmlFor='targetLang' className='text-text-main'>
            {t('label.targetLang')}
          </label>
          <select
            id='targetLang'
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className='bg-bg-surface text-text-main border-outline border rounded-2xl px-3 py-2 focus:border-primary focus:shadow-glow-red focus:outline-none transition-all'
            aria-label={t('aria.targetLang')}
          >
            <option value='zh'>{t('lang.zh')}</option>
            <option value='ja'>{t('lang.ja')}</option>
            <option value='en'>{t('lang.en')}</option>
            <option value='ko'>{t('lang.ko')}</option>
            <option value='fr'>{t('lang.fr')}</option>
          </select>
          <input
            type='text'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('input.url.placeholder')}
            className='bg-bg-surface text-text-main border-outline border rounded-2xl px-3 py-2 w-[400px] focus:border-primary focus:shadow-glow-red focus:outline-none transition-all'
          />

          <Button
            onClick={handleTranscribe}
            disabled={loading}
            variant='primary'
          >
            {loading ? t('status.transcribing') : t('button.transcribe')}
          </Button>
        </div>

        {/* 显示模式切换 */}
        {segments.length > 0 && (
          <div className='flex justify-center gap-4 mb-6'>
            <Button
              onClick={() => setDisplayMode('video')}
              variant={displayMode === 'video' ? 'primary' : 'secondary'}
              disabled={!url}
            >
              {t('mode.video')}
            </Button>
            <Button
              onClick={() => setDisplayMode('audio')}
              variant={displayMode === 'audio' ? 'primary' : 'secondary'}
            >
              {t('mode.audio')}
            </Button>
          </div>
        )}

        {/* 视频/音频播放区域 */}
        {segments.length > 0 && (
          <div className='mb-8'>
            {displayMode === 'video' && url ? (
              <div className='w-full max-w-4xl mx-auto'>
                <div className='aspect-video bg-black rounded-lg overflow-hidden mb-4'>
                  <iframe
                    width='100%'
                    height='100%'
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                      url
                    )}?rel=0&modestbranding=1`}
                    title='YouTube video player'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    className='w-full h-full'
                  />
                </div>
              </div>
            ) : (
              <div>
                <Player ref={playerRef} src={audioSrc} />
              </div>
            )}
          </div>
        )}

        {/* Tab 切换 */}
        {segments.length > 0 && (
          <Tabs
            items={[
              {
                id: 'sentence',
                label: t('tabs.bySentence'),
                content: (
                  <TranscriptView
                    segments={segments}
                    onSegmentClick={handleSegmentClick}
                  />
                ),
              },
              {
                id: 'fulltext',
                label: t('tabs.fullText'),
                content: (
                  <div className='w-full max-w-6xl mx-auto'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                      {/* 原文 */}
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold text-text-main border-b border-outline pb-2'>
                          {t('full.original')}
                        </h3>
                        <div className='p-4 rounded-md border border-[var(--color-outline)] bg-[var(--color-bg-surface)] min-h-[400px]'>
                          <p className='text-[var(--color-text-main)] text-base leading-relaxed whitespace-pre-wrap'>
                            {fullText.original}
                          </p>
                        </div>
                      </div>

                      {/* 译文 */}
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold text-text-main border-b border-outline pb-2'>
                          {t('full.translation')}
                        </h3>
                        <div className='p-4 rounded-md border border-[var(--color-outline)] bg-[var(--color-bg-surface)] min-h-[400px]'>
                          <p className='text-[var(--color-text-secondary)] text-base leading-relaxed whitespace-pre-wrap'>
                            {fullText.translated}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
            defaultActiveTab='sentence'
          />
        )}
      </div>
      {loading ? (
        <div className='text-center py-8'>
          <div className='text-text-main mb-4'>{t('status.transcribing')}</div>
          <div className='max-w-md mx-auto'>
            <ProgressBar progress={progress} size='lg' showPercentage={true} />
          </div>
        </div>
      ) : segments.length === 0 ? (
        <div className='text-center py-8 text-text-secondary'>
          {t('empty.hint')}
        </div>
      ) : null}
    </main>
  );
}
