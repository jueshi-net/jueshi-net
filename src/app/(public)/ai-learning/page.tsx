'use client';

import Link from 'next/link';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import {
  Brain,
  PenTool,
  Image,
  Video,
  Code,
  Workflow,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Database,
  Construction,
} from 'lucide-react';

interface ToolLink {
  name: string;
  href: string;
  external?: boolean;
}

interface CategoryCard {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  links: ToolLink[];
}

const categories: CategoryCard[] = [
  {
    title: 'AI 入门工具',
    icon: Sparkles,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    links: [
      { name: 'ChatGPT', href: 'https://chatgpt.com', external: true },
      { name: 'Claude', href: 'https://claude.ai', external: true },
      { name: 'Gemini', href: 'https://gemini.google.com', external: true },
      { name: 'Perplexity', href: 'https://www.perplexity.ai', external: true },
    ],
  },
  {
    title: 'AI 写作',
    icon: PenTool,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    links: [
      { name: 'ChatGPT', href: 'https://chatgpt.com', external: true },
      { name: 'Claude', href: 'https://claude.ai', external: true },
      { name: 'Jasper', href: 'https://www.jasper.ai', external: true },
    ],
  },
  {
    title: 'AI 图片',
    icon: Image,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    links: [
      { name: 'Midjourney', href: 'https://www.midjourney.com', external: true },
      { name: 'DALL-E', href: 'https://openai.com/dall-e', external: true },
      { name: 'Stable Diffusion', href: 'https://stability.ai', external: true },
    ],
  },
  {
    title: 'AI 视频',
    icon: Video,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    links: [
      { name: 'Runway', href: 'https://runwayml.com', external: true },
      { name: 'Pika', href: 'https://www.pika.art', external: true },
      { name: 'Sora', href: '#' },
    ],
  },
  {
    title: 'AI 编程',
    icon: Code,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    links: [
      { name: 'Cursor', href: 'https://www.cursor.com', external: true },
      { name: 'GitHub Copilot', href: 'https://github.com/features/copilot', external: true },
      { name: 'Devin', href: '#' },
    ],
  },
  {
    title: 'AI 自动化',
    icon: Workflow,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    links: [
      { name: 'Zapier', href: 'https://zapier.com', external: true },
      { name: 'Make', href: 'https://www.make.com', external: true },
      { name: 'n8n', href: 'https://n8n.io', external: true },
    ],
  },
];

function ToolLinkItem({ link }: { link: ToolLink }) {
  const isExternal = link.external ?? false;
  const isPlaceholder = link.href === '#';

  if (isPlaceholder) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed">
        {link.name}
        <span className="text-xs">(即将上线)</span>
      </span>
    );
  }

  if (isExternal) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {link.name}
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {link.name}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function ComingSoonCard({
  icon: Icon,
  title,
  description,
  color,
  bg,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <Construction className="w-4 h-4" />
        <span>敬请期待</span>
      </div>
    </div>
  );
}

export default function AILearningPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">我要学习 AI</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto">
            AI工具、教程、资料库、实用导航
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{cat.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.links.map((link) => (
                    <ToolLinkItem key={link.name + link.href} link={link} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Sections */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          更多内容
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <ComingSoonCard
            icon={BookOpen}
            title="本站原创教程"
            description="我们团队正在编写 AI 实用教程，涵盖入门到进阶的完整学习路径。"
            color="text-violet-600 dark:text-violet-400"
            bg="bg-violet-100 dark:bg-violet-900/30"
          />
          <ComingSoonCard
            icon={Brain}
            title="本地博客入口"
            description="聚合本地开发者、创业者分享的 AI 实战经验和心得体会。"
            color="text-pink-600 dark:text-pink-400"
            bg="bg-pink-100 dark:bg-pink-900/30"
          />
          <ComingSoonCard
            icon={Database}
            title="资料库 / 公开资源整理"
            description="精选免费的 AI 学习资源、数据集、论文和开源项目合集。"
            color="text-teal-600 dark:text-teal-400"
            bg="bg-teal-100 dark:bg-teal-900/30"
          />
        </div>

        {/* Ad Slot */}
        <AdSlot placement="tool-bottom" variant="card" className="mb-8" />

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <strong>免责声明：</strong>本站收录的 AI 工具和资源仅供信息参考，不构成任何推荐或担保。
            所有外部链接均指向第三方网站，本站不对其内容、安全性、可用性或合规性负责。
            AI 工具发展迅速，功能和服务可能随时变更，请以官方网站信息为准。
          </div>
        </div>
      </div>
    </div>
  );
}
