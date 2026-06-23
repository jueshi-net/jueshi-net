import type { TestCase } from "../types";

/**
 * P2 — Upload / Import Endpoints
 *
 * Verifies that all file-upload and data-import endpoints (admin CSV
 * import, bookmark import, resource import) reject unauthenticated
 * requests. These cases test the *negative* path — no credentials are
 * supplied.
 */
export const uploadTests: TestCase[] = [
  {
    id: "admin-import-page-protected",
    name: "Admin import page is protected",
    description:
      "GET /admin/import without an admin session must redirect, not expose the import UI.",
    priority: "P2",
    method: "GET",
    path: "/admin/import",
    expectedStatus: [200, 307, 308],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["page", "admin", "upload"],
  },
  {
    id: "admin-import-bookmarks-page-protected",
    name: "Admin import-bookmarks page is protected",
    description:
      "GET /admin/import-bookmarks without an admin session must redirect.",
    priority: "P2",
    method: "GET",
    path: "/admin/import-bookmarks",
    expectedStatus: [200, 307, 308],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["page", "admin", "upload"],
  },
  {
    id: "admin-resources-import-page-protected",
    name: "Admin resources import page is protected",
    description:
      "GET /admin/resources/import without an admin session must redirect.",
    priority: "P2",
    method: "GET",
    path: "/admin/resources/import",
    expectedStatus: [200, 307, 308],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["page", "admin", "upload"],
  },
  {
    id: "admin-api-csv-import-protected",
    name: "Admin CSV import API requires admin",
    description:
      "POST /api/admin/import/csv without auth must return 401, not accept a file.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/import/csv",
    body: {},
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "upload", "csv"],
  },
  {
    id: "admin-api-bookmarks-import-protected",
    name: "Admin bookmark import API requires admin",
    description:
      "POST /api/admin/import/bookmarks without auth must return 401.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/import/bookmarks",
    body: {},
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "upload", "bookmarks"],
  },
  {
    id: "admin-api-resources-import-protected",
    name: "Admin resources import API requires admin",
    description:
      "POST /api/admin/resources/import without auth must return 401.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/resources/import",
    body: {},
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "upload", "resources"],
  },
  {
    id: "admin-api-cms-import-protected",
    name: "Admin CMS import API requires admin",
    description:
      "POST /api/admin/cms/import without auth must return 401, not import content.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/cms/import",
    body: { items: [] },
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "upload", "cms"],
  },
  {
    id: "admin-api-homepage-config-protected",
    name: "Admin homepage config API requires admin",
    description:
      "POST /api/admin/homepage/config without auth must return 401.",
    priority: "P2",
    method: "POST",
    path: "/api/admin/homepage/config",
    body: {},
    expectedStatus: [401, 403],
    requiresAuth: true,
    requiresAdmin: true,
    tags: ["api", "admin", "upload", "config"],
  },
  {
    id: "workspace-products-import-protected",
    name: "Workspace products import requires auth",
    description:
      "POST /api/workspace/products/import without a session must return 401, not accept uploads.",
    priority: "P2",
    method: "POST",
    path: "/api/workspace/products/import",
    body: {},
    expectedStatus: [401, 403],
    requiresAuth: true,
    tags: ["api", "workspace", "upload", "products"],
  },
];
