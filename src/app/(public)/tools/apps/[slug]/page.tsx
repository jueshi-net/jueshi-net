import React from 'react';
import { notFound } from 'next/navigation';
import { getLightAppBySlug, getPublishedLightApps } from '@/config/official-light-apps';
import OfficialLightAppFrame from '@/components/light-apps/OfficialLightAppFrame';
import OfficialLightAppCard from '@/components/light-apps/OfficialLightAppCard';
import Link from 'next/link';
import '@/styles/official-light-apps.css';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * 官方轻应用详情页面
 * 路由：/tools/apps/[slug]
 */
export default async function LightAppPage({ params }: Props) {
  const { slug } = await params;
  const app = getLightAppBySlug(slug);

  // 如果应用不存在或未发布，返回 404
  if (!app || app.status !== 'published') {
    notFound();
  }

  // 获取其他推荐应用
  const otherApps = getPublishedLightApps().filter(a => a.slug !== slug).slice(0, 2);

  return (
    <div className="light-app-page">
      {/* 返回工具中心 */}
      <div className="back-link">
        <Link href="/tools">
          <i className="fas fa-arrow-left"></i>
          <span>返回工具中心</span>
        </Link>
      </div>

      {/* 主内容区 */}
      <div className="app-main-content">
        <OfficialLightAppFrame app={app} />
      </div>

      {/* 相关推荐 */}
      {otherApps.length > 0 && (
        <div className="related-apps">
          <h2>相关推荐</h2>
          <div className="related-apps-grid">
            {otherApps.map(otherApp => (
              <OfficialLightAppCard key={otherApp.slug} app={otherApp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 生成静态路径
export async function generateStaticParams() {
  const apps = getPublishedLightApps();
  return apps.map(app => ({
    slug: app.slug,
  }));
}

// 生成元数据
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const app = getLightAppBySlug(slug);
  if (!app) {
    return {
      title: '应用未找到 - 绝世百宝箱',
    };
  }
  return {
    title: `${app.name} - 绝世百宝箱`,
    description: app.shortDescription,
  };
}
