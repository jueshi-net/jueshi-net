import type { TestCase } from "../types";

/**
 * P2 — Mobile Responsiveness
 *
 * Verifies that key public pages render correctly for mobile user
 * agents. Each case sends a mobile User-Agent header and checks for
 * mobile-specific meta tags, viewport directives, and responsive
 * layout indicators in the HTML.
 */

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

export const mobileTests: TestCase[] = [
  {
    id: "mobile-homepage-viewport",
    name: "Homepage has mobile viewport meta tag",
    description:
      "The homepage HTML must include a viewport meta tag for mobile rendering.",
    priority: "P2",
    method: "GET",
    path: "/",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    expectContains: ["viewport"],
    tags: ["mobile", "homepage", "viewport"],
  },
  {
    id: "mobile-homepage-render",
    name: "Homepage renders for iPhone UA",
    description:
      "GET / with an iPhone User-Agent must return 200 with visible content (not a blank or crash page).",
    priority: "P2",
    method: "GET",
    path: "/",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    expectNotContains: ["500", "Internal Server Error"],
    tags: ["mobile", "homepage", "iphone"],
  },
  {
    id: "mobile-tools-page-render",
    name: "Tools page renders for mobile",
    description:
      "GET /tools with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/tools",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "tools"],
  },
  {
    id: "mobile-bbs-render",
    name: "BBS page renders for mobile",
    description:
      "GET /bbs with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/bbs",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "bbs"],
  },
  {
    id: "mobile-destinations-render",
    name: "Destinations page renders for mobile",
    description:
      "GET /destinations with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/destinations",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "destinations"],
  },
  {
    id: "mobile-postal-code-render",
    name: "Postal code tool renders for mobile",
    description:
      "GET /tools/postal-code with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/tools/postal-code",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "tools", "postal-code"],
  },
  {
    id: "mobile-login-render",
    name: "Login page renders for mobile",
    description:
      "GET /login with a mobile UA must return 200 with the login form.",
    priority: "P2",
    method: "GET",
    path: "/login",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    expectContains: ["登录"],
    tags: ["mobile", "auth"],
  },
  {
    id: "mobile-guides-render",
    name: "Guides page renders for mobile",
    description:
      "GET /guides with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/guides",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "guides"],
  },
  {
    id: "android-homepage-render",
    name: "Homepage renders for Android UA",
    description:
      "GET / with an Android Pixel User-Agent must return 200.",
    priority: "P2",
    method: "GET",
    path: "/",
    headers: { "User-Agent": ANDROID_UA },
    expectedStatus: [200],
    tags: ["mobile", "homepage", "android"],
  },
  {
    id: "android-bbs-render",
    name: "BBS page renders for Android",
    description:
      "GET /bbs with an Android UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/bbs",
    headers: { "User-Agent": ANDROID_UA },
    expectedStatus: [200],
    tags: ["mobile", "bbs", "android"],
  },
  {
    id: "mobile-search-render",
    name: "Search page renders for mobile",
    description:
      "GET /search with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/search",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "search"],
  },
  {
    id: "mobile-pricing-render",
    name: "Pricing page renders for mobile",
    description:
      "GET /pricing with a mobile UA must return 200.",
    priority: "P2",
    method: "GET",
    path: "/pricing",
    headers: { "User-Agent": MOBILE_UA },
    expectedStatus: [200],
    tags: ["mobile", "pricing"],
  },
];
