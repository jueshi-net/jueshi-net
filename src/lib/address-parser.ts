/**
 * Address Parser - Pure frontend address parsing
 * Supports: US, Canada, UK, Australia, New Zealand, China
 * No external API calls, no database, no server storage
 */

export interface ParsedAddress {
  recipient: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  rawInput: string;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

// Country detection patterns (ordered by specificity - more specific first)
const COUNTRY_PATTERNS: Array<[string, string[]]> = [
  ['New Zealand', ['new zealand', 'nz', '新西兰']],
  ['United Kingdom', ['united kingdom', 'uk', 'britain', 'england', 'scotland', 'wales', '英国', '英格兰']],
  ['United States', ['united states', 'usa', 'america', '美国', '美利坚']],
  ['Australia', ['australia', '澳洲', '澳大利亚']],
  ['Canada', ['canada', '加拿大']],
  ['China', ['china', 'prc', '中国', '中华人民共和国']],
];

// Postal code patterns by country
const POSTAL_PATTERNS: Record<string, RegExp> = {
  'United States': /^\d{5}(-\d{4})?$/,
  'Canada': /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
  'United Kingdom': /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  'Australia': /^\d{4}$/,
  'New Zealand': /^\d{4}$/,
  'China': /^\d{6}$/,
};

// Phone patterns
const PHONE_PATTERNS: Record<string, RegExp> = {
  'United States': /^\+?1[\s\-()]?\d{3}[\s\-()]?\d{4}$/,
  'Canada': /^\+?1[\s\-()]?\d{3}[\s\-()]?\d{4}$/,
  'United Kingdom': /^\+?44[\s\-()]?\d{2,4}[\s\-()]?\d{4,6}$/,
  'Australia': /^\+?61[\s\-()]?\d{1}[\s\-()]?\d{4}[\s\-()]?\d{4}$/,
  'New Zealand': /^\+?64[\s\-()]?\d{1,2}[\s\-()]?\d{3,4}[\s\-()]?\d{4}$/,
  'China': /^\+?86[\s\-()]?\d{3}[\s\-()]?\d{4}[\s\-()]?\d{4}$/,
};

// US State abbreviations
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

// Canadian Province abbreviations
const CA_PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

// Australian State abbreviations
const AU_STATES = ['NSW','VIC','QLD','SA','WA','TAS','NT','ACT'];

// Chinese provinces
const CN_PROVINCES = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','台湾','内蒙古','广西','西藏','宁夏','新疆'];

/**
 * Detect country from address text
 */
function detectCountry(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [country, patterns] of COUNTRY_PATTERNS) {
    for (const pattern of patterns) {
      const patternLower = pattern.toLowerCase();
      // Use word boundary for short patterns to avoid false matches
      if (patternLower.length <= 3) {
        const regex = new RegExp(`\\b${patternLower}\\b`, 'i');
        if (regex.test(lowerText)) {
          return country;
        }
      } else {
        if (lowerText.includes(patternLower)) {
          return country;
        }
      }
    }
  }
  
  return '';
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string, country: string): { phone: string; remaining: string } {
  // Try country-specific phone patterns first
  if (country && PHONE_PATTERNS[country]) {
    const pattern = PHONE_PATTERNS[country];
    const match = text.match(pattern);
    if (match) {
      const phone = match[0].trim();
      const remaining = text.replace(phone, '').trim();
      return { phone, remaining };
    }
  }
  
  // Generic phone patterns (ordered by specificity)
  const genericPatterns = [
    /\+\d{1,3}[\s\-()]?\d{1,4}[\s\-()]?\d{3,4}[\s\-()]?\d{4}/, // International: +86 138 0013 8000
    /\+\d{1,3}[\s\-()]?\d{2,4}[\s\-()]?\d{4}/, // Shorter international
    /Tel:?\s*([+\d\s\-()]+)/i, // Tel: prefix
    /Phone:?\s*([+\d\s\-()]+)/i, // Phone: prefix
    /电话:?\s*([+\d\s\-()]+)/, // 电话: prefix
  ];
  
  for (const pattern of genericPatterns) {
    const match = text.match(pattern);
    if (match) {
      let phone = match[0].replace(/^(Tel:|Phone:|电话:)\s*/i, '').trim();
      // Clean up phone number
      phone = phone.replace(/\s+/g, ' ').trim();
      const remaining = text.replace(match[0], '').trim();
      return { phone, remaining };
    }
  }
  
  return { phone: '', remaining: text };
}

/**
 * Extract postal code from text
 */
function extractPostalCode(text: string, country: string): { postalCode: string; remaining: string } {
  // Try country-specific pattern first
  if (country && POSTAL_PATTERNS[country]) {
    const pattern = POSTAL_PATTERNS[country];
    const match = text.match(pattern);
    if (match) {
      const postalCode = match[0];
      const remaining = text.replace(postalCode, '').trim();
      return { postalCode, remaining };
    }
  }
  
  // Generic postal patterns (ordered by specificity)
  const genericPatterns = [
    { pattern: /\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b/, country: 'Canada' }, // Canada: A1A 1A1
    { pattern: /\b[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}\b/, country: 'UK' }, // UK: SW1A 1AA
    { pattern: /\b\d{5}(-\d{4})?\b/, country: 'US' }, // US: 12345 or 12345-6789
    { pattern: /\b\d{6}\b/, country: 'China' }, // China: 123456
    { pattern: /\b\d{4}\b/, country: 'AU/NZ' }, // AU/NZ: 1234
  ];
  
  for (const { pattern } of genericPatterns) {
    const match = text.match(pattern);
    if (match) {
      const postalCode = match[0];
      const remaining = text.replace(postalCode, '').trim();
      return { postalCode, remaining };
    }
  }
  
  return { postalCode: '', remaining: text };
}

/**
 * Extract state/province from text
 */
function extractState(text: string, country: string): { state: string; remaining: string } {
  const upperText = text.toUpperCase();
  
  // US states
  if (country === 'United States' || country === '') {
    for (const state of US_STATES) {
      if (upperText.includes(` ${state} `) || upperText.endsWith(` ${state}`) || upperText.startsWith(`${state} `)) {
        const remaining = text.replace(new RegExp(`\\b${state}\\b`, 'i'), '').trim();
        return { state, remaining };
      }
    }
  }
  
  // Canadian provinces
  if (country === 'Canada' || country === '') {
    for (const province of CA_PROVINCES) {
      if (upperText.includes(` ${province} `) || upperText.endsWith(` ${province}`) || upperText.startsWith(`${province} `)) {
        const remaining = text.replace(new RegExp(`\\b${province}\\b`, 'i'), '').trim();
        return { state: province, remaining };
      }
    }
  }
  
  // Australian states
  if (country === 'Australia' || country === '') {
    for (const state of AU_STATES) {
      if (upperText.includes(` ${state} `) || upperText.endsWith(` ${state}`) || upperText.startsWith(`${state} `)) {
        const remaining = text.replace(new RegExp(`\\b${state}\\b`, 'i'), '').trim();
        return { state, remaining };
      }
    }
  }
  
  // Chinese provinces
  if (country === 'China' || country === '') {
    for (const province of CN_PROVINCES) {
      if (text.includes(province)) {
        const remaining = text.replace(province, '').trim();
        return { state: province, remaining };
      }
    }
  }
  
  return { state: '', remaining: text };
}

/**
 * Parse address text into structured fields
 */
export function parseAddress(input: string): ParsedAddress {
  const warnings: string[] = [];
  let remaining = input.trim();
  
  // Split into lines
  const lines = remaining.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  
  // Try to detect country from full text
  let country = detectCountry(remaining);
  
  // Extract phone
  const { phone, remaining: afterPhone } = extractPhone(remaining, country);
  remaining = afterPhone;
  
  // Extract postal code
  const { postalCode, remaining: afterPostal } = extractPostalCode(remaining, country);
  remaining = afterPostal;
  
  // Re-detect country if not found
  if (!country) {
    country = detectCountry(remaining);
  }
  
  // Extract state
  const { state, remaining: afterState } = extractState(remaining, country);
  remaining = afterState;
  
  // Try to extract recipient (first line if it looks like a name)
  let recipient = '';
  let addressLines: string[] = [];
  
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If first line doesn't contain numbers and is short, likely a name
    if (firstLine.length < 50 && !/\d/.test(firstLine) && !firstLine.match(/street|road|ave|blvd|dr|ln|ct/i)) {
      recipient = firstLine;
      addressLines = lines.slice(1);
    } else {
      addressLines = lines;
    }
  }
  
  // Try to extract city (usually before state/postal)
  let city = '';
  
  // US/Canada pattern: "City, ST 12345" or "City ST 12345"
  const usCaCityMatch = remaining.match(/([A-Za-z\s]+?)[,\s]+([A-Z]{2})\s+\d/);
  if (usCaCityMatch && usCaCityMatch[1]) {
    city = usCaCityMatch[1].trim();
  }
  
  // Australia/NZ pattern: "City ST 1234" or "City 1234"
  if (!city) {
    const auNzCityMatch = remaining.match(/([A-Za-z\s]+?)\s+([A-Z]{2,3})?\s*\d{4}/);
    if (auNzCityMatch && auNzCityMatch[1]) {
      city = auNzCityMatch[1].trim();
    }
  }
  
  // UK pattern: "City PostalCode" (e.g., "London SW1A 1AA")
  if (!city) {
    const ukCityMatch = remaining.match(/([A-Za-z\s]+?)\s+[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/);
    if (ukCityMatch && ukCityMatch[1]) {
      city = ukCityMatch[1].trim();
    }
  }
  
  // China pattern: extract city from Chinese address
  if (country === 'China' && !city) {
    // Look for city pattern like "深圳市" or "深圳"
    const cnCityMatch = remaining.match(/([\u4e00-\u9fa5]+?市)/);
    if (cnCityMatch) {
      city = cnCityMatch[1].replace(/市/g, '');
    }
  }
  
  // Chinese address parsing
  if (country === 'China') {
    // Try to parse Chinese address structure
    const cnPatterns = [
      /(.+省)?(.+市)?(.+区)?(.+)?/,
      /(.+自治区)?(.+市)?(.+区)?(.+)?/,
    ];
    
    for (const pattern of cnPatterns) {
      const match = remaining.match(pattern);
      if (match) {
        if (match[1]) city = match[1].replace(/省|自治区/g, '');
        if (match[2]) {
          if (!city) city = match[2].replace(/市/g, '');
          else addressLines.push(match[2]);
        }
        if (match[3]) addressLines.push(match[3]);
        if (match[4]) addressLines.push(match[4]);
        break;
      }
    }
  }
  
  // Build address lines
  const addressLine1 = addressLines.length > 0 ? addressLines[0] : '';
  const addressLine2 = addressLines.length > 1 ? addressLines.slice(1).join(', ') : '';
  
  // Generate warnings
  if (!recipient) warnings.push('未识别到收件人姓名');
  if (!phone) warnings.push('未识别到电话号码');
  if (!country) warnings.push('未识别到国家');
  if (!postalCode) warnings.push('未识别到邮编');
  if (!city && country !== 'China') warnings.push('未识别到城市');
  
  // Map country to display name
  let displayCountry = country;
  if (country === 'China') {
    displayCountry = '中国';
  }
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  const filledFields = [recipient, phone, displayCountry, postalCode, city, addressLine1].filter(f => f).length;
  if (filledFields >= 5) confidence = 'high';
  else if (filledFields >= 3) confidence = 'medium';
  
  return {
    recipient,
    phone,
    country: displayCountry,
    province: state,
    city,
    addressLine1,
    addressLine2,
    postalCode,
    rawInput: input.slice(0, 200),
    confidence,
    warnings,
  };
}

/**
 * Format parsed address for international shipping
 */
export function formatEnglishAddress(parsed: ParsedAddress): string {
  const lines: string[] = [];
  
  if (parsed.recipient) lines.push(parsed.recipient);
  if (parsed.addressLine1) lines.push(parsed.addressLine1);
  if (parsed.addressLine2) lines.push(parsed.addressLine2);
  
  const cityLine = [parsed.city, parsed.province, parsed.postalCode].filter(f => f).join(', ');
  if (cityLine) lines.push(cityLine);
  
  if (parsed.country) lines.push(parsed.country.toUpperCase());
  if (parsed.phone) lines.push(`Tel: ${parsed.phone}`);
  
  return lines.join('\n');
}

/**
 * Format parsed address in Chinese
 */
export function formatChineseAddress(parsed: ParsedAddress): string {
  const lines: string[] = [];
  
  if (parsed.recipient) lines.push(`收件人：${parsed.recipient}`);
  if (parsed.phone) lines.push(`电话：${parsed.phone}`);
  if (parsed.country) lines.push(`国家：${parsed.country}`);
  if (parsed.province) lines.push(`省/州：${parsed.province}`);
  if (parsed.city) lines.push(`城市：${parsed.city}`);
  if (parsed.addressLine1) lines.push(`地址：${parsed.addressLine1}`);
  if (parsed.addressLine2) lines.push(`    ${parsed.addressLine2}`);
  if (parsed.postalCode) lines.push(`邮编：${parsed.postalCode}`);
  
  return lines.join('\n');
}

/**
 * Format parsed address for line-by-line printing
 */
export function formatLineByLineAddress(parsed: ParsedAddress): string {
  const lines: string[] = [];
  
  if (parsed.recipient) lines.push(`Recipient: ${parsed.recipient}`);
  if (parsed.phone) lines.push(`Phone: ${parsed.phone}`);
  if (parsed.addressLine1) lines.push(`Address Line 1: ${parsed.addressLine1}`);
  if (parsed.addressLine2) lines.push(`Address Line 2: ${parsed.addressLine2}`);
  if (parsed.city) lines.push(`City: ${parsed.city}`);
  if (parsed.province) lines.push(`State/Province: ${parsed.province}`);
  if (parsed.postalCode) lines.push(`Postal Code: ${parsed.postalCode}`);
  if (parsed.country) lines.push(`Country: ${parsed.country}`);
  
  return lines.join('\n');
}
