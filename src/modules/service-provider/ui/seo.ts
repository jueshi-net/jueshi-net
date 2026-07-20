/**
 * SEO utilities for service-provider pages.
 * Generates metadata, JSON-LD structured data, and canonical URLs.
 * Preview environment: noindex,nofollow always.
 */
import type { Metadata } from "next";
import type {
  PublicProviderDTO,
  PublicServiceDTO,
  PublicCategoryDTO,
} from "@/modules/service-provider/public";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://jueshi.net";
const IS_PREVIEW =
  process.env.NODE_ENV !== "production" ||
  process.env.PREVIEW_MODE === "true";

/** Directory page metadata */
export function directoryMetadata(categories: PublicCategoryDTO[]): Metadata {
  return {
    title: "服务商目录 - 绝世百宝箱",
    description:
      "海外华人、留学生、跨境电商首选服务平台目录。覆盖国际物流、报关清关、外贸服务、跨境电商服务、支付收款、海外生活、留学教育、法律税务、翻译认证等领域。",
    robots: IS_PREVIEW ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: `${BASE_URL}/service-providers` },
    openGraph: {
      title: "服务商目录 - 绝世百宝箱",
      description: "海外华人、留学生、跨境电商首选服务平台目录",
      type: "website",
      url: `${BASE_URL}/service-providers`,
    },
  };
}

/** Business/organization detail metadata */
export function providerMetadata(provider: PublicProviderDTO): Metadata {
  const isOrg = provider.providerType !== "PROFESSIONAL";
  const url = isOrg
    ? `${BASE_URL}/business/${provider.slug}`
    : `${BASE_URL}/professional/${provider.slug}`;

  return {
    title: `${provider.displayName} - 绝世百宝箱服务商`,
    description: provider.description?.slice(0, 160) ?? `${provider.displayName} - 专业服务提供商`,
    robots: IS_PREVIEW || !provider.isVerified
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: provider.displayName,
      description: provider.description?.slice(0, 160) ?? "",
      type: "profile",
      url,
      images: provider.avatarUrl ? [{ url: provider.avatarUrl }] : undefined,
    },
  };
}

/** Service detail metadata */
export function serviceMetadata(service: PublicServiceDTO): Metadata {
  const url = `${BASE_URL}/services/${service.slug}`;
  return {
    title: `${service.title} - ${service.providerDisplayName} | 绝世百宝箱`,
    description: service.summary?.slice(0, 160) ?? `${service.title} - ${service.providerDisplayName}`,
    robots: IS_PREVIEW
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: service.title,
      description: service.summary?.slice(0, 160) ?? "",
      type: "article",
      url,
    },
  };
}

// ─── JSON-LD Structured Data ───

/** BreadcrumbList JSON-LD */
export function breadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

/** ItemList JSON-LD for directory */
export function itemListJsonLd(
  providers: PublicProviderDTO[],
  categories: PublicCategoryDTO[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "服务商目录",
    description: "海外华人、留学生、跨境电商服务平台目录",
    numberOfItems: providers.length,
    itemListElement: providers.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/${p.providerType === "PROFESSIONAL" ? "professional" : "business"}/${p.slug}`,
      name: p.displayName,
    })),
  };
}

/** Organization + LocalBusiness JSON-LD */
export function organizationJsonLd(provider: PublicProviderDTO): object {
  const url = `${BASE_URL}/business/${provider.slug}`;
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": provider.providerType === "OFFICIAL" ? "Organization" : "LocalBusiness",
    name: provider.displayName,
    url,
    description: provider.description ?? undefined,
    image: provider.avatarUrl ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressCountry: provider.countries.join(", ") || undefined,
      addressLocality: provider.cities.join(", ") || undefined,
    },
    knowsLanguage: provider.languages.length > 0 ? provider.languages : undefined,
    areaServed: provider.serviceAreas.length > 0 ? provider.serviceAreas : provider.countries,
  };

  // Only include verified info
  if (provider.isVerified) {
    base.hasCredential = "平台认证服务商";
  }

  // Remove undefined values
  Object.keys(base).forEach((k) => base[k] === undefined && delete base[k]);

  return base;
}

/** Person + ProfessionalService JSON-LD */
export function professionalJsonLd(provider: PublicProviderDTO): object {
  const url = `${BASE_URL}/professional/${provider.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: provider.displayName,
    url,
    description: provider.description ?? undefined,
    image: provider.avatarUrl ?? undefined,
    areaServed: provider.countries.length > 0 ? provider.countries : undefined,
    knowsLanguage: provider.languages.length > 0 ? provider.languages : undefined,
    provider: {
      "@type": "Person",
      name: provider.displayName,
      url,
    },
  };
}

/** Service JSON-LD */
export function serviceJsonLd(service: PublicServiceDTO): object {
  const url = `${BASE_URL}/services/${service.slug}`;
  const providerUrl =
    service.providerType === "PROFESSIONAL"
      ? `${BASE_URL}/professional/${service.providerSlug}`
      : `${BASE_URL}/business/${service.providerSlug}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary ?? service.description ?? undefined,
    url,
    provider: {
      "@type": service.providerType === "PROFESSIONAL" ? "Person" : "Organization",
      name: service.providerDisplayName,
      url: providerUrl,
    },
    serviceType: service.categoryName,
    areaServed: service.serviceCountries.length > 0 ? service.serviceCountries : undefined,
    availableLanguage: service.languages.length > 0 ? service.languages : undefined,
  };

  // Price info - only when real, never show 0
  if (service.priceMode === "FIXED" && service.priceFrom && service.priceFrom > 0) {
    schema.offers = {
      "@type": "Offer",
      price: service.priceFrom,
      priceCurrency: service.currency || "CNY",
    };
  } else if (service.priceMode === "CONTACT" || service.priceMode === "NEGOTIABLE") {
    schema.offers = {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        description: service.priceMode === "CONTACT" ? "联系咨询" : "价格面议",
      },
    };
  }

  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

/** Check if a provider should be in sitemap */
export function shouldProviderBeInSitemap(provider: {
  status: string;
  verificationStatus: string;
}): boolean {
  return provider.status === "approved" && provider.verificationStatus === "verified";
}

/** Check if a service should be in sitemap */
export function shouldServiceBeInSitemap(service: {
  status: string;
}): boolean {
  return service.status === "published";
}
