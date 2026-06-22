import { NextRequest, NextResponse } from 'next/server';
import {
  resolveCityQuery,
  resolveAbbreviation,
  getAddressFormat,
  getPopularCities,
  CITY_MAPPINGS,
  ADDRESS_FORMATS,
  type CityMapping,
} from '@/lib/postal-code-advanced-data';
import { getOfficialLink, getPhoneCode, getTimezone, getPostalFormat, getExamplePostal } from '@/lib/postal-code-official-links';
import { allCountryData, SUPPORTED_COUNTRIES } from '@/lib/data/postal-codes';

/**
 * Advanced Postal Code API
 * 
 * Supports 3 modes:
 * 1. city - Search by city name (Chinese/English) → postal code range, format, official lookup
 * 2. region - Search by postal code → country, city, province, region, timezone
 * 3. format - Get address format for a country → standard format, example, notes
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'city';
  const query = searchParams.get('q') || '';
  const countryCode = searchParams.get('country') || '';

  try {
    switch (mode) {
      case 'city':
        return handleCitySearch(query, countryCode);
      case 'region':
        return handleRegionSearch(query, countryCode);
      case 'format':
        return handleFormatQuery(countryCode || query);
      default:
        return NextResponse.json({ error: 'Invalid mode. Use: city, region, format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Advanced postal code API error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

/**
 * Mode 1: City Search
 * Input: City name (Chinese or English) or abbreviation
 * Output: Postal code range, address format, official lookup URL
 */
function handleCitySearch(query: string, countryCode: string) {
  if (!query.trim()) {
    return NextResponse.json({ error: '请输入城市名', results: [], recommendations: getRecommendations(countryCode) });
  }

  // Try to resolve the query
  let results = resolveCityQuery(query);

  // If no results, try abbreviation resolution
  if (results.length === 0) {
    const resolved = resolveAbbreviation(query);
    if (resolved) {
      results = resolveCityQuery(resolved);
    }
  }

  // Filter by country if specified
  if (countryCode && results.length > 0) {
    const filtered = results.filter(r => r.countryCode === countryCode);
    if (filtered.length > 0) {
      results = filtered;
    }
  }

  // Enrich results with additional data
  const enrichedResults = results.map(city => {
    const officialLink = getOfficialLink(city.countryCode);
    const countryData = allCountryData.find(c => c.code === city.countryCode);
    const addressFormat = getAddressFormat(city.countryCode);

    return {
      ...city,
      officialLookupUrl: officialLink?.lookupUrl || officialLink?.officialUrl || '',
      officialName: officialLink?.nameEn || '',
      phoneCode: getPhoneCode(city.countryCode) || '',
      timezone: getTimezone(city.countryCode) || '',
      postalFormat: getPostalFormat(city.countryCode) || countryData?.format || '',
      examplePostal: getExamplePostal(city.countryCode) || '',
      addressFormat: addressFormat?.format || '',
      addressFormatCn: addressFormat?.formatCn || '',
      sampleAddress: addressFormat?.example || '',
    };
  });

  return NextResponse.json({
    results: enrichedResults,
    total: enrichedResults.length,
    recommendations: enrichedResults.length === 0 ? getRecommendations(countryCode) : [],
    queryResolved: results.length > 0,
  });
}

/**
 * Mode 2: Region Search
 * Input: Postal code
 * Output: Country, city, province, region, timezone
 */
function handleRegionSearch(query: string, countryCode: string) {
  if (!query.trim()) {
    return NextResponse.json({ error: '请输入邮编', results: [], recommendations: getRecommendations(countryCode) });
  }

  const normalized = query.trim().toUpperCase().replace(/[\s\-]+/g, '');
  const results: any[] = [];

  // Search through city mappings by postal prefix
  for (const city of CITY_MAPPINGS) {
    if (countryCode && city.countryCode !== countryCode) continue;

    // Check if the postal code starts with the city's prefix
    if (normalized.startsWith(city.postalPrefix)) {
      const officialLink = getOfficialLink(city.countryCode);
      results.push({
        postalCode: query.trim(),
        normalizedPostalCode: normalized,
        country: SUPPORTED_COUNTRIES.find(c => c.code === city.countryCode)?.name || city.countryCode,
        countryCode: city.countryCode,
        city: city.en,
        cityCn: city.cn,
        province: city.province,
        region: city.province,
        postalRange: city.postalRange,
        timezone: getTimezone(city.countryCode) || '',
        phoneCode: getPhoneCode(city.countryCode) || '',
        officialLookupUrl: officialLink?.lookupUrl || officialLink?.officialUrl || '',
        officialName: officialLink?.nameEn || '',
        matchType: normalized === city.postalPrefix ? 'exact' : 'prefix',
      });
    }
  }

  // Also try to match against known country formats
  // CRITICAL: When user has selected a country, NEVER override with format detection.
  // detectCountryFromPostal defaults 5-digit codes to US, which causes Malaysian
  // postal codes (50000) to return US results.
  if (results.length === 0 && !countryCode) {
    // Only use format detection when NO country is selected
    const detectedCountry = detectCountryFromPostal(normalized);
    if (detectedCountry) {
      const officialLink = getOfficialLink(detectedCountry);
      results.push({
        postalCode: query.trim(),
        normalizedPostalCode: normalized,
        country: SUPPORTED_COUNTRIES.find(c => c.code === detectedCountry)?.name || detectedCountry,
        countryCode: detectedCountry,
        city: '',
        cityCn: '',
        province: '',
        region: '',
        postalRange: '',
        timezone: getTimezone(detectedCountry) || '',
        phoneCode: getPhoneCode(detectedCountry) || '',
        officialLookupUrl: officialLink?.lookupUrl || officialLink?.officialUrl || '',
        officialName: officialLink?.nameEn || '',
        matchType: 'format_match',
        note: '邮编格式匹配，具体城市请使用官方查询',
      });
    }
  }

  // If country is selected but no results, return explicit "no match" with official entry
  if (results.length === 0 && countryCode) {
    const officialLink = getOfficialLink(countryCode);
    const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    return NextResponse.json({
      results: [],
      total: 0,
      noMatchForSelectedCountry: true,
      selectedCountry: {
        code: countryCode,
        name: country?.name || countryCode,
      },
      officialLookup: officialLink ? {
        url: officialLink.lookupUrl || officialLink.officialUrl,
        name: officialLink.nameEn,
      } : null,
      recommendations: getRecommendations(countryCode),
    });
  }

  return NextResponse.json({
    results: results.slice(0, 10),
    total: results.length,
    recommendations: results.length === 0 ? getRecommendations(countryCode) : [],
  });
}

/**
 * Mode 3: Address Format Query
 * Input: Country code or country name
 * Output: Standard address format, example, notes
 */
function handleFormatQuery(countryInput: string) {
  if (!countryInput.trim()) {
    // Return all available formats
    const allFormats = Object.values(ADDRESS_FORMATS).map(format => ({
      ...format,
      officialLookupUrl: format.officialLookupUrl,
      officialName: format.officialName,
    }));
    return NextResponse.json({
      results: allFormats,
      total: allFormats.length,
      recommendations: [],
    });
  }

  // Try to resolve country code or name
  let resolvedCode = countryInput.trim().toUpperCase();

  // Check if it's a country code
  if (!ADDRESS_FORMATS[resolvedCode]) {
    // Try to find by country name (Chinese or English)
    const country = SUPPORTED_COUNTRIES.find(c =>
      c.name === countryInput.trim() ||
      c.nameEn.toLowerCase() === countryInput.trim().toLowerCase() ||
      c.code === resolvedCode
    );
    if (country) {
      resolvedCode = country.code;
    }
  }

  const format = getAddressFormat(resolvedCode);

  if (!format) {
    // Country not in our format database, return basic info
    const country = SUPPORTED_COUNTRIES.find(c => c.code === resolvedCode);
    const officialLink = getOfficialLink(resolvedCode);
    const countryData = allCountryData.find(c => c.code === resolvedCode);

    return NextResponse.json({
      results: [],
      basicInfo: {
        countryCode: resolvedCode,
        countryName: country?.name || resolvedCode,
        countryNameEn: country?.nameEn || '',
        flag: country?.flag || '',
        postalFormat: getPostalFormat(resolvedCode) || countryData?.format || '请查询官方邮政网站',
        examplePostal: getExamplePostal(resolvedCode) || '',
        phoneCode: getPhoneCode(resolvedCode) || '',
        timezone: getTimezone(resolvedCode) || '',
        officialLookupUrl: officialLink?.lookupUrl || officialLink?.officialUrl || '',
        officialName: officialLink?.nameEn || '',
        note: '该国家的详细地址格式暂未收录，请参考官方邮政网站',
      },
      recommendations: getRecommendations(resolvedCode),
    });
  }

  return NextResponse.json({
    results: [{
      ...format,
      officialLookupUrl: format.officialLookupUrl,
      officialName: format.officialName,
    }],
    total: 1,
    recommendations: [],
  });
}

/**
 * Detect country from postal code format
 */
function detectCountryFromPostal(normalized: string): string | null {
  // US: 5 digits or 5+4 digits
  if (/^\d{5}$/.test(normalized)) {
    // Could be US, AU, NZ, etc. Default to US for 5 digits
    return 'US';
  }
  // Canada: ANA NAN pattern (6 chars with letters)
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalized)) {
    return 'CA';
  }
  // UK: letters + numbers pattern
  if (/^[A-Z]{1,2}\d[A-Z]?\d[A-Z]{2}$/.test(normalized)) {
    return 'GB';
  }
  // Japan: 7 digits
  if (/^\d{7}$/.test(normalized)) {
    return 'JP';
  }
  // Australia: 4 digits starting with 0-9
  if (/^\d{4}$/.test(normalized)) {
    return 'AU';
  }
  // Singapore: 6 digits
  if (/^\d{6}$/.test(normalized)) {
    return 'SG';
  }
  // Germany/France: 5 digits
  if (/^\d{5}$/.test(normalized)) {
    return 'DE'; // Default to Germany for 5 digits
  }
  return null;
}

/**
 * Get recommendations when no results found
 */
function getRecommendations(countryCode: string) {
  const officialLink = countryCode ? getOfficialLink(countryCode) : null;
  const popularCities = getPopularCities(countryCode);
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);

  return {
    officialLookup: officialLink ? {
      url: officialLink.lookupUrl || officialLink.officialUrl,
      name: officialLink.nameEn,
    } : null,
    popularCities: popularCities.map(c => ({
      name: c.en,
      nameCn: c.cn,
      countryCode: c.countryCode,
      postalPrefix: c.postalPrefix,
    })),
    manualFormatGenerator: true,
    availableFormats: Object.keys(ADDRESS_FORMATS).map(code => {
      const c = SUPPORTED_COUNTRIES.find(x => x.code === code);
      return {
        code,
        name: c?.name || code,
        flag: c?.flag || '',
      };
    }),
    countryName: country?.name || '',
  };
}
