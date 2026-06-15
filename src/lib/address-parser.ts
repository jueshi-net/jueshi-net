/**
 * Address Parser v3 — Line-based parsing with country-specific rules
 * Supports: US, Canada, UK, Australia, New Zealand, China
 * No external API calls, no database, no server storage
 * 
 * Key design: identify the "city line" (the line containing postal code + state)
 * and extract city from that same line.
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

// ─── Country detection ───────────────────────────────────────────────

const COUNTRY_ALIASES: Array<{ canonical: string; display: string; patterns: RegExp[] }> = [
  {
    canonical: 'New Zealand', display: 'New Zealand',
    patterns: [/\bnew\s*zealand\b/i, /\bNZ\b/i, /新西兰/],
  },
  {
    canonical: 'United Kingdom', display: 'United Kingdom',
    patterns: [/\bunited\s*kingdom\b/i, /\bUK\b/i, /\bbritain\b/i, /\bengland\b/i, /\bscotland\b/i, /\bwales\b/i, /英国/, /英格兰/],
  },
  {
    canonical: 'United States', display: 'United States',
    patterns: [/\bunited\s*states\b/i, /\bUSA\b/i, /\bUS\b(?!\s*\d)/i, /美国/, /美利坚/],
  },
  {
    canonical: 'Australia', display: 'Australia',
    patterns: [/\baustralia\b/i, /澳洲/, /澳大利亚/],
  },
  {
    canonical: 'Canada', display: 'Canada',
    patterns: [/\bcanada\b/i, /加拿大/],
  },
  {
    canonical: 'China', display: '中国',
    patterns: [/\bchina\b/i, /\bPRC\b/i, /中国/, /中华人民共和国/],
  },
];

function detectCountry(lines: string[]): { canonical: string; display: string } | null {
  const fullText = lines.join('\n');
  for (const c of COUNTRY_ALIASES) {
    for (const p of c.patterns) {
      if (p.test(fullText)) return { canonical: c.canonical, display: c.display };
    }
  }
  return null;
}

// ─── Phone extraction ────────────────────────────────────────────────

const PHONE_REGEX = /\+?\d{1,3}[\s\-()]?\d{1,4}[\s\-()]?\d{3,4}[\s\-()]?\d{3,5}/;

function extractPhone(lines: string[]): { phone: string; cleanedLines: string[] } {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(PHONE_REGEX);
    if (m) {
      const phone = m[0].replace(/\s+/g, ' ').trim();
      const digitCount = (phone.match(/\d/g) || []).length;
      if (digitCount >= 8) {
        const cleaned = lines[i].replace(m[0], '').trim();
        const cleanedLines = [...lines];
        if (cleaned.length > 0) {
          cleanedLines[i] = cleaned;
        } else {
          cleanedLines[i] = '';
        }
        return { phone, cleanedLines: cleanedLines.filter(l => l.length > 0) };
      }
    }
  }
  return { phone: '', cleanedLines: lines };
}

// ─── Postal code patterns ────────────────────────────────────────────

const POSTAL_PATTERNS: Record<string, RegExp> = {
  'United States': /\b(\d{5}(?:-\d{4})?)\b/,
  'Canada': /\b([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)\b/,
  'United Kingdom': /\b([A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2})\b/,
  'Australia': /\b(\d{4})\b/,
  'New Zealand': /\b(\d{4})\b/,
  'China': /\b(\d{6})\b/,
};

// ─── State/Province codes ────────────────────────────────────────────

const US_STATES = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']);
const CA_PROVINICES = new Set(['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']);
const AU_STATES = new Set(['NSW','VIC','QLD','SA','WA','TAS','NT','ACT']);

const CN_PROVINCE_LIST = [
  '北京','天津','上海','重庆',
  '河北','山西','辽宁','吉林','黑龙江',
  '江苏','浙江','安徽','福建','江西','山东',
  '河南','湖北','湖南','广东','海南',
  '四川','贵州','云南','陕西','甘肃','青海',
  '台湾','内蒙古','广西','西藏','宁夏','新疆',
  '香港','澳门',
];

// ─── Main parse function ─────────────────────────────────────────────

export function parseAddress(input: string): ParsedAddress {
  const warnings: string[] = [];
  
  // Step 1: Normalize
  let lines = input.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) {
    return emptyResult(input);
  }
  
  // Step 2: Detect country
  const countryResult = detectCountry(lines);
  const country = countryResult?.canonical || '';
  const displayCountry = countryResult?.display || '';
  
  // Step 3: Remove country-only lines
  lines = lines.filter(l => {
    const lower = l.toLowerCase().trim();
    return !/^(united states|usa|us|america|canada|united kingdom|uk|britain|england|australia|au|new zealand|nz|china|prc|中国|美国|加拿大|英国|澳大利亚|新西兰|中华人民共和国)$/.test(lower);
  });
  
  // Step 4: Extract phone
  const { phone, cleanedLines: afterPhone } = extractPhone(lines);
  lines = afterPhone;
  
  // Step 5: Country-specific parsing
  if (country === 'China') {
    return parseChineseAddress(lines, displayCountry, phone, warnings, input);
  } else {
    return parseWesternAddress(lines, country, displayCountry, phone, warnings, input);
  }
}

// ─── Western address parser (US, CA, UK, AU, NZ) ────────────────────

function parseWesternAddress(
  lines: string[],
  country: string,
  displayCountry: string,
  phone: string,
  warnings: string[],
  input: string
): ParsedAddress {
  const postalPattern = POSTAL_PATTERNS[country];
  const stateCodes = country === 'United States' ? US_STATES
    : country === 'Canada' ? CA_PROVINICES
    : country === 'Australia' ? AU_STATES
    : null;
  
  let postalCode = '';
  let state = '';
  let city = '';
  let cityLineIndex = -1;
  
  // Find the "city line" — the line containing the postal code
  for (let i = 0; i < lines.length; i++) {
    if (postalPattern) {
      const postalMatch = lines[i].match(postalPattern);
      if (postalMatch) {
        postalCode = postalMatch[1];
        cityLineIndex = i;
        
        // Remove postal code from the line
        let line = lines[i].replace(postalMatch[0], '').replace(/,\s*$/, '').trim();
        
        // Extract state from the same line
        if (stateCodes) {
          const stateMatch = line.match(/\b([A-Z]{2,3})\b/);
          if (stateMatch && stateCodes.has(stateMatch[1])) {
            state = stateMatch[1];
            line = line.replace(new RegExp(`\\b${stateMatch[1]}\\b`), '').replace(/,\s*$/, '').replace(/^\s*,?\s*/, '').trim();
          }
        }
        
        // Remaining text on this line is the city
        // For US/CA: "Mountain View" or "Mountain View,"
        // For UK: "London" or "London,"
        // For AU/NZ: "Sydney" or "Sydney,"
        city = line.replace(/,\s*$/, '').replace(/^\s*,?\s*/, '').trim();
        
        break;
      }
    }
  }
  
  // If no postal code found, try to find state code on any line
  if (!postalCode && stateCodes) {
    for (let i = 0; i < lines.length; i++) {
      const stateMatch = lines[i].match(/\b([A-Z]{2,3})\b/);
      if (stateMatch && stateCodes.has(stateMatch[1])) {
        state = stateMatch[1];
        cityLineIndex = i;
        let line = lines[i].replace(new RegExp(`\\b${stateMatch[1]}\\b`), '').replace(/,\s*$/, '').trim();
        city = line.replace(/,\s*$/, '').trim();
        break;
      }
    }
  }
  
  // Now determine recipient and street address
  // The city line is usually the second-to-last line
  // Recipient is the first line (if it looks like a name)
  // Street address is between recipient and city line
  
  let recipient = '';
  let addressLines: string[] = [];
  
  // Check if first line is a name
  if (lines.length > 0 && isLikelyName(lines[0], country)) {
    recipient = lines[0].trim();
    // Everything between first line and city line is street address
    for (let i = 1; i < lines.length; i++) {
      if (i === cityLineIndex) continue; // Skip city line (already processed)
      addressLines.push(lines[i]);
    }
  } else {
    // No recipient found, all non-city lines are address
    for (let i = 0; i < lines.length; i++) {
      if (i === cityLineIndex) continue;
      addressLines.push(lines[i]);
    }
  }
  
  const addressLine1 = addressLines.length > 0 ? addressLines[0].replace(/^,\s*/, '').trim() : '';
  const addressLine2 = addressLines.length > 1 ? addressLines.slice(1).map(l => l.replace(/^,\s*/, '').trim()).filter(l => l).join(', ') : '';
  
  // Warnings
  if (!recipient) warnings.push('未识别到收件人姓名');
  if (!phone) warnings.push('未识别到电话号码');
  if (!displayCountry) warnings.push('未识别到国家');
  if (!postalCode) warnings.push('未识别到邮编');
  if (!city) warnings.push('未识别到城市');
  
  const filledFields = [recipient, phone, displayCountry, postalCode, city, addressLine1].filter(f => f).length;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (filledFields >= 5) confidence = 'high';
  else if (filledFields >= 3) confidence = 'medium';
  
  return {
    recipient, phone, country: displayCountry, province: state, city,
    addressLine1, addressLine2, postalCode,
    rawInput: input.slice(0, 200), confidence, warnings,
  };
}

// ─── Chinese address parser ──────────────────────────────────────────

function parseChineseAddress(
  lines: string[],
  displayCountry: string,
  phone: string,
  warnings: string[],
  input: string
): ParsedAddress {
  let province = '';
  let city = '';
  let postalCode = '';
  let recipient = '';
  
  // Find the line containing province
  let provinceLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    for (const prov of CN_PROVINCE_LIST) {
      const provRegex = new RegExp(`(${prov}(?:省|自治区|壮族自治区|回族自治区|维吾尔自治区)?)`);
      const m = lines[i].match(provRegex);
      if (m) {
        province = m[1];
        provinceLineIndex = i;
        // Remove province from the line
        lines[i] = lines[i].replace(m[1], '').replace(/^\s*,?\s*/, '').trim();
        break;
      }
    }
    if (province) break;
  }
  
  // Find city (X市) — usually on the same line as province or next line
  for (let i = 0; i < lines.length; i++) {
    const cityMatch = lines[i].match(/([\u4e00-\u9fa5]{2,4}市)/);
    if (cityMatch) {
      city = cityMatch[1];
      lines[i] = lines[i].replace(cityMatch[1], '').replace(/^\s*,?\s*/, '').trim();
      break;
    }
  }
  
  // Find postal code (6 digits)
  for (let i = lines.length - 1; i >= 0; i--) {
    const postalMatch = lines[i].match(/\b(\d{6})\b/);
    if (postalMatch) {
      postalCode = postalMatch[1];
      lines[i] = lines[i].replace(postalMatch[0], '').replace(/^\s*,?\s*/, '').trim();
      break;
    }
  }
  
  // Find recipient (first line that looks like a Chinese name: 2-4 chars)
  if (lines.length > 0 && /^[\u4e00-\u9fa5]{2,4}$/.test(lines[0].trim())) {
    recipient = lines[0].trim();
    lines = lines.slice(1);
  }
  
  // Remove empty lines and country remnants
  lines = lines.filter(l => {
    const trimmed = l.trim();
    if (!trimmed) return false;
    // Remove lines that are just the country name
    if (/^(中国|中华人民共和国|China|PRC)$/i.test(trimmed)) return false;
    return true;
  });
  
  // Remaining lines are street address
  const addressLine1 = lines.length > 0 ? lines[0].trim() : '';
  const addressLine2 = lines.length > 1 ? lines.slice(1).map(l => l.trim()).filter(l => l).join(', ') : '';
  
  // Warnings
  if (!recipient) warnings.push('未识别到收件人姓名');
  if (!phone) warnings.push('未识别到电话号码');
  if (!displayCountry) warnings.push('未识别到国家');
  if (!postalCode) warnings.push('未识别到邮编');
  if (!city) warnings.push('未识别到城市');
  
  const filledFields = [recipient, phone, displayCountry, postalCode, city, addressLine1].filter(f => f).length;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (filledFields >= 5) confidence = 'high';
  else if (filledFields >= 3) confidence = 'medium';
  
  return {
    recipient, phone, country: displayCountry, province, city,
    addressLine1, addressLine2, postalCode,
    rawInput: input.slice(0, 200), confidence, warnings,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function isLikelyName(line: string, country: string): boolean {
  if (!line || line.length > 60) return false;
  const trimmed = line.trim();
  
  if (country === 'China') {
    return /^[\u4e00-\u9fa5]{2,4}$/.test(trimmed);
  }
  
  if (/\d/.test(trimmed)) return false;
  if (/street|road|ave|blvd|dr|ln|ct|hwy|apt|suite|unit|floor|parkway/i.test(trimmed)) return false;
  if (/phone|tel|fax|email|www|http/i.test(trimmed)) return false;
  
  const words = trimmed.split(/\s+/);
  if (words.length < 1 || words.length > 5) return false;
  
  return words.every(w => /^[A-Z][a-zA-Z'.-]*$/.test(w));
}

function emptyResult(input: string): ParsedAddress {
  return {
    recipient: '', phone: '', country: '', province: '', city: '',
    addressLine1: '', addressLine2: '', postalCode: '',
    rawInput: input.slice(0, 200), confidence: 'low',
    warnings: ['地址为空'],
  };
}

// ─── Format helpers ──────────────────────────────────────────────────

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
