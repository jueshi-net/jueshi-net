import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Tag,
  Globe,
} from "lucide-react";
import { notFound } from "next/navigation";
import { TrackedResourceLink } from "@/components/tracked-resource-link";

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_MAP: Record<
  string,
  { name: string; desc: string; icon: string; gradient: string }
> = {
  // 新手资源 7 大分类
  starter: {
    name: "外网新手必装",
    desc: "刚能访问外网必看的基础软件、浏览器、密码管理、翻译工具",
    icon: "🛠️",
    gradient: "from-red-500 via-red-600 to-orange-700",
  },
  "ai-tools": {
    name: "AI 工具合集",
    desc: "ChatGPT、Claude、Gemini、Midjourney 等主流 AI 平台",
    icon: "🤖",
    gradient: "from-violet-500 via-violet-600 to-purple-700",
  },
  "video-learning": {
    name: "视频学习平台",
    desc: "YouTube、Coursera、Khan Academy、edX 在线课程",
    icon: "🎬",
    gradient: "from-pink-500 via-pink-600 to-rose-700",
  },
  "overseas-life": {
    name: "海外生活服务",
    desc: "银行、汇款、购物、社交、生活办事一站整理",
    icon: "🌐",
    gradient: "from-cyan-500 via-cyan-600 to-blue-700",
  },
  "business-tools": {
    name: "出海经营工具",
    desc: "建站、收款、CDN、数据分析，从 0 到 1 出海",
    icon: "💼",
    gradient: "from-amber-500 via-amber-600 to-orange-700",
  },
  security: {
    name: "账号安全隐私",
    desc: "密码管理、两步验证、加密邮箱、隐私保护工具",
    icon: "🔒",
    gradient: "from-slate-500 via-slate-600 to-gray-700",
  },
  "browser-extensions": {
    name: "浏览器插件",
    desc: "翻译、暗色模式、比价、笔记等效率提升扩展",
    icon: "🧩",
    gradient: "from-emerald-500 via-emerald-600 to-teal-700",
  },
  // 原有分类
  life: {
    name: "海外生活资源",
    desc: "政府、银行、医疗、教育、生活服务常用网站与指南",
    icon: "🌍",
    gradient: "from-teal-500 via-teal-600 to-blue-700",
  },
  logistics: {
    name: "跨境寄送资源",
    desc: "承运商查询、集运渠道介绍、敏感货邮寄指南",
    icon: "📦",
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
  },
  business: {
    name: "出海经营资源",
    desc: "跨境平台、收款工具、广告投放、AI工具导航",
    icon: "💼",
    gradient: "from-purple-500 via-purple-600 to-pink-700",
  },
  templates: {
    name: "模板表格资源",
    desc: "报价单、发票、装箱单、箱唛等可编辑模板下载",
    icon: "📄",
    gradient: "from-orange-500 via-orange-600 to-red-700",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug];
  if (!category) {
    return { title: "资源未找到" };
  }
  return {
    title: `${category.name} - 海外百宝箱`,
    description: category.desc,
    openGraph: {
      title: `${category.name} - 海外百宝箱`,
      description: category.desc,
      type: "website",
    },
  };
}

function SourceTypeBadge({ sourceType }: { sourceType: string }) {
  const config = {
    official: {
      label: "官方",
      className: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    "third-party": {
      label: "第三方",
      className: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Globe,
    },
    internal: {
      label: "内部",
      className: "bg-blue-100 text-blue-700 border-blue-200",
      icon: FileText,
    },
  };
  const c = config[sourceType as keyof typeof config] ?? config["third-party"];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.className}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export default async function ResourceCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug];

  if (!category) {
    notFound();
  }

  const resources = await prisma.resource.findMany({
    where: {
      category: slug,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`bg-gradient-to-r ${category.gradient} text-white py-16`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-4xl mb-3">{category.icon}</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {category.name}
          </h1>
          <p className="text-lg text-white/80">{category.desc}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <span>
              共 {resources.length} 个资源
            </span>
            <span className="mx-1">·</span>
            <Link
              href="/resources"
              className="hover:text-white underline underline-offset-2"
            >
              ← 返回资源库
            </Link>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {resources.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              暂无资源，敬请期待
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource) => {
              const isExternal = resource.sourceType !== "internal";
              const href = isExternal
                ? resource.url
                : `/resources/${slug}/${resource.id}`;
              const isTemplate = resource.category === "templates";

              return (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-teal-300 transition-all overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header: name + badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug">
                        {resource.name}
                      </h3>
                      <SourceTypeBadge sourceType={resource.sourceType} />
                    </div>

                    {/* Description */}
                    {resource.description && (
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                        {resource.description}
                      </p>
                    )}

                    {/* Usage hint */}
                    {resource.usage && (
                      <div className="flex items-start gap-2 mb-4 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{resource.usage}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        {resource.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Disclaimer */}
                    {resource.disclaimer && (
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        {resource.disclaimer}
                      </p>
                    )}

                    {/* Action button */}
                    <TrackedResourceLink
                      href={href}
                      isExternal={isExternal}
                      isTemplate={isTemplate}
                      category={slug}
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        isTemplate
                          ? "text-orange-600 hover:text-orange-700"
                          : "text-teal-600 hover:text-teal-700"
                      }`}
                    >
                      {isExternal ? (
                        <>
                          访问网站 <ExternalLink className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          查看详情 <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </TrackedResourceLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disclaimer Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">
                免责声明
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                本站为中立第三方工具平台，所展示的资源均由网络收集或用户提交，仅供学习参考使用。
                本站不对任何第三方网站的内容、服务质量或安全性承担责任。使用外部链接时请自行判断风险。
                如有资源侵犯了您的合法权益，请联系我们处理。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
