import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Eye, Clock, ArrowLeft, Share2, Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TrackedArticleToolLink } from "@/components/tracked-article-tool-link";
import { AdSlot } from "@/components/ad-slot";

const TOOL_MAP: Record<string, { name: string; route: string; icon: string; desc: string }> = {
  "tracking": { name: "运单号整理工具", route: "/tracking", icon: "📦", desc: "批量整理运单号，自动识别承运商" },
  "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋", desc: "100个常用商品HS编码参考" },
  "sensitive-goods": { name: "敏感物品参考", route: "/tools/sensitive-goods", icon: "⚠️", desc: "特殊物品寄送参考和合规话术" },
  "postal-code": { name: "邮编格式校验", route: "/tools/postal-code", icon: "📮", desc: "5国邮编格式验证" },
  "address-formatter": { name: "地址格式化", route: "/tools/address-formatter", icon: "📝", desc: "5国地址格式一键生成" },
  "invoice": { name: "发票生成器", route: "/tools/invoice", icon: "📄", desc: "在线生成商业发票和装箱单" },
  "quote": { name: "报价单生成器", route: "/tools/quote", icon: "💰", desc: "外贸报价单模板" },
  "calculator": { name: "计算器", route: "/tools/shipping-calculator", icon: "🔢", desc: "在线计算工具" },
  "customs-generator": { name: "报关单生成", route: "/tools/customs-generator", icon: "📦", desc: "报关单据生成工具" },
};

function getRelatedTools(relatedTools: unknown): Array<{ name: string; route: string; icon: string; desc: string }> {
  if (!relatedTools) return [];
  const slugs: string[] = typeof relatedTools === "string" ? JSON.parse(relatedTools) : (Array.isArray(relatedTools) ? relatedTools : []);
  return slugs.map((slug) => TOOL_MAP[slug]).filter(Boolean);
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return { title: "文章未找到" };
  
  return {
    title: `${article.title} | 海外百宝箱`,
    description: article.excerpt || article.content.slice(0, 150),
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author ? ["海外百宝箱"] : [],
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || "",
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article: Awaited<ReturnType<typeof prisma.article.findUnique>>;
  try {
    article = await prisma.article.findUnique({ where: { slug } });
  } catch {
    notFound();
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> 返回指南列表
      </Link>

      <article className="bg-white rounded-xl border p-8">
        <header className="mb-8">
          {article.coverImage && (
            <div className="w-full h-64 bg-gray-100 rounded-lg mb-6 overflow-hidden">
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("zh-CN") : new Date(article.createdAt).toLocaleDateString("zh-CN")}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.views} 阅读</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 约{Math.max(1, Math.ceil(article.content.length / 500))}分钟阅读</span>
          </div>
          {article.author && <p className="text-sm text-gray-500 mt-2">作者：{article.author}</p>}
        </header>

        <AdSlot placement="article-top" className="mb-8" />

        <div className="prose prose-gray max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: article.content }} />

        <AdSlot placement="article-bottom" className="mt-8 mb-8" />

        {getRelatedTools(article.relatedTools).length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5" /> 🔧 相关工具
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRelatedTools(article.relatedTools).map((tool) => (
                <TrackedArticleToolLink
                  key={tool.route}
                  href={tool.route}
                  toolName={tool.name}
                >
                  <div className="group flex flex-col gap-3 p-5 rounded-lg border bg-gray-50 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
                    </div>
                    <div className="mt-auto pt-2 flex items-center gap-1 text-sm text-blue-600 font-medium">
                      使用工具 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </TrackedArticleToolLink>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 pt-6 border-t flex items-center justify-between">
          <Link href="/guides" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> 返回指南列表
          </Link>
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm">
            <Share2 className="w-4 h-4" /> 分享
          </button>
        </footer>
      </article>
    </div>
  );
}

export const dynamic = 'force-dynamic';
