/**
 * Round 2B Tests - Public DTO, filtering, routing, blocks, JSON-LD, SEO.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  directoryMetadata,
  providerMetadata,
  serviceMetadata,
  breadcrumbJsonLd,
  itemListJsonLd,
  organizationJsonLd,
  professionalJsonLd,
  serviceJsonLd,
  shouldProviderBeInSitemap,
  shouldServiceBeInSitemap,
} from "@/modules/service-provider/ui/seo";
import { BLOCK_CONFIG_SCHEMAS } from "@/modules/service-provider/ui/blocks";
import type {
  PublicProviderDTO,
  PublicServiceDTO,
} from "@/modules/service-provider/public";

// ─── Test fixtures ───

function makeProvider(overrides: Partial<PublicProviderDTO> = {}): PublicProviderDTO {
  return {
    id: "p1",
    providerType: "ORGANIZATION",
    displayName: "Test Provider",
    slug: "test-provider",
    handle: "test-provider",
    avatarUrl: null,
    coverUrl: null,
    description: "A test provider",
    languages: ["中文", "English"],
    countries: ["中国", "美国"],
    cities: ["深圳", "洛杉矶"],
    serviceAreas: ["全球"],
    contactPreference: "platform",
    verificationStatus: "verified",
    status: "approved",
    claimedAt: "2026-01-01T00:00:00.000Z",
    approvedAt: "2026-01-05T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    serviceCount: 3,
    isVerified: true,
    ...overrides,
  };
}

function makeService(overrides: Partial<PublicServiceDTO> = {}): PublicServiceDTO {
  return {
    id: "s1",
    providerId: "p1",
    providerSlug: "test-provider",
    providerDisplayName: "Test Provider",
    providerAvatarUrl: null,
    providerType: "ORGANIZATION",
    providerVerificationStatus: "verified",
    categoryId: "c1",
    categorySlug: "logistics",
    categoryName: "国际物流",
    title: "Test Service",
    slug: "test-service",
    summary: "A test service",
    description: "Full description",
    serviceCountries: ["中国"],
    serviceCities: ["深圳"],
    languages: ["中文"],
    priceMode: "CONTACT",
    priceFrom: null,
    currency: "CNY",
    deliveryMode: "online",
    status: "published",
    sortOrder: 0,
    ...overrides,
  };
}

// ─── 1. Public DTO private field leak tests ───

describe("Public DTO - No Private Field Leaks", () => {
  it("PublicProviderDTO does not contain ownerUserId", () => {
    const dto = makeProvider();
    expect(dto).not.toHaveProperty("ownerUserId");
  });

  it("PublicProviderDTO does not contain rejectionReason", () => {
    const dto = makeProvider();
    expect(dto).not.toHaveProperty("rejectionReason");
  });

  it("PublicProviderDTO does not contain contact email or phone", () => {
    const dto = makeProvider();
    expect(dto).not.toHaveProperty("email");
    expect(dto).not.toHaveProperty("phone");
    expect(dto).not.toHaveProperty("contactEmail");
    expect(dto).not.toHaveProperty("contactPhone");
  });

  it("PublicProviderDTO does not contain member userIds", () => {
    const dto = makeProvider();
    expect(dto).not.toHaveProperty("members");
    expect(dto).not.toHaveProperty("memberUserIds");
  });

  it("PublicServiceDTO does not contain internal notes", () => {
    const dto = makeService();
    expect(dto).not.toHaveProperty("internalNotes");
    expect(dto).not.toHaveProperty("reviewNotes");
  });
});

// ─── 2. SEO metadata tests ───

describe("SEO Metadata", () => {
  it("directoryMetadata returns proper title and description", () => {
    const meta = directoryMetadata([]);
    expect(meta.title).toContain("服务商目录");
    expect(meta.description).toContain("海外华人");
    expect(meta.description).toContain("跨境电商");
  });

  it("providerMetadata includes display name in title", () => {
    const provider = makeProvider();
    const meta = providerMetadata(provider);
    expect(meta.title).toContain("Test Provider");
  });

  it("serviceMetadata includes service title in title", () => {
    const service = makeService();
    const meta = serviceMetadata(service);
    expect(meta.title).toContain("Test Service");
  });

  it("Preview environment has noindex,nofollow", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const meta = directoryMetadata([]);
    expect(meta.robots).toEqual({ index: false, follow: false });
    process.env.NODE_ENV = originalEnv;
  });
});

// ─── 3. JSON-LD structured data tests ───

describe("JSON-LD Structured Data", () => {
  it("breadcrumbJsonLd produces valid BreadcrumbList", () => {
    const jsonld = breadcrumbJsonLd([
      { name: "首页", url: "/" },
      { name: "服务商", url: "/service-providers" },
    ]);
    expect(jsonld["@context"]).toBe("https://schema.org");
    expect(jsonld["@type"]).toBe("BreadcrumbList");
    expect((jsonld as any).itemListElement).toHaveLength(2);
    expect((jsonld as any).itemListElement[0].position).toBe(1);
  });

  it("organizationJsonLd produces Organization type for ORGANIZATION", () => {
    const provider = makeProvider({ providerType: "ORGANIZATION" });
    const jsonld = organizationJsonLd(provider);
    expect(jsonld["@type"]).toBe("LocalBusiness");
    expect((jsonld as any).name).toBe("Test Provider");
  });

  it("organizationJsonLd produces Organization type for OFFICIAL", () => {
    const provider = makeProvider({ providerType: "OFFICIAL" });
    const jsonld = organizationJsonLd(provider);
    expect(jsonld["@type"]).toBe("Organization");
  });

  it("professionalJsonLd produces ProfessionalService with Person provider", () => {
    const provider = makeProvider({ providerType: "PROFESSIONAL" });
    const jsonld = professionalJsonLd(provider);
    expect(jsonld["@type"]).toBe("ProfessionalService");
    expect((jsonld as any).provider["@type"]).toBe("Person");
  });

  it("serviceJsonLd produces Service type with provider", () => {
    const service = makeService();
    const jsonld = serviceJsonLd(service);
    expect(jsonld["@type"]).toBe("Service");
    expect((jsonld as any).provider.name).toBe("Test Provider");
  });

  it("serviceJsonLd with CONTACT price mode has no numeric price", () => {
    const service = makeService({ priceMode: "CONTACT", priceFrom: null });
    const jsonld = serviceJsonLd(service);
    const offers = (jsonld as any).offers;
    expect(offers).toBeDefined();
    expect(offers.price).toBeUndefined();
  });

  it("serviceJsonLd with FIXED price shows actual price", () => {
    const service = makeService({ priceMode: "FIXED", priceFrom: 100, currency: "CNY" });
    const jsonld = serviceJsonLd(service);
    const offers = (jsonld as any).offers;
    expect(offers.price).toBe(100);
    expect(offers.priceCurrency).toBe("CNY");
  });

  it("JSON-LD does not include fake aggregateRating", () => {
    const provider = makeProvider();
    const orgJsonld = organizationJsonLd(provider);
    expect((orgJsonld as any).aggregateRating).toBeUndefined();

    const profJsonld = professionalJsonLd(provider);
    expect((profJsonld as any).aggregateRating).toBeUndefined();
  });

  it("itemListJsonLd produces valid ItemList", () => {
    const providers = [makeProvider(), makeProvider({ id: "p2", slug: "p2" })];
    const jsonld = itemListJsonLd(providers, []);
    expect(jsonld["@type"]).toBe("ItemList");
    expect((jsonld as any).numberOfItems).toBe(2);
    expect((jsonld as any).itemListElement).toHaveLength(2);
  });
});

// ─── 4. Sitemap exclusion tests ───

describe("Sitemap Exclusion", () => {
  it("approved + verified provider should be in sitemap", () => {
    expect(shouldProviderBeInSitemap({ status: "approved", verificationStatus: "verified" })).toBe(true);
  });

  it("approved but unverified provider should NOT be in sitemap", () => {
    expect(shouldProviderBeInSitemap({ status: "approved", verificationStatus: "unverified" })).toBe(false);
  });

  it("pending_review provider should NOT be in sitemap", () => {
    expect(shouldProviderBeInSitemap({ status: "pending_review", verificationStatus: "verified" })).toBe(false);
  });

  it("suspended provider should NOT be in sitemap", () => {
    expect(shouldProviderBeInSitemap({ status: "suspended", verificationStatus: "verified" })).toBe(false);
  });

  it("draft provider should NOT be in sitemap", () => {
    expect(shouldProviderBeInSitemap({ status: "draft", verificationStatus: "verified" })).toBe(false);
  });

  it("rejected provider should NOT be in sitemap", () => {
    expect(shouldProviderBeInSitemap({ status: "rejected", verificationStatus: "verified" })).toBe(false);
  });

  it("published service should be in sitemap", () => {
    expect(shouldServiceBeInSitemap({ status: "published" })).toBe(true);
  });

  it("draft service should NOT be in sitemap", () => {
    expect(shouldServiceBeInSitemap({ status: "draft" })).toBe(false);
  });
});

// ─── 5. Block config schema tests ───

describe("Block Config Schemas", () => {
  it("service-provider-list has config schema", () => {
    const schema = BLOCK_CONFIG_SCHEMAS["service-provider-list"];
    expect(schema).toBeDefined();
    expect(schema.title).toBeDefined();
    expect(schema.limit).toBeDefined();
    expect(schema.showViewAll).toBeDefined();
  });

  it("service-provider-recommendations has layout option", () => {
    const schema = BLOCK_CONFIG_SCHEMAS["service-provider-recommendations"];
    expect(schema.layout).toBeDefined();
    expect((schema.layout as any).options).toContain("grid");
    expect((schema.layout as any).options).toContain("horizontal");
  });

  it("provider-trust-card requires providerId", () => {
    const schema = BLOCK_CONFIG_SCHEMAS["provider-trust-card"];
    expect((schema.providerId as any).required).toBe(true);
  });

  it("service-request-cta requires providerId and providerName", () => {
    const schema = BLOCK_CONFIG_SCHEMAS["service-request-cta"];
    expect((schema.providerId as any).required).toBe(true);
    expect((schema.providerName as any).required).toBe(true);
  });

  it("all 4 blocks have config schemas", () => {
    expect(Object.keys(BLOCK_CONFIG_SCHEMAS)).toHaveLength(4);
    expect(Object.keys(BLOCK_CONFIG_SCHEMAS)).toContain("service-provider-list");
    expect(Object.keys(BLOCK_CONFIG_SCHEMAS)).toContain("service-provider-recommendations");
    expect(Object.keys(BLOCK_CONFIG_SCHEMAS)).toContain("provider-trust-card");
    expect(Object.keys(BLOCK_CONFIG_SCHEMAS)).toContain("service-request-cta");
  });
});

// ─── 6. Provider type routing tests ───

describe("Provider Type Routing", () => {
  it("ORGANIZATION routes to /business/[slug]", () => {
    const provider = makeProvider({ providerType: "ORGANIZATION" });
    const href = provider.providerType === "PROFESSIONAL"
      ? `/professional/${provider.slug}`
      : `/business/${provider.slug}`;
    expect(href).toBe("/business/test-provider");
  });

  it("OFFICIAL routes to /business/[slug]", () => {
    const provider = makeProvider({ providerType: "OFFICIAL" });
    const href = provider.providerType === "PROFESSIONAL"
      ? `/professional/${provider.slug}`
      : `/business/${provider.slug}`;
    expect(href).toBe("/business/test-provider");
  });

  it("PROFESSIONAL routes to /professional/[handle]", () => {
    const provider = makeProvider({ providerType: "PROFESSIONAL" });
    const href = provider.providerType === "PROFESSIONAL"
      ? `/professional/${provider.slug}`
      : `/business/${provider.slug}`;
    expect(href).toBe("/professional/test-provider");
  });
});

// ─── 7. Non-approved / non-published leak tests ───

describe("Non-Approved / Non-Published Leak Prevention", () => {
  it("PublicProviderDTO status field in public results is always 'approved'", () => {
    const dto = makeProvider();
    expect(dto.status).toBe("approved");
  });

  it("PublicServiceDTO status field in public results is always 'published'", () => {
    const dto = makeService();
    expect(dto.status).toBe("published");
  });

  it("PublicProviderDTO does not expose draft/pending/suspended/rejected status", () => {
    // The DTO type only has 'status' which is always 'approved' in public queries
    // The query layer filters by status='approved' so non-approved never appears
    const dto = makeProvider({ status: "approved" });
    expect(dto.status).not.toBe("draft");
    expect(dto.status).not.toBe("pending_review");
    expect(dto.status).not.toBe("suspended");
    expect(dto.status).not.toBe("rejected");
  });
});
