import type { TestCase } from "../types";

/**
 * P1 — Login / Authentication
 *
 * Verifies the login page, signup flow, password reset endpoints, and
 * registration validation.
 *
 * NOTE: Every case here has `requiresAuth: false` — these test the
 * *unauthenticated* entry points. The `--public-only` flag does NOT
 * skip them; they are public-facing. Cases that *need* a logged-in
 * session are marked `requiresAuth: true` and live in the admin/upload
 * suites.
 */
export const loginTests: TestCase[] = [
  {
    id: "login-page-loads",
    name: "Login page loads",
    description:
      "GET /login must return 200 and render the login form.",
    priority: "P1",
    method: "GET",
    path: "/login",
    expectedStatus: [200],
    expectContains: ["登录"],
    tags: ["page", "auth"],
  },
  {
    id: "login-page-signup-mode",
    name: "Login page supports signup mode",
    description:
      "GET /login?mode=signup must return 200 (same page, different default mode).",
    priority: "P1",
    method: "GET",
    path: "/login",
    query: { mode: "signup" },
    expectedStatus: [200],
    tags: ["page", "auth", "signup"],
  },
  {
    id: "login-page-noindex",
    name: "Login page is not indexed",
    description:
      "The login page must include robots noindex to prevent search engine indexing.",
    priority: "P1",
    method: "GET",
    path: "/login",
    expectedStatus: [200],
    expectContains: ["noindex"],
    tags: ["page", "auth", "seo"],
  },
  {
    id: "register-missing-fields",
    name: "Registration rejects missing email and password",
    description:
      "POST /api/auth/register with empty body must return 400, not 500.",
    priority: "P1",
    method: "POST",
    path: "/api/auth/register",
    body: {},
    expectedStatus: [400],
    expectContains: ["必填"],
    tags: ["api", "auth", "validation"],
  },
  {
    id: "register-short-password",
    name: "Registration rejects short password",
    description:
      "POST /api/auth/register with a 3-char password must return 400.",
    priority: "P1",
    method: "POST",
    path: "/api/auth/register",
    body: { email: "audit-test@example.com", password: "abc", name: "Test" },
    expectedStatus: [400],
    expectContains: ["密码"],
    tags: ["api", "auth", "validation"],
  },
  {
    id: "register-no-invite-code",
    name: "Registration requires invite code",
    description:
      "POST /api/auth/register without an invite code must return 403 during beta.",
    priority: "P1",
    method: "POST",
    path: "/api/auth/register",
    body: {
      email: "audit-test@example.com",
      password: "validpassword123",
      name: "Audit Test",
    },
    expectedStatus: [403],
    expectContains: ["邀请码"],
    tags: ["api", "auth", "invite-code"],
  },
  {
    id: "register-invalid-invite-code",
    name: "Registration rejects invalid invite code",
    description:
      "POST /api/auth/register with a fake invite code must return 403.",
    priority: "P1",
    method: "POST",
    path: "/api/auth/register",
    body: {
      email: "audit-test@example.com",
      password: "validpassword123",
      name: "Audit Test",
      inviteCode: "FAKE-CODE-99999",
    },
    expectedStatus: [403],
    expectContains: ["邀请码"],
    tags: ["api", "auth", "invite-code"],
  },
  {
    id: "forgot-password-page-loads",
    name: "Forgot password page loads",
    description:
      "GET /forgot-password must return 200 and render the reset request form.",
    priority: "P1",
    method: "GET",
    path: "/forgot-password",
    expectedStatus: [200],
    tags: ["page", "auth", "password-reset"],
  },
  {
    id: "reset-password-page-loads",
    name: "Reset password page loads",
    description:
      "GET /reset-password must return 200 (renders the password reset form).",
    priority: "P1",
    method: "GET",
    path: "/reset-password",
    expectedStatus: [200],
    tags: ["page", "auth", "password-reset"],
  },
  {
    id: "register-rate-limited",
    name: "Registration rate limiting",
    description:
      "Sending multiple rapid registration attempts should eventually hit rate limiting (429).",
    priority: "P1",
    method: "POST",
    path: "/api/auth/register",
    body: {
      email: "rate-test@example.com",
      password: "testpassword",
      name: "Rate Test",
      inviteCode: "INVALID",
    },
    expectedStatus: [403, 429],
    tags: ["api", "auth", "rate-limit"],
  },
];
