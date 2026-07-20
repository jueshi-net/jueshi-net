/**
 * /service-providers - Public service provider directory.
 *
 * Target audience: overseas Chinese, international students,
 * cross-border e-commerce, foreign trade, logistics, customs.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  listPublicProviders,
  listPublicCategories,
  type ProviderFilterParams,
} from "@/modules/service-provider/public";
import { isFeatureEnabled } from "@/platform";
import { ProviderCard } from "@/modules/service-provider/ui/provider-card";
import { directoryMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/modules/service-provider/ui/seo";
import { MobileFilterDrawer } from "@/modules/service-provider/ui/mobile-filter-drawer";
import { SortSelect } from "@/modules/service-provider/ui/sort-select";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) {
    notFound();
  }
  const categories = await listPublicCategories();
  return directoryMetadata(categories);
}

const SORT_OPTIONS = [
  { value: "recommended", label: "推荐" },
  { value: "newest", label: "最新入驻" },
  { value: "verified", label: "已认证优先" },
  { value: "services", label: "服务数量" },
  { value: "name", label: "名称" },
];

const TYPE_OPTIONS = [
  { value: "ORGANIZATION", label: "企业" },
  { value: "PROFESSIONAL", label: "专业人员" },
  { value: "OFFICIAL", label: "平台官方" },
];

const VERIFICATION_OPTIONS = [
  { value: "verified", label: "已认证" },
  { value: "pending", label: "认证中" },
  { value: "unverified", label: "未认证" },
];

export default async function ServiceProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) {
    notFound();
  }

  const params = await searchParams;
  const filters: ProviderFilterParams = {
    q: params.q,
    categoryId: params.categoryId,
    providerType: params.type,
    country: params.country,
    city: params.city,
    language: params.language,
    verificationStatus: params.verification,
    sort: (params.sort as ProviderFilterParams["sort"]) ?? "recommended",
    page: parseInt(params.page ?? "1", 10),
    pageSize: 12,
  };

  const [result, categories] = await Promise.all([
    listPublicProviders(filters),
    listPublicCategories(),
  ]);

  function buildQuery(updates: Record<string, string | undefined>): string {
    const merged = { ...params, ...updates };
    const clean = Object.entries(merged).filter(([, v]) => v && v !== "");
    return "/service-providers?" + clean.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
  }

  const jsonLdBreadcrumbs = breadcrumbJsonLd([
    { name: "首页", url: "/" },
    { name: "服务商", url: "/service-providers" },
  ]);
  const jsonLdItemList = itemListJsonLd(result.items, categories);

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }} />

      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">首页</Link>
            <span>/</span>
            <span className="text-gray-600">服务商</span>
          </nav>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">服务商目录</h1>
          <p className="mt-1 text-sm text-gray-500">
            海外华人 · 留学生 · 跨境电商 · 外贸 · 国际物流 · 报关清关专业服务
          </p>

          {/* Search */}
          <form className="mt-4 flex gap-2" method="GET" action="/service-providers">
            <input
              type="text"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="搜索服务商名称或关键词..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
              搜索
            </button>
          </form>

          {/* Category quick links */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/service-providers"
              className={`rounded-full px-3 py-1 text-xs font-medium ${!params.categoryId ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              全部分类
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/service-providers?categoryId=${cat.id}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${params.categoryId === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat.name}
                {cat.providerCount > 0 && <span className="ml-1 opacity-60">({cat.providerCount})</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Desktop sidebar filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-4 space-y-4 rounded-xl border border-gray-200 bg-white p-4">
              <FilterSection label="服务商类型">
                {TYPE_OPTIONS.map((opt) => (
                  <FilterLink
                    key={opt.value}
                    label={opt.label}
                    active={params.type === opt.value}
                    href={buildQuery({ type: params.type === opt.value ? undefined : opt.value, page: undefined })}
                  />
                ))}
              </FilterSection>
              <FilterSection label="认证状态">
                {VERIFICATION_OPTIONS.map((opt) => (
                  <FilterLink
                    key={opt.value}
                    label={opt.label}
                    active={params.verification === opt.value}
                    href={buildQuery({ verification: params.verification === opt.value ? undefined : opt.value, page: undefined })}
                  />
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            {/* Result count + sort + mobile filter trigger */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                共 <span className="font-semibold text-gray-900">{result.total}</span> 个服务商
              </p>
              <div className="flex items-center gap-2">
                <MobileFilterDrawer params={params} categories={categories} />
                <SortSelect currentSort={filters.sort ?? "recommended"} params={params} />
              </div>
            </div>

            {/* Cards */}
            {result.items.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <p className="text-sm text-gray-400">没有找到符合条件的服务商</p>
                <Link href="/service-providers" className="mt-2 inline-block text-xs text-blue-600 hover:underline">
                  清除筛选条件
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {filters.page && filters.page > 1 && (
                  <Link
                    href={buildQuery({ page: String(filters.page - 1) })}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    上一页
                  </Link>
                )}
                <span className="text-sm text-gray-500">{filters.page} / {result.totalPages}</span>
                {filters.page < result.totalPages && (
                  <Link
                    href={buildQuery({ page: String(filters.page + 1) })}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    下一页
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`block rounded px-2 py-1 text-sm ${active ? "bg-blue-50 font-medium text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
    >
      {label}
    </Link>
  );
}
