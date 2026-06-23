/**
 * Barrel export for all audit test suites.
 *
 * Import all suites:
 *   import { allTests, postalCodeTests, ... } from "./tests";
 *
 * Filter by public-only (skip `requiresAuth`):
 *   import { publicTests } from "./tests";
 */

import type { TestCase } from "../types";
import { postalCodeTests } from "./p1-postal-code";
import { destinationsTests } from "./p1-destinations";
import { bbsTests } from "./p1-bbs";
import { loginTests } from "./p1-login";
import { adminTests } from "./p2-admin";
import { uploadTests } from "./p2-upload";
import { mobileTests } from "./p2-mobile";
import { seoTests } from "./p3-seo";
import { securityTests } from "./p3-security";

export { postalCodeTests } from "./p1-postal-code";
export { destinationsTests } from "./p1-destinations";
export { bbsTests } from "./p1-bbs";
export { loginTests } from "./p1-login";
export { adminTests } from "./p2-admin";
export { uploadTests } from "./p2-upload";
export { mobileTests } from "./p2-mobile";
export { seoTests } from "./p3-seo";
export { securityTests } from "./p3-security";

/** All test suites concatenated, in priority order. */
export const allTests: TestCase[] = [
  ...postalCodeTests,
  ...destinationsTests,
  ...bbsTests,
  ...loginTests,
  ...adminTests,
  ...uploadTests,
  ...mobileTests,
  ...seoTests,
  ...securityTests,
];

/** All tests that do NOT require authentication (for `--public-only`). */
export const publicTests: TestCase[] = allTests.filter(
  (t) => !t.requiresAuth,
);
