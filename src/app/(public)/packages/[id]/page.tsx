import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Home,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Star,
  Shield,
  Zap,
  MapPin,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Store,
  ExternalLink,
  BookOpen,
  FileText,
  CreditCard,
  Truck,
  ShieldAlert,
} from "lucide-react";
import { cardStyles, badgeStyles, buttonVariants } from "@/lib/ui-styles";
import { scenarioPackages, type ScenarioPackage } from "@/data/scenario-packages";
import { softwareApplicationJsonLd, buildCanonical } from "@/lib/seo";

// Icon map
const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Store,
  ExternalLink,
  BookOpen,
  FileText,
  CreditCard,
  Truck,
  ShieldAlert,
  Zap,
};

const SOP_ICON_MAP: Record<string, React.ElementType> = {
  ShieldAlert,
  FileText,
  Zap,
  BookOpen,
  Shield,
};

function findPackage(id: string): ScenarioPackage | undefined {
  return scenarioPackages.find((p) => p.id === id);
}

export function generateStaticParams() {
  return scenarioPackages.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pkg = findPackage(id);
  if (!pkg) return { title: "场景包不存在" };
  return {
    title: `${pkg.title} — 海外百宝箱`,
    description: pkg.description,
    alternates: { canonical: `https://jueshi.net/packages/${pkg.id}` },
    openGraph: {
      title: pkg.title,
      description: pkg.description,
      type: "article",
    },
  };
}

export default async function ScenarioPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = findPackage(id);
  if (!pkg) notFound();

  const Icon = ICON_MAP[pkg.icon] || Star;
  const jsonLd = softwareApplicationJsonLd({
    name: pkg.title,
    description: pkg.description,
    url: buildCanonical(`/packages/${pkg.id}`),
    category: 'UtilityApplication',
  });

  // Placeholder tools for each scenario (will be populated with real tool data later)
  const placeholderTools = Array.from({ length: pkg.toolCount }, (_, i) => ({
    name: `工具 ${i + 1}`,
    desc: "此场景下的内置工具，待填充真实数据",
    icon: Zap,
    href: "/tools",
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-6 min-h-[44px]">
            <Link
              href="/"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              href="/#scenarios"
              className="hover:text-white transition-colors"
            >
              场景解决方案
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium truncate">{pkg.title}</span>
          </nav>

          {/* Title */}
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                📦 {pkg.toolCount} 个内置工具
              </span>
              {pkg.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              {pkg.title}
            </h1>
            <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed">
              {pkg.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* Built-in tools */}
        <div className={cardStyles.base}>
          <h2 className={cardStyles.header}>内置工具</h2>
          <p className="text-sm text-gray-500 mb-4">
            该场景包包含以下工具和服务，点击即可使用：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {placeholderTools.map((tool, i) => {
              const ToolIcon = tool.icon;
              return (
                <Link
                  key={i}
                  href={tool.href}
                  className="group block bg-gray-50 rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <ToolIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* SOP guide */}
        {pkg.sopGuides && pkg.sopGuides.length > 0 ? (
          <div className={`${cardStyles.base} mt-5`}>
            <h2 className={cardStyles.header}>
              <BookOpen className="w-5 h-5 text-emerald-600" />
              实用指南
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              「{pkg.title}」相关的 SOP 操作流程和最佳实践：
            </p>
            <div className="space-y-3">
              {pkg.sopGuides.map((guide, i) => {
                const GuideIcon = SOP_ICON_MAP[guide.icon] || BookOpen;
                return (
                  <div
                    key={i}
                    className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                      <GuideIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-snug">
                        {guide.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`${cardStyles.base} mt-5`}>
            <h2 className={cardStyles.header}>SOP 指南</h2>
            <p className="text-sm text-gray-500">
              该场景的标准操作流程和最佳实践指南将在后续版本中逐步完善。
            </p>
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-blue-800">
                    即将上线
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    我们会为每个场景包配置专属的 SOP 指南，包括步骤说明、注意事项和常见问题。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* External links */}
        {pkg.externalLinks && pkg.externalLinks.length > 0 ? (
          <div className={`${cardStyles.base} mt-5`}>
            <h2 className={cardStyles.header}>
              <ExternalLink className="w-5 h-5 text-blue-600" />
              精选外链
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              与「{pkg.title}」相关的外部优质资源：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.externalLinks.map((link, i) => {
                const LinkIcon = ICON_MAP[link.icon] || ExternalLink;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <LinkIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                        {link.title}
                        <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-snug">
                        {link.description}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`${cardStyles.base} mt-5`}>
            <h2 className={cardStyles.header}>精选外链</h2>
            <p className="text-sm text-gray-500 mb-4">
              与「{pkg.title}」相关的外部优质资源：
            </p>
            <div className="text-sm text-gray-400 italic">
              外链资源将在后续版本中添加。
            </div>
          </div>
        )}

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 ${buttonVariants.secondary}`}
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
