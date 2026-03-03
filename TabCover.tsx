import React from 'react';
import { TabType } from '../types';

const COVERS: Record<string, { url: string; alt: string; title: string; subtitle: string }> = {
  today: {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=500&fit=crop&crop=center&auto=format&q=80',
    alt: 'Mountain sunrise',
    title: 'Today',
    subtitle: 'Execute your system.',
  },
  installation: {
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1400&h=500&fit=crop&crop=center&auto=format&q=80',
    alt: 'Open books',
    title: 'Installation',
    subtitle: '21 days to build your operating system.',
  },
  reviews: {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&h=500&fit=crop&crop=center&auto=format&q=80',
    alt: 'Writing and reflection',
    title: 'Reviews',
    subtitle: 'Measure, reflect, recalibrate.',
  },
  achievements: {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&h=500&fit=crop&crop=center&auto=format&q=80',
    alt: 'Mountain peak at night',
    title: 'Achievements',
    subtitle: 'Your operational history. Measured and recorded.',
  },
  system: {
    url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1400&h=500&fit=crop&crop=center&auto=format&q=80',
    alt: 'Abstract structure',
    title: 'Your System',
    subtitle: 'The architecture of your life.',
  },
  settings: {
    url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1400&h=500&fit=crop&crop=center&auto=format&q=80',
    alt: 'Dark sky',
    title: 'Settings',
    subtitle: 'Configure your experience.',
  },
};

interface TabCoverProps {
  tab: TabType;
}

export function TabCover({ tab }: TabCoverProps) {
  const cover = COVERS[tab];
  if (!cover || tab === 'today') return null;

  return (
    <div className="relative w-full h-44 sm:h-52 md:h-56 -mt-0 mb-8 overflow-hidden flex items-end">
      {/* Image */}
      <img
        src={cover.url}
        alt={cover.alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Dark gradient — heavy at bottom for text readability */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(
          to bottom,
          rgba(13, 13, 15, 0.15) 0%,
          rgba(13, 13, 15, 0.4) 35%,
          rgba(13, 13, 15, 0.75) 65%,
          rgba(13, 13, 15, 0.95) 90%,
          rgba(13, 13, 15, 1) 100%
        )`,
      }} />

      {/* Gold warmth */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(197, 165, 90, 0.07), transparent 60%)',
      }} />

      {/* Title overlay */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 pb-6 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.8rem] text-sa-cream font-normal tracking-[-0.02em]">
          {cover.title}
        </h1>
        <p className="text-sm text-sa-cream-muted mt-1.5 tracking-wide">
          {cover.subtitle}
        </p>
      </div>
    </div>
  );
}
