/**
 * /professional/[handle] - Professional provider detail page.
 * Only allows providerType=PROFESSIONAL, status=APPROVED.
 * Uses existing User Identity System - does NOT reimplement
 * avatar, level, or badge UI.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublicProviderBySlug,
  getPublicProviderServices,
  getTrustCard,
  getRelatedProviders,
} from "@/modules/service-provider/public";
import { isFeatureEnabled } from "@/platform";
import { ProviderTrustCard } from "@/modules/service-provider/ui/trust-card";
import { ActionButton } from "@/modules/service-provider/ui/action-button";
import { providerMetadata, professionalJsonLd, breadcrumbJsonLd } from "@/modules/service-provider/ui/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) {
    notFound();
  }
  const { handle } = await params;
  const provider = await getPublicProviderBySlug(handle);
  if (!provider) return { title: "未找到 - 绝世百宝箱" };
  return providerMetadata(provider);
}

export default async function ProfessionalDetailPage({ params }: { params: Promise<{ handle: string }> }) {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) notFound();

  const { handle } = await params;
  const provider = await getPublicProviderBySlug(handle);

  if (!provider || provider.providerType !== "PROFESSIONAL") {
    notFound();
  }

  const [services, trust, related] = await Promise.all([
    getPublicProviderServices(provider.id),
    getTrustCard(provider.id),
    getRelatedProviders(provider.id, 4),
  ]);

  const jsonLdProf = professionalJsonLd(provider);
  const jsonLdBreadcrumbs = breadcrumbJsonLd([
    { name: "首页", url: "/" },
    { name: "服务商", url: "/service-providers" },
    { name: provider.displayName, url: `/professional/${provider.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProf) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600">首页</Link>
          <span>/</span>
          <Link href="/service-providers" className="hover:text-gray-600">服务商</Link>
          <span>/</span>
          <span className="text-gray-600">{provider.displayName}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 sm:h-20 sm:w-20">
                  {provider.avatarUrl ? (
                    <img src={provider.avatarUrl} alt={provider.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                      {provider.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{provider.displayName}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">专业人员</span>
                    {provider.isVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        ✓ 专业认证
                      </span>
                    )}
                    {trust && trust.verifications.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {trust.verifications.map(v => v.verificationType).join(" · ")}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {provider.countries.map((c) => (
                      <span key={c} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{c}</span>
                    ))}
                    {provider.cities.map((c) => (
                      <span key={c} className="rounded bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">{c}</span>
                    ))}
                    {provider.languages.map((l) => (
                      <span key={l} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {provider.description && (
                <p className="mt-4 text-sm leading-relaxed text-gray-600">{provider.description}</p>
              )}

              {/* Note: community level ≠ professional verification */}
              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-400">
                  专业资质认证与社区等级系统相互独立。社区等级反映用户在社区的活跃度，专业认证反映专业服务能力。
                </p>
              </div>

              {/* CTA */}
              <div className="mt-4 flex gap-2">
                <ActionButton
                  action="service.request"
                  context={{ providerId: provider.id, providerSlug: provider.slug, providerName: provider.displayName, sourceType: "professional_detail", sourceId: provider.slug }}
                  label="联系咨询"
                  variant="primary"
                />
                <ActionButton
                  action="provider.favorite"
                  context={{ providerId: provider.id }}
                  label="收藏"
                  variant="secondary"
                />
                <ActionButton
                  action="provider.report"
                  context={{ providerId: provider.id, providerName: provider.displayName }}
                  label="举报"
                  variant="ghost"
                />
              </div>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-base font-semibold text-gray-900">服务项目 ({services.length})</h2>
                <div className="space-y-3">
                  {services.map((s) => (
                    <Link key={s.id} href={`/services/${s.slug}`} className="block rounded-lg border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50/30">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-gray-900">{s.title}</h3>
                          {s.summary && <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{s.summary}</p>}
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="rounded bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">{s.categoryName}</span>
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                              {s.priceMode === "CONTACT" ? "联系咨询" : s.priceMode === "NEGOTIABLE" ? "价格面议" : s.priceFrom ? `¥${s.priceFrom}起` : "咨询"}
                            </span>
                          </div>
                        </div>
                        <ActionButton
                          action="service.request"
                          context={{ providerId: provider.id, providerSlug: provider.slug, serviceId: s.id, serviceSlug: s.slug, providerName: provider.displayName, serviceName: s.title, sourceType: "professional_detail_service", sourceId: s.slug }}
                          label="咨询"
                          variant="secondary"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-base font-semibold text-gray-900">相关服务商</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={r.providerType === "PROFESSIONAL" ? `/professional/${r.slug}` : `/business/${r.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        {r.avatarUrl && <img src={r.avatarUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{r.displayName}</p>
                        <p className="text-xs text-gray-400">{r.countries.slice(0, 2).join(" · ")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              {trust && <ProviderTrustCard trust={trust} />}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
