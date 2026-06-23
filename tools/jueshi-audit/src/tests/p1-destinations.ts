import type { TestCase } from "../types";

/**
 * P1 — Destinations (Programmatic SEO pages)
 *
 * Verifies the destinations index, individual country pages, and the
 * legacy /countries → /destinations redirect chain.
 */
export const destinationsTests: TestCase[] = [
  {
    id: "dest-index-loads",
    name: "Destinations index page loads",
    description:
      "The /destinations page must return 200 and list available countries.",
    priority: "P1",
    method: "GET",
    path: "/destinations",
    expectedStatus: [200],
    expectContains: ["目的地", "destinations"],
    tags: ["page", "destinations"],
  },
  {
    id: "dest-canada-loads",
    name: "Canada destination page loads",
    description:
      "/destinations/canada must return 200 with country-specific content.",
    priority: "P1",
    method: "GET",
    path: "/destinations/canada",
    expectedStatus: [200],
    tags: ["page", "destinations", "canada"],
  },
  {
    id: "dest-australia-loads",
    name: "Australia destination page loads",
    description:
      "/destinations/australia must return 200 with country-specific content.",
    priority: "P1",
    method: "GET",
    path: "/destinations/australia",
    expectedStatus: [200],
    tags: ["page", "destinations", "australia"],
  },
  {
    id: "dest-japan-loads",
    name: "Japan destination page loads",
    description:
      "/destinations/japan must return 200 with country-specific content.",
    priority: "P1",
    method: "GET",
    path: "/destinations/japan",
    expectedStatus: [200],
    tags: ["page", "destinations", "japan"],
  },
  {
    id: "dest-singapore-loads",
    name: "Singapore destination page loads",
    description:
      "/destinations/singapore must return 200 with country-specific content.",
    priority: "P1",
    method: "GET",
    path: "/destinations/singapore",
    expectedStatus: [200],
    tags: ["page", "destinations", "singapore"],
  },
  {
    id: "dest-malaysia-loads",
    name: "Malaysia destination page loads",
    description:
      "/destinations/malaysia must return 200 with country-specific content.",
    priority: "P1",
    method: "GET",
    path: "/destinations/malaysia",
    expectedStatus: [200],
    tags: ["page", "destinations", "malaysia"],
  },
  {
    id: "dest-usa-redirect",
    name: "USA slug redirects to united-states",
    description:
      "/destinations/usa must 301 redirect to /destinations/united-states (canonical slug).",
    priority: "P1",
    method: "GET",
    path: "/destinations/usa",
    expectedStatus: [301, 307, 308],
    expectRedirectTo: "/destinations/united-states",
    tags: ["redirect", "destinations", "canonical"],
  },
  {
    id: "dest-uk-redirect",
    name: "UK slug redirects to united-kingdom",
    description:
      "/destinations/uk must 301 redirect to /destinations/united-kingdom (canonical slug).",
    priority: "P1",
    method: "GET",
    path: "/destinations/uk",
    expectedStatus: [301, 307, 308],
    expectRedirectTo: "/destinations/united-kingdom",
    tags: ["redirect", "destinations", "canonical"],
  },
  {
    id: "dest-us-redirect",
    name: "US short slug redirects to united-states",
    description:
      "/destinations/us must redirect to /destinations/united-states.",
    priority: "P1",
    method: "GET",
    path: "/destinations/us",
    expectedStatus: [301, 307, 308],
    expectRedirectTo: "/destinations/united-states",
    tags: ["redirect", "destinations", "canonical"],
  },
  {
    id: "countries-index-redirect",
    name: "/countries redirects to /destinations",
    description:
      "The legacy /countries path must 301 redirect to /destinations.",
    priority: "P1",
    method: "GET",
    path: "/countries",
    expectedStatus: [301, 307, 308],
    expectRedirectTo: "/destinations",
    tags: ["redirect", "legacy", "destinations"],
  },
  {
    id: "countries-slug-redirect",
    name: "/countries/canada redirects to /destinations/canada",
    description:
      "Legacy country slug paths must redirect to the destinations equivalent.",
    priority: "P1",
    method: "GET",
    path: "/countries/canada",
    expectedStatus: [301, 307, 308],
    expectRedirectTo: "/destinations/canada",
    tags: ["redirect", "legacy", "destinations"],
  },
  {
    id: "dest-united-states-loads",
    name: "United States canonical destination page loads",
    description:
      "/destinations/united-states (canonical slug) must return 200.",
    priority: "P1",
    method: "GET",
    path: "/destinations/united-states",
    expectedStatus: [200],
    tags: ["page", "destinations", "united-states"],
  },
  {
    id: "dest-united-kingdom-loads",
    name: "United Kingdom canonical destination page loads",
    description:
      "/destinations/united-kingdom (canonical slug) must return 200.",
    priority: "P1",
    method: "GET",
    path: "/destinations/united-kingdom",
    expectedStatus: [200],
    tags: ["page", "destinations", "united-kingdom"],
  },
];
