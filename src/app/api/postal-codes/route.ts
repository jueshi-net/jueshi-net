import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s\-]+/g, '');
}

function looksLikePostalCode(q: string): boolean {
  const normalized = normalizePostal(q);
  // Must contain at least one digit — pure-alpha strings are city names
  return /^[A-Z0-9]{2,10}$/.test(normalized) && /\d/.test(normalized);
}

/**
 * Optimized postal code query — uses index-driven exact/prefix matching
 * instead of full-table ILIKE '%...%' scans.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const country = searchParams.get('country') || '';
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ error: '缺少搜索内容', results: [], total: 0 });
  }

  try {
    const normalized = normalizePostal(query);
    const isPostal = looksLikePostalCode(query);
    const isCity = !isPostal;

    let sql: string;
    let params: any[];

    if (action === 'search-city' || isCity) {
      // City search — use full query for precise matching
      const cityQuery = query.trim();
      sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
               "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
               latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
               "isActive", "createdAt", "updatedAt"
        FROM postal_codes
        WHERE "isActive" = true
        AND (city ILIKE $1 OR "areaName" ILIKE $1)
      `;
      params = [`${cityQuery}%`];
      if (country) {
        sql += ` AND "countryCode" = $2`;
        params.push(country);
      }
      sql += ` ORDER BY city ASC, "postalCode" ASC LIMIT 20`;
    } else {
      // Postal code search — REQUIRES country parameter (no US default)
      // Previous bug: country || 'US' caused Malaysian postal codes to return US results
      const prefix = normalized.slice(0, Math.min(normalized.length, 6));

      if (!country) {
        // No country selected — search all countries by prefix
        sql = `
          SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
                 "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
                 latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
                 "isActive", "createdAt", "updatedAt"
          FROM postal_codes
          WHERE "isActive" = true
          AND "normalizedPostalCode" LIKE $1
          ORDER BY "normalizedPostalCode" ASC
          LIMIT 20
        `;
        params = [`${prefix}%`];
      } else {
        // Country-scoped search — ONLY search within selected country
        sql = `
          SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
                 "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
                 latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
                 "isActive", "createdAt", "updatedAt"
          FROM postal_codes
          WHERE "isActive" = true
          AND "countryCode" = $1
          AND "normalizedPostalCode" LIKE $2
          ORDER BY "normalizedPostalCode" ASC
          LIMIT 20
        `;
        params = [country, `${prefix}%`];
      }
    }

    const results = await prisma.$queryRawUnsafe(sql, ...params);
    const resultsArray = results as any[];

    // Deduplicate by countryCode + postalCode
    const seen = new Set<string>();
    const deduped = resultsArray.filter((r: any) => {
      const key = `${r.countryCode}-${r.postalCode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ results: deduped, total: deduped.length });
  } catch (error) {
    console.error('Postal code API error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
