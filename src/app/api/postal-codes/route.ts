import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]+/g, '');
}

/**
 * Classify query intent: is this a postal code or a city/place name?
 */
function looksLikePostalCode(q: string): boolean {
  const normalized = normalizePostal(q);
  // Must contain at least one digit — pure-alpha strings are city names
  return /^[A-Z0-9]{2,10}$/.test(normalized) && /\d/.test(normalized);
}

/** Countries known to have postal code data in our DB */
const COUNTRIES_WITH_DB = new Set(['CA', 'US', 'GB', 'AU', 'NZ', 'JP', 'SG', 'MY']);

/**
 * Postal code query API — strict state machine.
 *
 * States returned in `status`:
 *   - idle              : no query
 *   - exact_match       : postal code found exactly
 *   - city_match        : city name matched
 *   - region_match      : province/state matched
 *   - no_match          : has DB but no results
 *   - country_no_database : no DB for this country
 *   - error             : query failed
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || '';
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ error: '缺少搜索内容', results: [], total: 0, status: 'idle' });
  }

  try {
    const normalized = normalizePostal(query);
    const isPostal = looksLikePostalCode(query);

    // Check if country has DB coverage
    const hasDb = !country || COUNTRIES_WITH_DB.has(country.toUpperCase());

    if (!hasDb) {
      // Country has no postal code database — return country_no_database
      return NextResponse.json({
        results: [],
        total: 0,
        status: 'country_no_database',
        message: '当前国家暂未接入可查询邮编数据库，请使用地址格式或官方入口确认。',
      });
    }

    let sql: string;
    let params: any[];

    if (!isPostal) {
      // === CITY / PLACE SEARCH ===
      // Search city, areaName, province, adminName1 (Japan stores prefecture in province)
      // Also apply city alias mapping for common transliterations
      const CITY_ALIASES: Record<string, string[]> = {
        'tokyo': ['Tokyo', 'Tokyo To', '東京都', 'Tokyo-to', 'Tokio'],
        'osaka': ['Osaka', 'Osaka Prefecture', '大阪府', 'Osaka-fu'],
        'kyoto': ['Kyoto', 'Kyoto Prefecture', '京都府', 'Kyoto-fu'],
        'yokohama': ['Yokohama', 'Kanagawa', '神奈川県'],
        'nagoya': ['Nagoya', 'Aichi', '愛知県'],
        'sapporo': ['Sapporo', 'Hokkaido', '北海道'],
        'fukuoka': ['Fukuoka', 'Fukuoka Prefecture', '福岡県'],
      };
      const cityQuery = query.trim();
      const aliasKey = cityQuery.toLowerCase();
      const aliases = CITY_ALIASES[aliasKey] || [];

      // Build OR conditions for city/areaName/province/adminName1
      const searchTerms = [cityQuery, ...aliases];
      const orConditions = searchTerms.map((_, i) => {
        const paramIdx = i + 1;
        return `(city ILIKE $${paramIdx} OR "areaName" ILIKE $${paramIdx} OR province ILIKE $${paramIdx} OR "adminName1" ILIKE $${paramIdx})`;
      }).join(' OR ');

      sql = `
        SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
               "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
               latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
               "isActive", "createdAt", "updatedAt"
        FROM postal_codes
        WHERE "isActive" = true
        AND (${orConditions})
      `;
      params = searchTerms.map(t => `${t}%`);
      if (country) {
        const countryParamIdx = params.length + 1;
        sql += ` AND "countryCode" = $${countryParamIdx}`;
        params.push(country);
      }
      sql += ` ORDER BY city ASC, "postalCode" ASC LIMIT 20`;
    } else {
      // === POSTAL CODE SEARCH ===
      // Use EXACT normalized match first, fall back to SHORT prefix only (3 chars min)
      // to avoid over-broad prefix matching on fake codes.
      if (!country) {
        // No country selected — search all countries by exact match
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
      } else {
        // Country-scoped — exact match + prefix match on normalizedPostalCode
        // Prefix match is safe: "ZZZ999" won't match any real code, but "10000" matches "1000000"
        sql = `
          SELECT id, country, "countryCode", city, "postalCode", "normalizedPostalCode", province, district,
                 "areaName", "adminName1", "adminCode1", "adminName2", "adminCode2",
                 latitude, longitude, accuracy, source, "sourceUrl", "sourceVersion",
                 "isActive", "createdAt", "updatedAt"
          FROM postal_codes
          WHERE "isActive" = true
          AND "countryCode" = $1
          AND ("normalizedPostalCode" = $2 OR "normalizedPostalCode" ILIKE $3)
          ORDER BY "normalizedPostalCode" ASC
          LIMIT 20
        `;
        params = [country, normalized, `${normalized}%`];
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

    // Determine status — CRITICAL: distinguish exact vs prefix match
    let status: string;
    if (deduped.length === 0) {
      status = 'no_match';
    } else if (isPostal) {
      // Check if ANY result has an exact normalized match
      const hasExact = deduped.some(r => r.normalizedPostalCode === normalized);
      if (hasExact) {
        status = 'exact_postal_match';
      } else {
        // All results are prefix matches — NOT exact
        status = 'prefix_range_match';
      }
    } else {
      // City/region match — check if it matched on province (region) vs city
      const hasCityMatch = deduped.some(r =>
        r.city?.toLowerCase().startsWith(query.trim().toLowerCase()) ||
        r.areaName?.toLowerCase().startsWith(query.trim().toLowerCase())
      );
      status = hasCityMatch ? 'city_match' : 'region_match';
    }

    return NextResponse.json({
      results: deduped,
      total: deduped.length,
      status,
      // Include match detail for client display
      matchDetail: isPostal ? {
        inputNormalized: normalized,
        hasExactMatch: deduped.some(r => r.normalizedPostalCode === normalized),
        isPrefixOnly: !deduped.some(r => r.normalizedPostalCode === normalized),
      } : undefined,
    });
  } catch (error) {
    console.error('Postal code API error:', error);
    return NextResponse.json({
      error: '查询失败',
      results: [],
      total: 0,
      status: 'error',
    }, { status: 500 });
  }
}
