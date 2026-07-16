import React from 'react';
import { notFound } from 'next/navigation';
import { getLightAppBySlug, getPublishedLightApps } from '@/config/official-light-apps';
import OfficialLightAppFrame from '@/components/light-apps/OfficialLightAppFrame';
import OfficialLightAppCard from '@/components/light-apps/OfficialLightAppCard';
import ToolLandingPageShell from '@/components/tools/ToolLandingPageShell';
import '@/styles/official-light-apps.css';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * 官方轻应用详情页面
 * 路由：/tools/apps/[slug]
 * 
 * 使用 ToolLandingPageShell 统一页面结构，复用 UI V4 设计系统组件
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
    <ToolLandingPageShell
      title={app.name}
      subtitle={app.shortDescription}
      isOfficialLightApp={true}
      privacyNotice={app.privacyNote}
      usageTips={
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>所有数据仅在您的浏览器中处理，不会上传到服务器</li>
          <li>请及时打印或下载您生成的单据</li>
          <li>刷新页面后数据将丢失，请提前保存</li>
        </ul>
      }
      relatedTools={
        otherApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherApps.map(otherApp => (
              <OfficialLightAppCard key={otherApp.slug} app={otherApp} />
            ))}
          </div>
        ) : null
      }
    >
      <OfficialLightAppFrame app={app} />
    </ToolLandingPageShell>
  );
}

// 生成静态路径
export async function generateStaticParams() {
  const apps = getPublishedLightApps();
  return apps.map(app => ({
    slug: app.slug,
  }));
}

// 未知 slug 直接返回 404，不动态渲染
export const dynamicParams = false;

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
