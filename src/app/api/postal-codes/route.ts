import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s\-]+/g, '');
}

function looksLikePostalCode(q: string): boolean {
  const normalized = normalizePostal(q);
  return /^[A-Z0-9]{2,10}$/.test(normalized);
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
      // City search — use indexed countryCode + city prefix match
      const cityPrefix = query.trim().slice(0, 3);
      sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
               "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
               latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
               "isActive", "createdAt", "updatedAt"
        FROM postal_codes
        WHERE "isActive" = true
        AND city ILIKE $1
      `;
      params = [`${cityPrefix}%`];
      if (country) {
        sql += ` AND "countryCode" = $2`;
        params.push(country);
      }
      sql += ` ORDER BY city ASC, "postalCode" ASC LIMIT 20`;
    } else {
      // Postal code search — use indexed countryCode + normalizedPostalCode prefix match
      // This is the HOT path: hits @@index([countryCode, normalizedPostalCode])
      const prefix = normalized.slice(0, Math.min(normalized.length, 6));

      sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
               "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
               latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
               "isActive", "createdAt", "updatedAt"
        FROM postal_codes
        WHERE "isActive" = true
        AND "countryCode" = $1
        AND ("normalizedPostalCode" LIKE $2 OR "normalizedPostalCode" = $2)
        ORDER BY "normalizedPostalCode" ASC
        LIMIT 20
      `;
      params = [country || 'US', prefix];

      // If no country specified, search across all countries with exact/prefix
      if (!country) {
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
      }

      // Exact match fallback: if prefix search returns nothing and query is short, try exact
      if (normalized.length <= 4 && !country) {
        sql = `
          SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
                 "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
                 latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
                 "isActive", "createdAt", "updatedAt"
          FROM postal_codes
          WHERE "isActive" = true
          AND "normalizedPostalCode" = $1
          ORDER BY "normalizedPostalCode" ASC
          LIMIT 20
        `;
        params = [normalized];
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
