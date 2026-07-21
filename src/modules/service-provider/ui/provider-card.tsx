/**
 * ProviderCard - Unified card for both ORGANIZATION and PROFESSIONAL providers.
 * Changes small display details based on providerType, not entire card structure.
 */
import Link from "next/link";
import type { PublicProviderDTO } from "@/modules/service-provider/public";

const TYPE_LABELS: Record<string, string> = {
  ORGANIZATION: "企业",
  PROFESSIONAL: "专业人员",
  OFFICIAL: "平台官方",
};

const TYPE_COLORS: Record<string, string> = {
  ORGANIZATION: "bg-blue-50 text-blue-700",
  PROFESSIONAL: "bg-purple-50 text-purple-700",
  OFFICIAL: "bg-green-50 text-green-700",
};

export function ProviderCard({ provider }: { provider: PublicProviderDTO }) {
  const detailHref =
    provider.providerType === "PROFESSIONAL"
      ? `/professional/${provider.slug}`
      : `/business/${provider.slug}`;

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md sm:p-5">
      {/* Header: Avatar + Name + Type */}
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-14 sm:w-14">
          {provider.avatarUrl ? (
            <img
              src={provider.avatarUrl}
              alt={provider.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-400">
              {provider.displayName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={detailHref} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 sm:text-base">
              {provider.displayName}
            </h3>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${TYPE_COLORS[provider.providerType] ?? TYPE_COLORS.ORGANIZATION}`}
            >
              {TYPE_LABELS[provider.providerType] ?? "服务商"}
            </span>
            {provider.isVerified && (
              <span className="inline-flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                已认证
              </span>
            )}
            <span className="text-xs text-gray-400">
              {provider.serviceCount > 0 ? `${provider.serviceCount} 项服务` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="mt-2.5 line-clamp-2 text-xs text-gray-500 sm:text-sm">
          {provider.description}
        </p>
      )}

      {/* Locations & Languages */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {provider.countries.slice(0, 3).map((c) => (
          <span key={c} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {c}
          </span>
        ))}
        {provider.cities.slice(0, 2).map((c) => (
          <span key={c} className="rounded bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">
            {c}
          </span>
        ))}
        {provider.languages.slice(0, 2).map((l) => (
          <span key={l} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
            {l}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-3">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 sm:text-sm"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}
