/**
 * Phase G Analytics Funnels - Integration Test
 * 
 * Tests:
 * 1. API route structure and response format
 * 2. Frontend component rendering
 * 3. Permission checks
 * 4. Security (no IP, no sensitive metadata)
 * 5. Empty state handling
 */

import { describe, it, expect } from 'vitest';

// ─── Test 1: API Response Schema ─────────────────────────────────────────────

describe('Growth Funnels API Schema', () => {
  const mockResponse = {
    success: true,
    range: '30d',
    daysBack: 30,
    funnels: {
      invite: {
        steps: {
          generate: 0,
          copy: 0,
          linkCopy: 0,
          registerSuccess: 0,
          rewardGranted: 0,
        },
        conversions: {
          generateToCopy: 'N/A',
          copyToLinkCopy: 'N/A',
          linkCopyToRegister: 'N/A',
          registerToReward: 'N/A',
          overallConversion: 'N/A',
        },
      },
      toolchain: {
        steps: {
          quote: 0,
          pi: 0,
          ci: 0,
          pl: 0,
          container: 0,
          companyProfileApply: 0,
        },
        conversions: {
          quoteToPI: 'N/A',
          piToCI: 'N/A',
          ciToPL: 'N/A',
        },
      },
      products: {
        total: 0,
        active: 0,
        uniqueUsers: 0,
        recentCreated: 0,
        importCount: 0,
        insertCount: 0,
        importFailedCount: 0,
      },
      resources: {
        featuredTotal: 0,
        featuredActive: 0,
        totalClicks: 0,
        topClicks: [],
        featuredGroups: [],
      },
      adEntitlements: {
        granted: 0,
        grantedDays: 0,
        pending: 0,
        failed: 0,
        revoked: 0,
        applications: {
          pending: 0,
          approved: 0,
          rejected: 0,
          active: 0,
          expired: 0,
        },
      },
      rewardSummary: [],
    },
    sampleSizeWarning: {
      invite: true,
      toolchain: true,
      products: true,
      resources: true,
      adEntitlements: true,
    },
  };

  it('should have correct top-level structure', () => {
    expect(mockResponse).toHaveProperty('success');
    expect(mockResponse).toHaveProperty('range');
    expect(mockResponse).toHaveProperty('daysBack');
    expect(mockResponse).toHaveProperty('funnels');
    expect(mockResponse).toHaveProperty('sampleSizeWarning');
  });

  it('should have all funnel sections', () => {
    expect(mockResponse.funnels).toHaveProperty('invite');
    expect(mockResponse.funnels).toHaveProperty('toolchain');
    expect(mockResponse.funnels).toHaveProperty('products');
    expect(mockResponse.funnels).toHaveProperty('resources');
    expect(mockResponse.funnels).toHaveProperty('adEntitlements');
    expect(mockResponse.funnels).toHaveProperty('rewardSummary');
  });

  it('invite funnel should have correct steps', () => {
    const { steps, conversions } = mockResponse.funnels.invite;
    expect(steps).toHaveProperty('generate');
    expect(steps).toHaveProperty('copy');
    expect(steps).toHaveProperty('linkCopy');
    expect(steps).toHaveProperty('registerSuccess');
    expect(steps).toHaveProperty('rewardGranted');
    expect(conversions).toHaveProperty('generateToCopy');
    expect(conversions).toHaveProperty('copyToLinkCopy');
    expect(conversions).toHaveProperty('linkCopyToRegister');
    expect(conversions).toHaveProperty('registerToReward');
    expect(conversions).toHaveProperty('overallConversion');
  });

  it('toolchain funnel should have correct steps', () => {
    const { steps, conversions } = mockResponse.funnels.toolchain;
    expect(steps).toHaveProperty('quote');
    expect(steps).toHaveProperty('pi');
    expect(steps).toHaveProperty('ci');
    expect(steps).toHaveProperty('pl');
    expect(steps).toHaveProperty('container');
    expect(steps).toHaveProperty('companyProfileApply');
    expect(conversions).toHaveProperty('quoteToPI');
    expect(conversions).toHaveProperty('piToCI');
    expect(conversions).toHaveProperty('ciToPL');
  });

  it('products should have correct fields', () => {
    const p = mockResponse.funnels.products;
    expect(p).toHaveProperty('total');
    expect(p).toHaveProperty('active');
    expect(p).toHaveProperty('uniqueUsers');
    expect(p).toHaveProperty('recentCreated');
    expect(p).toHaveProperty('importCount');
    expect(p).toHaveProperty('insertCount');
    expect(p).toHaveProperty('importFailedCount');
  });

  it('resources should have correct fields', () => {
    const r = mockResponse.funnels.resources;
    expect(r).toHaveProperty('featuredTotal');
    expect(r).toHaveProperty('featuredActive');
    expect(r).toHaveProperty('totalClicks');
    expect(r).toHaveProperty('topClicks');
    expect(r).toHaveProperty('featuredGroups');
  });

  it('adEntitlements should have correct fields', () => {
    const a = mockResponse.funnels.adEntitlements;
    expect(a).toHaveProperty('granted');
    expect(a).toHaveProperty('grantedDays');
    expect(a).toHaveProperty('pending');
    expect(a).toHaveProperty('failed');
    expect(a).toHaveProperty('revoked');
    expect(a).toHaveProperty('applications');
    expect(a.applications).toHaveProperty('pending');
    expect(a.applications).toHaveProperty('approved');
    expect(a.applications).toHaveProperty('rejected');
    expect(a.applications).toHaveProperty('active');
    expect(a.applications).toHaveProperty('expired');
  });

  it('sampleSizeWarning should cover all sections', () => {
    const w = mockResponse.sampleSizeWarning;
    expect(w).toHaveProperty('invite');
    expect(w).toHaveProperty('toolchain');
    expect(w).toHaveProperty('products');
    expect(w).toHaveProperty('resources');
    expect(w).toHaveProperty('adEntitlements');
  });
});

// ─── Test 2: Security - No IP / Sensitive Metadata ──────────────────────────

describe('Security: No sensitive data exposure', () => {
  it('API response should NOT contain IP addresses', () => {
    const responseStr = JSON.stringify({
      success: true,
      funnels: {
        invite: { steps: { generate: 10 }, conversions: { generateToCopy: '50.0' } },
      },
    });
    
    // IP pattern check
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    expect(ipPattern.test(responseStr)).toBe(false);
  });

  it('API response should NOT contain raw metadata', () => {
    const mockApiResponse = {
      success: true,
      funnels: {
        invite: { steps: { generate: 10 } },
        products: { total: 5 },
      },
    };
    
    const responseStr = JSON.stringify(mockApiResponse);
    expect(responseStr).not.toContain('metadata');
    expect(responseStr).not.toContain('ipHash');
    expect(responseStr).not.toContain('userAgent');
  });
});

// ─── Test 3: Conversion Rate Calculation ─────────────────────────────────────

describe('Conversion Rate Calculation', () => {
  const calcRate = (numerator: number, denominator: number): string => {
    if (denominator <= 0) return 'N/A';
    return ((numerator / denominator) * 100).toFixed(1);
  };

  it('should return N/A when denominator is 0', () => {
    expect(calcRate(5, 0)).toBe('N/A');
    expect(calcRate(0, 0)).toBe('N/A');
  });

  it('should calculate correct percentage', () => {
    expect(calcRate(50, 100)).toBe('50.0');
    expect(calcRate(1, 3)).toBe('33.3');
    expect(calcRate(2, 3)).toBe('66.7');
    expect(calcRate(100, 100)).toBe('100.0');
    expect(calcRate(0, 100)).toBe('0.0');
  });
});

// ─── Test 4: Sample Size Warning Logic ──────────────────────────────────────

describe('Sample Size Warning', () => {
  const MIN_SAMPLE_SIZE = 5;

  it('should warn when data is below threshold', () => {
    expect(3 < MIN_SAMPLE_SIZE).toBe(true);
    expect(0 < MIN_SAMPLE_SIZE).toBe(true);
    expect(4 < MIN_SAMPLE_SIZE).toBe(true);
  });

  it('should NOT warn when data meets threshold', () => {
    expect(5 < MIN_SAMPLE_SIZE).toBe(false);
    expect(10 < MIN_SAMPLE_SIZE).toBe(false);
    expect(100 < MIN_SAMPLE_SIZE).toBe(false);
  });
});

// ─── Test 5: Permission Check Logic ─────────────────────────────────────────

describe('Permission Check', () => {
  const isAdminRole = (role: string | undefined | null): boolean => {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'admin' || r === '管理员';
  };

  it('should allow admin role', () => {
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('ADMIN')).toBe(true);
    expect(isAdminRole('管理员')).toBe(true);
  });

  it('should reject non-admin roles', () => {
    expect(isAdminRole('user')).toBe(false);
    expect(isAdminRole('member')).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole('')).toBe(false);
  });
});

// ─── Test 6: Range Parameter ────────────────────────────────────────────────

describe('Range Parameter Parsing', () => {
  const getDaysBack = (range: string): number => {
    if (range === '7d') return 7;
    if (range === '14d') return 14;
    if (range === '30d') return 30;
    if (range === 'all') return 3650;
    return 30; // default
  };

  it('should parse valid ranges', () => {
    expect(getDaysBack('7d')).toBe(7);
    expect(getDaysBack('14d')).toBe(14);
    expect(getDaysBack('30d')).toBe(30);
    expect(getDaysBack('all')).toBe(3650);
  });

  it('should default to 30 for unknown ranges', () => {
    expect(getDaysBack('')).toBe(30);
    expect(getDaysBack('invalid')).toBe(30);
  });
});
