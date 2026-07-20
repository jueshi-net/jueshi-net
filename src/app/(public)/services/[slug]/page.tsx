/**
 * /services/[slug] - Service detail page.
 * Only allows status=PUBLISHED and provider status=APPROVED.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublicServiceBySlug,
  getPublicProviderServices,
} from "@/modules/service-provider/public";
import { isFeatureEnabled } from "@/platform";
import { ActionButton } from "@/modules/service-provider/ui/action-button";
import { serviceMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/modules/service-provider/ui/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getPublicServiceBySlug(slug);
  if (!service) return { title: "未找到 - 绝世百宝箱" };
  return serviceMetadata(service);
}

const PRICE_MODE_LABELS: Record<string, string> = {
  CONTACT: "联系咨询",
  FIXED: "固定价格",
  NEGOTIABLE: "价格面议",
  RANGE: "价格区间",
};

const DELIVERY_LABELS: Record<string, string> = {
  online: "在线交付",
  offline: "线下交付",
  hybrid: "线上线下结合",
  remote: "远程交付",
  physical: "实体交付",
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isFeatureEnabled("FEATURE_SERVICE_PROVIDER")) notFound();

  const { slug } = await params;
  const service = await getPublicServiceBySlug(slug);

  if (!service) notFound();

  // Get more services from same provider for "related services"
  const relatedServices = (await getPublicProviderServices(service.providerId))
    .filter((s) => s.id !== service.id)
    .slice(0, 4);

  const jsonLdService = serviceJsonLd(service);
  const jsonLdBreadcrumbs = breadcrumbJsonLd([
    { name: "首页", url: "/" },
    { name: "服务商", url: "/service-providers" },
    { name: service.providerDisplayName, url: `/${service.providerType === "PROFESSIONAL" ? "professional" : "business"}/${service.providerSlug}` },
    { name: service.title, url: `/services/${service.slug}` },
  ]);

  const providerHref = service.providerType === "PROFESSIONAL"
    ? `/professional/${service.providerSlug}`
    : `/business/${service.providerSlug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600">首页</Link>
          <span>/</span>
          <Link href="/service-providers" className="hover:text-gray-600">服务商</Link>
          <span>/</span>
          <Link href={providerHref} className="hover:text-gray-600">{service.providerDisplayName}</Link>
          <span>/</span>
          <span className="text-gray-600">{service.title}</span>
        </nav>

        {/* Main card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{service.categoryName}</span>
          </div>
          <h1 className="mt-2 text-lg font-bold text-gray-900 sm:text-xl">{service.title}</h1>
          {service.summary && <p className="mt-2 text-sm text-gray-500">{service.summary}</p>}

          {/* Provider */}
          <Link href={providerHref} className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
            <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-200">
              {service.providerAvatarUrl && <img src={service.providerAvatarUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{service.providerDisplayName}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{service.providerType === "PROFESSIONAL" ? "专业人员" : "企业"}</span>
                {service.providerVerificationStatus === "verified" && (
                  <span className="text-xs text-green-600">✓ 已认证</span>
                )}
              </div>
            </div>
          </Link>

          {/* Description */}
          {service.description && (
            <div className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">服务说明</h2>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{service.description}</p>
            </div>
          )}

          {/* Service details grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-medium text-gray-400">交付方式</p>
              <p className="text-sm text-gray-700">{DELIVERY_LABELS[service.deliveryMode] ?? service.deliveryMode}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">价格模式</p>
              <p className="text-sm text-gray-700">
                {PRICE_MODE_LABELS[service.priceMode] ?? service.priceMode}
                {service.priceMode === "FIXED" && service.priceFrom && service.priceFrom > 0
                  ? ` · ¥${service.priceFrom} ${service.currency}`
                  : ""}
              </p>
            </div>
            {service.serviceCountries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400">服务国家</p>
                <p className="text-sm text-gray-700">{service.serviceCountries.join(" · ")}</p>
              </div>
            )}
            {service.serviceCities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400">服务城市</p>
                <p className="text-sm text-gray-700">{service.serviceCities.join(" · ")}</p>
              </div>
            )}
            {service.languages.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400">服务语言</p>
                <p className="text-sm text-gray-700">{service.languages.join(" · ")}</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-5 flex gap-2">
            <ActionButton
              action="service.request"
              context={{
                providerId: service.providerId,
                providerSlug: service.providerSlug,
                serviceId: service.id,
                serviceSlug: service.slug,
                providerName: service.providerDisplayName,
                serviceName: service.title,
                sourceType: "service_detail",
                sourceId: service.slug,
              }}
              label="立即咨询"
              variant="primary"
            />
            <Link
              href={providerHref}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              查看服务商
            </Link>
          </div>
        </div>

        {/* Related services */}
        {relatedServices.length > 0 && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-base font-semibold text-gray-900">该服务商的其他服务</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {relatedServices.map((s) => (
                <Link key={s.id} href={`/services/${s.slug}`} className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                  <h3 className="truncate text-sm font-medium text-gray-900">{s.title}</h3>
                  {s.summary && <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{s.summary}</p>}
                  <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                    {s.priceMode === "CONTACT" ? "联系咨询" : s.priceMode === "NEGOTIABLE" ? "价格面议" : "查看"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
