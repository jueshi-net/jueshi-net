/**
 * Block components for service-provider module.
 * All registered through Block Registry, support Feature Flag,
 * and have loading/empty/error states.
 */
import Link from "next/link";
import { ProviderCard } from "./provider-card";
import { ActionButton } from "./action-button";
import { ProviderTrustCard } from "./trust-card";
import type {
  PublicProviderDTO,
  PublicServiceDTO,
  TrustCardDTO,
} from "@/modules/service-provider/public";

// ─── 1. service-provider-list ───

interface ListBlockProps {
  providers: PublicProviderDTO[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
}

export function ServiceProviderListBlock({
  providers,
  loading,
  error,
  title = "服务商",
  showViewAll = true,
}: ListBlockProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        加载失败：{error}
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-400">暂无服务商</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {showViewAll && (
          <Link href="/service-providers" className="text-xs text-blue-600 hover:underline">
            查看全部 →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </div>
    </div>
  );
}

// ─── 2. service-provider-recommendations ───

interface RecommendationsBlockProps {
  providers: PublicProviderDTO[];
  loading?: boolean;
  title?: string;
  layout?: "grid" | "horizontal";
}

export function ServiceProviderRecommendationsBlock({
  providers,
  loading,
  title = "推荐服务商",
  layout = "grid",
}: RecommendationsBlockProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!providers || providers.length === 0) return null;

  if (layout === "horizontal") {
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {providers.map((p) => (
            <Link
              key={p.id}
              href={p.providerType === "PROFESSIONAL" ? `/professional/${p.slug}` : `/business/${p.slug}`}
              className="flex min-w-[200px] flex-col rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                  {p.avatarUrl && <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <span className="truncate text-sm font-medium text-gray-900">{p.displayName}</span>
              </div>
              {p.countries.length > 0 && (
                <span className="mt-1 text-xs text-gray-400">{p.countries.slice(0, 2).join(" · ")}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return <ServiceProviderListBlock providers={providers} title={title} showViewAll={false} />;
}

// ─── 3. provider-trust-card ───

interface TrustBlockProps {
  trust: TrustCardDTO | null;
  loading?: boolean;
}

export function ProviderTrustCardBlock({ trust, loading }: TrustBlockProps) {
  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  }
  if (!trust) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-400">
        信任信息不可用
      </div>
    );
  }
  return <ProviderTrustCard trust={trust} />;
}

// ─── 4. service-request-cta ───

interface CtaBlockProps {
  providerId: string;
  providerSlug: string;
  providerName: string;
  serviceId?: string;
  serviceSlug?: string;
  serviceName?: string;
  sourceType?: string;
  sourceId?: string;
}

export function ServiceRequestCtaBlock({
  providerId,
  providerSlug,
  providerName,
  serviceId,
  serviceSlug,
  serviceName,
  sourceType,
  sourceId,
}: CtaBlockProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            {serviceName ? `咨询：${serviceName}` : `联系 ${providerName}`}
          </h4>
          <p className="mt-0.5 text-xs text-gray-500">
            通过平台安全咨询，保护您的隐私
          </p>
        </div>
        <ActionButton
          action="service.request"
          context={{
            providerId,
            providerSlug,
            serviceId,
            serviceSlug,
            providerName,
            serviceName,
            sourceType: sourceType ?? "block",
            sourceId: sourceId ?? providerSlug,
          }}
          label="立即咨询"
          variant="primary"
        />
      </div>
    </div>
  );
}

// ─── Block config schemas ───

export const BLOCK_CONFIG_SCHEMAS = {
  "service-provider-list": {
    title: { type: "string", default: "服务商" },
    limit: { type: "number", default: 12 },
    showViewAll: { type: "boolean", default: true },
  },
  "service-provider-recommendations": {
    title: { type: "string", default: "推荐服务商" },
    limit: { type: "number", default: 6 },
    layout: { type: "string", default: "grid", options: ["grid", "horizontal"] },
  },
  "provider-trust-card": {
    providerId: { type: "string", required: true },
  },
  "service-request-cta": {
    providerId: { type: "string", required: true },
    providerName: { type: "string", required: true },
    serviceId: { type: "string" },
    serviceName: { type: "string" },
  },
} as const;
