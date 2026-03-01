import React from 'react';
import { TabType } from '../types';

// Unsplash images — dark, atmospheric, editorial
// Using their image API for optimized delivery + dark/warm tones
const COVERS: Record<string, { url: string; alt: string }> = {
  today: {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=400&fit=crop&crop=center&auto=format&q=80',
    alt: 'Mountain sunrise — a new day of execution',
  },
  installation: {
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1400&h=400&fit=crop&crop=center&auto=format&q=80',
    alt: 'Open books — knowledge installation',
  },
  reviews: {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&h=400&fit=crop&crop=center&auto=format&q=80',
    alt: 'Writing and reflection',
  },
  system: {
    url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1400&h=400&fit=crop&crop=center&auto=format&q=80',
    alt: 'Abstract structure — your operating system',
  },
  settings: {
    url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1400&h=400&fit=crop&crop=center&auto=format&q=80',
    alt: 'Dark sky — configuration',
  },
};

interface TabCoverProps {
  tab: TabType;
}

export function TabCover({ tab }: TabCoverProps) {
  const cover = COVERS[tab];
  if (!cover) return null;

  return (
    <div className="relative w-full h-36 sm:h-44 md:h-48 -mt-12 mb-10 overflow-hidden">
      {/* Image */}
      <img
        src={cover.url}
        alt={cover.alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Dark gradient overlay — fades into the app background */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(
          to bottom,
          rgba(13, 13, 15, 0.3) 0%,
          rgba(13, 13, 15, 0.5) 40%,
          rgba(13, 13, 15, 0.85) 75%,
          rgba(13, 13, 15, 1) 100%
        )`,
      }} />

      {/* Warm gold tint overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(197, 165, 90, 0.08), transparent 60%)',
      }} />

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13, 13, 15, 0.4) 100%)',
      }} />
    </div>
  );
}
