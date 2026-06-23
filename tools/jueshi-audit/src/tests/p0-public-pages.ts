/**
 * P0 — Public Pages Health Check
 * Verifies core public pages return 200 and capture evidence.
 */
import { Page } from 'playwright';
import { TestCase, TestStatus } from '../types.js';
import { sleep } from '../utils.js';

export const p0PublicPages: TestCase[] = [
  {
    id: 'P0-001',
    module: 'Public Pages',
    environment: 'staging',
    priority: 'P0',
    preconditions: 'None',
    steps: ['Navigate to /', 'Check HTTP status 200', 'Capture screenshot'],
    expected_result: 'Homepage loads with 200, visible content',
    evidence: 'screenshots/p0-001-homepage.png',
    production_allowed: true,
    staging_required: true,
    status: 'NOT_RUN' as TestStatus,
    notes: '',
  },
  {
    id: 'P0-002',
    module: 'Public Pages',
    environment: 'staging',
    priority: 'P0',
    preconditions: 'None',
    steps: ['Navigate to /destinations', 'Check HTTP status 200', 'Capture screenshot'],
    expected_result: 'Destinations list page loads with 200',
    evidence: 'screenshots/p0-002-destinations.png',
    production_allowed: true,
    staging_required: true,
    status: 'NOT_RUN' as TestStatus,
    notes: '',
  },
  {
    id: 'P0-003',
    module: 'Public Pages',
    environment: 'staging',
    priority: 'P0',
    preconditions: 'None',
    steps: ['Navigate to /destinations/canada', 'Check HTTP status 200', 'Capture screenshot'],
    expected_result: 'Canada country page loads with 200, hero section visible',
    evidence: 'screenshots/p0-003-canada.png',
    production_allowed: true,
    staging_required: true,
    status: 'NOT_RUN' as TestStatus,
    notes: '',
  },
  {
    id: 'P0-004',
    module: 'Public Pages',
    environment: 'staging',
    priority: 'P0',
    preconditions: 'None',
    steps: ['Navigate to /bbs', 'Check HTTP status 200', 'Capture screenshot'],
    expected_result: 'BBS community page loads with 200',
    evidence: 'screenshots/p0-004-bbs.png',
    production_allowed: true,
    staging_required: true,
    status: 'NOT_RUN' as TestStatus,
    notes: '',
  },
  {
    id: 'P0-005',
    module: 'Public Pages',
    environment: 'staging',
    priority: 'P0',
    preconditions: 'None',
    steps: ['Navigate to /tools/postal-code', 'Check HTTP status 200', 'Capture screenshot'],
    expected_result: 'Postal code tool page loads with 200',
    evidence: 'screenshots/p0-005-postal-code.png',
    production_allowed: true,
    staging_required: true,
    status: 'NOT_RUN' as TestStatus,
    notes: '',
  },
  {
    id: 'P0-006',
    module: 'Public Pages',
    environment: 'staging',
    priority: 'P0',
    preconditions: 'None',
    steps: ['Navigate to /login', 'Check HTTP status 200', 'Capture screenshot'],
    expected_result: 'Login page loads with 200, form visible',
    evidence: 'screenshots/p0-006-login.png',
    production_allowed: true,
    staging_required: true,
    status: 'NOT_RUN' as TestStatus,
    notes: '',
  },
];

export async function runP0PublicPages(page: Page, baseUrl: string, screenshotDir: string): Promise<TestCase[]> {
  const results: TestCase[] = [];
  for (const tc of p0PublicPages) {
    const result = { ...tc };
    try {
      const url = baseUrl + tc.steps[0].replace('Navigate to ', '');
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(600); // rate limit

      if (response && response.status() === 200) {
        result.status = 'PASS';
        const path = tc.evidence.replace('screenshots/', screenshotDir + '/');
        await page.screenshot({ path, fullPage: false });
      } else {
        result.status = 'FAIL';
        result.notes = `HTTP ${response?.status() ?? 'unknown'}`;
      }
    } catch (e: any) {
      result.status = 'FAIL';
      result.notes = e.message?.substring(0, 200) ?? 'Unknown error';
    }
    results.push(result);
  }
  return results;
}
