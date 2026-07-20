/**
 * Public DTO types for service-provider module.
 *
 * These are the ONLY shapes that may leave the module boundary.
 * Private fields (ownerUserId, member userIds, contact info,
 * rejectionReason, internal notes) are NEVER included.
 */

/** Public provider view - safe for display on public pages. */
export interface PublicProviderDTO {
  id: string;
  providerType: "ORGANIZATION" | "PROFESSIONAL" | "OFFICIAL";
  displayName: string;
  slug: string;
  handle?: string;        // alias of slug for professional pages
  avatarUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  languages: string[];
  countries: string[];
  cities: string[];
  serviceAreas: string[];
  contactPreference: string;
  verificationStatus: string;
  status: string;          // always "approved" in public results
  claimedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  /** Public stats - computed, not stored as mutable counter */
  serviceCount: number;
  isVerified: boolean;
}

/** Public service view - safe for display. */
export interface PublicServiceDTO {
  id: string;
  providerId: string;
  providerSlug: string;
  providerDisplayName: string;
  providerAvatarUrl: string | null;
  providerType: string;
  providerVerificationStatus: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  serviceCountries: string[];
  serviceCities: string[];
  languages: string[];
  priceMode: "CONTACT" | "FIXED" | "NEGOTIABLE" | "RANGE";
  priceFrom: number | null;
  currency: string;
  deliveryMode: string;
  status: string;          // always "published"
  sortOrder: number;
}

/** Public category view. */
export interface PublicCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  providerCount: number;
}

/** Public verification view - only public-facing info. */
export interface PublicVerificationDTO {
  id: string;
  verificationType: string;
  status: string;
  verifiedAt: string | null;
  // NO internal notes, NO document URLs
}

/** Filter parameters for directory queries. */
export interface ProviderFilterParams {
  q?: string;                          // keyword search
  categoryId?: string;
  providerType?: string;
  country?: string;
  city?: string;
  language?: string;
  deliveryMode?: string;
  priceMode?: string;
  verificationStatus?: string;
  sort?: "recommended" | "newest" | "verified" | "services" | "name";
  page?: number;
  pageSize?: number;
}

/** Result wrapper for paginated queries. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Trust card data - public-safe trust indicators. */
export interface TrustCardDTO {
  providerId: string;
  providerSlug: string;
  displayName: string;
  verificationStatus: string;
  verifications: PublicVerificationDTO[];
  isVerified: boolean;
  serviceCount: number;
  claimedAt: string | null;
  approvedAt: string | null;
  // NO rating, NO review count (ProviderReview deferred)
}
