import type { TestCase } from "../types";

/**
 * P3 — SEO Audit
 *
 * Verifies sitemap availability, robots.txt rules, canonical URLs,
 * meta tags, and OpenGraph data on key public pages.
 */
export const seoTests: TestCase[] = [
  {
    id: "sitemap-xml-loads",
    name: "sitemap.xml is accessible",
    description:
      "GET /sitemap.xml must return 200 with XML content containing URLs.",
    priority: "P3",
    method: "GET",
    path: "/sitemap.xml",
    expectedStatus: [200],
    expectContains: ["<urlset", "jueshi.net"],
    expectHeaders: { "Content-Type": "xml" },
    tags: ["seo", "sitemap"],
  },
  {
    id: "sitemap-has-destinations",
    name: "Sitemap includes destination pages",
    description:
      "sitemap.xml must contain /destinations entries for indexable countries.",
    priority: "P3",
    method: "GET",
    path: "/sitemap.xml",
    expectedStatus: [200],
    expectContains: ["/destinations/canada", "/destinations/australia"],
    tags: ["seo", "sitemap", "destinations"],
  },
  {
    id: "sitemap-has-tools",
    name: "Sitemap includes tool pages",
    description:
      "sitemap.xml must contain /tools/ entries for key tools.",
    priority: "P3",
    method: "GET",
    path: "/sitemap.xml",
    expectedStatus: [200],
    expectContains: ["/tools/postal-code", "/tools/hs-code"],
    tags: ["seo", "sitemap", "tools"],
  },
  {
    id: "sitemap-has-bbs",
    name: "Sitemap includes BBS entries",
    description:
      "sitemap.xml must contain /bbs entry.",
    priority: "P3",
    method: "GET",
    path: "/sitemap.xml",
    expectedStatus: [200],
    expectContains: ["/bbs"],
    tags: ["seo", "sitemap", "bbs"],
  },
  {
    id: "robots-txt-loads",
    name: "robots.txt is accessible",
    description:
      "GET /robots.txt must return 200 with valid directives.",
    priority: "P3",
    method: "GET",
    path: "/robots.txt",
    expectedStatus: [200],
    expectContains: ["User-agent"],
    tags: ["seo", "robots"],
  },
  {
    id: "home-canonical-tag",
    name: "Homepage has canonical link tag",
    description:
      "The homepage HTML must include a canonical <link> tag.",
    priority: "P3",
    method: "GET",
    path: "/",
    expectedStatus: [200],
    expectContains: ['rel="canonical"'],
    tags: ["seo", "canonical", "homepage"],
  },
  {
    id: "home-og-tags",
    name: "Homepage has OpenGraph tags",
    description:
      "The homepage HTML must include OpenGraph meta tags (og:title, og:description).",
    priority: "P3",
    method: "GET",
    path: "/",
    expectedStatus: [200],
    expectContains: ["og:title", "og:description"],
    tags: ["seo", "opengraph", "homepage"],
  },
  {
    id: "tools-canonical-tag",
    name: "Tools index has canonical link",
    description:
      "GET /tools must include a canonical <link> tag.",
    priority: "P3",
    method: "GET",
    path: "/tools",
    expectedStatus: [200],
    expectContains: ['rel="canonical"'],
    tags: ["seo", "canonical", "tools"],
  },
  {
    id: "bbs-canonical-tag",
    name: "BBS index has canonical link",
    description:
      "GET /bbs must include a canonical <link> tag.",
    priority: "P3",
    method: "GET",
    path: "/bbs",
    expectedStatus: [200],
    expectContains: ['rel="canonical"'],
    tags: ["seo", "canonical", "bbs"],
  },
  {
    id: "destinations-canonical-tag",
    name: "Destinations index has canonical link",
    description:
      "GET /destinations must include a canonical <link> tag.",
    priority: "P3",
    method: "GET",
    path: "/destinations",
    expectedStatus: [200],
    expectContains: ['rel="canonical"'],
    tags: ["seo", "canonical", "destinations"],
  },
  {
    id: "login-noindex",
    name: "Login page has noindex robots meta",
    description:
      "The login page must include a noindex robots meta tag to prevent indexing.",
    priority: "P3",
    method: "GET",
    path: "/login",
    expectedStatus: [200],
    expectContains: ["noindex"],
    tags: ["seo", "noindex", "auth"],
  },
  {
    id: "guides-page-meta",
    name: "Guides page has meta description",
    description:
      "GET /guides must return 200 and include a meta description tag.",
    priority: "P3",
    method: "GET",
    path: "/guides",
    expectedStatus: [200],
    expectContains: ['name="description"'],
    tags: ["seo", "meta", "guides"],
  },
  {
    id: "pricing-page-meta",
    name: "Pricing page has meta description",
    description:
      "GET /pricing must return 200 and include a meta description tag.",
    priority: "P3",
    method: "GET",
    path: "/pricing",
    expectedStatus: [200],
    expectContains: ['name="description"'],
    tags: ["seo", "meta", "pricing"],
  },
  {
    id: "dest-canada-og-tags",
    name: "Canada destination page has OpenGraph tags",
    description:
      "GET /destinations/canada must include og:title for social sharing.",
    priority: "P3",
    method: "GET",
    path: "/destinations/canada",
    expectedStatus: [200],
    expectContains: ["og:title"],
    tags: ["seo", "opengraph", "destinations"],
  },
];
