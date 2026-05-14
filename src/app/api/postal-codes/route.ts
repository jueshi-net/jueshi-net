import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s\-]+/g, '');
}

function looksLikePostalCode(q: string): boolean {
  // Pure digits, or alphanumeric with 3-10 chars (typical postal code pattern)
  const normalized = normalizePostal(q);
  return /^[A-Z0-9]{2,10}$/.test(normalized);
}

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
    const originalQuery = query.trim();

    const searchByPostal = async (q: string, norm: string, c: string | undefined) => {
      // Use normalizedPostalCode column (fast, indexed) with fallback to REPLACE
      // for records not yet backfilled
      let sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
               "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
               latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
               "isActive", "createdAt", "updatedAt"
        FROM postal_codes
        WHERE "isActive" = true
        AND (
          "normalizedPostalCode" ILIKE $1
          OR "postalCode" ILIKE $2
          OR REPLACE("postalCode", ' ', '') ILIKE $3
          OR city ILIKE $4
          OR province ILIKE $5
          OR "adminCode1" ILIKE $6
        )
      `;
      const params = [
        `%${norm}%`,
        `%${q}%`,
        `%${norm}%`,
        `%${q}%`,
        `%${q}%`,
        norm,
      ];

      if (c) {
        sql += ` AND "countryCode" = $${params.length + 1}`;
        params.push(c);
      }

      sql += ` ORDER BY city ASC, "postalCode" ASC LIMIT 50`;

      const results = await prisma.$queryRawUnsafe(sql, ...params);
      return results as any[];
    };

    // Prefix fallback: if no exact match, try with prefix
    const searchByPostalPrefix = async (prefix: string, c: string | undefined) => {
      let sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
               "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
               latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
               "isActive", "createdAt", "updatedAt"
        FROM postal_codes
        WHERE "isActive" = true
        AND (
          "normalizedPostalCode" ILIKE $1
          OR "postalCode" ILIKE $2
          OR city ILIKE $3
          OR province ILIKE $4
          OR "adminCode1" ILIKE $5
        )
      `;
      const params = [
        `${prefix}%`,
        `%${prefix}%`,
        `%${prefix}%`,
        `%${prefix}%`,
        prefix.toUpperCase(),
      ];

      if (c) {
        sql += ` AND "countryCode" = $${params.length + 1}`;
        params.push(c);
      }

      sql += ` ORDER BY city ASC, "postalCode" ASC LIMIT 50`;

      const results = await prisma.$queryRawUnsafe(sql, ...params);
      return results as any[];
    };

    let results: any[];

    if (action === 'search-city') {
      const params: any[] = [`%${originalQuery}%`];
      let sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province,
               "areaName", "adminName1", "adminCode1",
               latitude, longitude, accuracy, source
        FROM postal_codes
        WHERE "isActive" = true
        AND city ILIKE $1
      `;
      if (country) {
        params.push(country);
        sql += ` AND "countryCode" = $${params.length}`;
      }
      sql += ` ORDER BY "postalCode" ASC LIMIT 50`;

      results = await prisma.$queryRawUnsafe(sql, ...params);
    } else if (action === 'search-postal') {
      results = await searchByPostal(originalQuery, normalized, country || undefined);
      
      // Prefix fallback: if no results and query looks like a postal code
      if (results.length === 0 && looksLikePostalCode(query) && normalized.length > 2) {
        const prefix = normalized.substring(0, 3);
        results = await searchByPostalPrefix(prefix, country || undefined);
      }
    } else {
      // Default: auto-detect if query looks like postal code or city name
      results = await searchByPostal(originalQuery, normalized, country || undefined);
      
      // Prefix fallback
      if (results.length === 0 && looksLikePostalCode(query) && normalized.length > 2) {
        const prefix = normalized.substring(0, 3);
        results = await searchByPostalPrefix(prefix, country || undefined);
      }
    }

    const seen = new Set<string>();
    const deduped = results.filter((r: any) => {
      const key = `${r.countryCode}-${(r as any).postalCode}`;
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
