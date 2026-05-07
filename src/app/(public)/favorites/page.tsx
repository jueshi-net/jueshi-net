import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import FavoritesClient from './favorites-client';

export const metadata: Metadata = {
  title: '我的收藏 - 海外百宝箱',
  description: '管理您收藏的网址和工具',
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">请先登录</h1>
          <p className="text-gray-500 mb-6">登录后才能查看和管理您的收藏</p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
            登录 / 注册
          </a>
        </div>
      </div>
    );
  }

  // Get favorite count for user
  const favoriteCount = await prisma.favorite.count({
    where: { userId: (session.user as any).id },
  });

  return <FavoritesClient userId={(session.user as any).id} initialCount={favoriteCount} />;
}

export const dynamic = 'force-dynamic';
