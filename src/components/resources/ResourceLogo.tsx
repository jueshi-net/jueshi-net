'use client';

import { useState } from 'react';

interface ResourceLogoProps {
  src: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: { box: 'w-8 h-8 rounded-lg', img: 'w-5 h-5', text: 'text-xs' },
  sm: { box: 'w-10 h-10 rounded-lg', img: 'w-6 h-6', text: 'text-sm' },
  md: { box: 'w-14 h-14 rounded-xl', img: 'w-9 h-9', text: 'text-lg' },
  lg: { box: 'w-20 h-20 rounded-2xl', img: 'w-14 h-14', text: 'text-3xl' },
} as const;

/**
 * Resource logo with graceful fallback to the first-letter initial.
 * Client component because it tracks image-load errors via state.
 */
export function ResourceLogo({ src, name, size = 'md', className = '' }: ResourceLogoProps) {
  const [errored, setErrored] = useState(false);
  const s = sizeMap[size];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`shrink-0 ${s.box} bg-gradient-to-br from-gray-50 to-gray-100 border border-border flex items-center justify-center overflow-hidden ${className}`}
    >
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={`${s.img} object-contain`}
          onError={() => setErrored(true)}
        />
      ) : (
        <span className={`${s.text} font-bold text-gray-400`}>{initial}</span>
      )}
    </div>
  );
}

export default ResourceLogo;
