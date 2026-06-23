import type { TestCase } from "../types";

/**
 * P1 — Postal Code Tool
 *
 * Verifies the postal-code search tool page and its API endpoints on the
 * live site. These are must-pass cases: the postal-code feature is a
 * core public-facing tool.
 */
export const postalCodeTests: TestCase[] = [
  {
    id: "pc-page-loads",
    name: "Postal code tool page loads",
    description:
      "The /tools/postal-code page must return 200 and contain the tool UI.",
    priority: "P1",
    method: "GET",
    path: "/tools/postal-code",
    expectedStatus: [200],
    expectContains: ["postal", "邮编"],
    tags: ["page", "tools"],
  },
  {
    id: "pc-api-empty-query",
    name: "API rejects empty query",
    description:
      "GET /api/postal-codes with no `q` parameter must return a 200 with an error message and empty results (not a 500).",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    expectedStatus: [200],
    expectContains: ["缺少搜索内容"],
    expectJsonFields: ["results", "total", "status"],
    tags: ["api", "validation"],
  },
  {
    id: "pc-api-us-exact",
    name: "US postal code exact match",
    description:
      "Searching for a known US ZIP (10001) scoped to US must return at least one result with exact_postal_match or city_match status.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "10001", country: "US" },
    expectedStatus: [200],
    expectJsonFields: ["results", "total", "status"],
    tags: ["api", "us"],
  },
  {
    id: "pc-api-ca-exact",
    name: "Canadian postal code search",
    description:
      "Searching for a Canadian postal code (V6B) scoped to CA must return results.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "V6B", country: "CA" },
    expectedStatus: [200],
    expectJsonFields: ["results", "total"],
    tags: ["api", "canada"],
  },
  {
    id: "pc-api-gb-exact",
    name: "UK postal code search",
    description:
      "Searching for a UK postcode (SW1A) scoped to GB must return results.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "SW1A", country: "GB" },
    expectedStatus: [200],
    expectJsonFields: ["results", "total"],
    tags: ["api", "uk"],
  },
  {
    id: "pc-api-jp-city",
    name: "Japan city search",
    description:
      "Searching by city name 'Tokyo' scoped to JP must return results (city_match status).",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "Tokyo", country: "JP" },
    expectedStatus: [200],
    expectJsonFields: ["results", "total", "status"],
    tags: ["api", "japan", "city-search"],
  },
  {
    id: "pc-api-no-database-country",
    name: "Country without database returns country_no_database",
    description:
      "Searching with a country that has no postal-code DB (VN) must return status country_no_database, not an error.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "700000", country: "VN" },
    expectedStatus: [200],
    expectContains: ["country_no_database"],
    expectJsonFields: ["results", "total", "status"],
    tags: ["api", "edge-case"],
  },
  {
    id: "pc-api-no-match",
    name: "Nonexistent postal code returns no_match",
    description:
      "A fabricated code that matches no records must return status no_match with zero results.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "ZZZ999", country: "US" },
    expectedStatus: [200],
    expectContains: ["no_match"],
    expectJsonFields: ["results", "total", "status"],
    tags: ["api", "edge-case"],
  },
  {
    id: "pc-api-advanced",
    name: "Advanced postal code search endpoint",
    description:
      "The /api/postal-codes/advanced endpoint must respond 200 for a valid US city query.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes/advanced",
    query: { q: "New York", country: "US" },
    expectedStatus: [200],
    tags: ["api", "advanced"],
  },
  {
    id: "pc-api-no-country-fallback",
    name: "No country fallback to US",
    description:
      "Searching without a country parameter must NOT silently fall back to US data; results should come from all countries.",
    priority: "P1",
    method: "GET",
    path: "/api/postal-codes",
    query: { q: "10001" },
    expectedStatus: [200],
    expectJsonFields: ["results", "total", "status"],
    tags: ["api", "scoping"],
  },
  {
    id: "pc-page-no-misleading-text",
    name: "No misleading global coverage text",
    description:
      "The postal-code page must not claim '全球 50+ 国家' (misleading — only 8 countries have data).",
    priority: "P1",
    method: "GET",
    path: "/tools/postal-code",
    expectedStatus: [200],
    expectNotContains: ["全球 50+ 国家", "全球50+国家"],
    tags: ["page", "content-truth"],
  },
];
