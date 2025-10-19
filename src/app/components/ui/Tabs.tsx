import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveTab,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || items[0]?.id);

  const activeTabContent = items.find((item) => item.id === activeTab)?.content;
  const activeIndex = items.findIndex((item) => item.id === activeTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className='relative flex border-b border-outline justify-center'>
        {/* 滑动指示器 */}
        <div
          className='absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out'
          style={{
            left: `${(activeIndex / items.length) * 100}%`,
            width: `${100 / items.length}%`,
          }}
        />

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 text-center relative z-10
              ${
                activeTab === item.id
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-main'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='mt-4'>{activeTabContent}</div>
    </div>
  );
};
