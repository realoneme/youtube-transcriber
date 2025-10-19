import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = true,
  size = 'md',
}) => {
  // 确保 progress 在 0-100 范围内
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} bg-bg-elevated rounded-full overflow-hidden`}
      >
        {/* 渐变进度条 */}
        <div
          className='h-full rounded-full transition-all duration-300 ease-out'
          style={{
            width: `${clampedProgress}%`,
            background: `linear-gradient(90deg, 
              var(--color-primary-light) 0%, 
              var(--color-primary) 50%, 
              var(--color-primary-hover) 100%)`,
          }}
        />

        {/* 进度条发光效果 */}
        <div
          className='absolute top-0 h-full rounded-full opacity-30 blur-sm'
          style={{
            width: `${clampedProgress}%`,
            background: `linear-gradient(90deg, 
              var(--color-primary-light) 0%, 
              var(--color-primary) 50%, 
              var(--color-primary-hover) 100%)`,
          }}
        />
      </div>

      {/* 百分比显示 */}
      {showPercentage && (
        <div className='mt-2 text-right'>
          <span className='text-sm text-text-secondary'>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};
