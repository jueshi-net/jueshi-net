'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  resourceUrl: string;
  title: string;
  resourceType?: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ resourceUrl, title, resourceType = 'tool', size = 'sm' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch('/api/user/favorites')
      .then(r => r.ok ? r.json() : [])
      .then(favs => {
        if (Array.isArray(favs) && favs.some((f: any) => f.resourceUrl === resourceUrl)) {
          setIsFavorited(true);
        }
      })
      .catch(() => {});
  }, [mounted, resourceUrl]);

  const toggle = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      if (isFavorited) {
        await fetch('/api/user/favorites?resourceUrl=' + encodeURIComponent(resourceUrl), { method: 'DELETE' });
        setIsFavorited(false);
      } else {
        const res = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceType, resourceUrl, title }),
        });
        if (res.ok) setIsFavorited(true);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  if (!mounted) return null;

  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-h-[32px] ' + (isFavorited ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200')}
      title={isFavorited ? '取消收藏' : '收藏此资源'}
    >
      <Heart className={sz + (isFavorited ? ' fill-red-500' : '')} />
      <span className="hidden sm:inline">{isFavorited ? '已收藏' : '收藏'}</span>
    </button>
  );
}
