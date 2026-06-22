/**
 * Country Configuration
 *
 * Centralized static country metadata used by country landing pages and the
 * /countries index page. Acts as a fallback when DB (LandingPage) data is
 * incomplete, and can be extended later for admin configuration.
 *
 * NOTE: This is intentionally a static, dependency-free module so it can be
 * imported from both server and client components.
 */

export type PostalDataStatus =
  | 'full'
  | 'partial'
  | 'reference_only'
  | 'none';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CountryConfig {
  /** URL slug, e.g. "canada" */
  slug: string;
  /** ISO 3166-1 alpha-2 code, e.g. "CA" */
  countryCode: string;
  /** English short name */
  nameEn: string;
  /** Chinese short name */
  nameZh: string;
  /** Flag emoji */
  flagEmoji: string;
  /** Capital city */
  capital: string;
  /** Major cities (for quick display) */
  majorCities: string[];
  /** IANA timezone identifiers covering the country */
  timezones: string[];
  /** Primary timezone used for the local-time card */
  defaultTimezone: string;
  /** ISO 4217 currency code, e.g. "CAD" */
  currencyCode: string;
  /** Currency display name, e.g. "Canadian Dollar" */
  currencyName: string;
  /** E.164 dialing code, e.g. "+1" */
  dialingCode: string;
  /** Official / widely-spoken languages */
  languages: string[];
  /** Coverage status of our postal-code dataset */
  postalDataStatus: PostalDataStatus;
  /** Approximate number of postal records we hold */
  postalRecordCount: number;
  /** Localized name for "postal code", e.g. "Postal Code" / "Postcode" / "Poskod" */
  postalCodeName: string;
  /** Format hint, e.g. "ANA NAN" */
  postalCodeFormat: string;
  /** Multiline address format example */
  addressFormatExample: string;
  /** Official postal service URL */
  officialPostalUrl: string;
  /** Official customs authority URL, or null */
  officialCustomsUrl: string | null;
  /** Official immigration authority URL, or null */
  officialImmigrationUrl: string | null;
  /** Hero title (h1) for the country page */
  heroTitle: string;
  /** Hero subtitle shown under the title */
  heroSubtitle: string;
  /** SEO <title> */
  seoTitle: string;
  /** SEO meta description */
  seoDescription: string;
  /** Slugs of related tools to surface on the page */
  relatedToolSlugs: string[];
  /** Slugs of related guides to surface on the page */
  relatedGuideSlugs: string[];
  /** FAQ items (Chinese) */
  faqItems: FaqItem[];
  /** Hot search keywords for the country */
  hotSearches: string[];
  /** Sort order on the /countries index (lower = earlier) */
  sortOrder: number;
}

/* ------------------------------------------------------------------ */
/* Helpers for building FAQ blocks                                    */
/* ------------------------------------------------------------------ */

function buildStandardFaqs(
  postalName: string,
  addressExample: string,
): FaqItem[] {
  return [
    {
      question: `这个国家的邮编叫什么？`,
      answer: `${postalName}。在填写国际快递面单或在线表单时，请按当地规范填写。`,
    },
    {
      question: `地址格式怎么写？`,
      answer: `参考格式如下：\n${addressExample}\n请确保邮编与所在城市/省份匹配，以免影响派送。`,
    },
    {
      question: `地图结果是否代表精确邮编位置？`,
      answer: `地图参考按城市/地区搜索，不代表精确邮编位置。邮编覆盖范围可能跨越多个街区，如需精确投递请以当地邮政官方查询结果为准。`,
    },
    {
      question: `找不到邮编时怎么办？`,
      answer: `可尝试更换城市/地区名称、检查拼写，或直接访问当地邮政官方网站查询。如仍无法找到，建议联系收件人确认邮编。`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Country definitions                                                */
/* ------------------------------------------------------------------ */

const canadaAddressExample = `John Smith
123 Main St W
Toronto ON  M5V 2T6
Canada`;

const usAddressExample = `John Smith
123 Main St
New York, NY 10001
United States`;

const japanAddressExample = `〒100-0001
Tokyo-to, Chiyoda-ku
Chiyoda 1-1-1
Japan`;

const malaysiaAddressExample = `John Smith
123, Jalan Bukit Bintang
55100 Kuala Lumpur
Malaysia`;

const ukAddressExample = `John Smith
10 Downing Street
London
SW1A 2AA
United Kingdom`;

const australiaAddressExample = `John Smith
123 George Street
Sydney NSW 2000
Australia`;

const singaporeAddressExample = `John Smith
123 Orchard Road
#05-01 Orchard Towers
Singapore 238878
Singapore`;

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  canada: {
    slug: 'canada',
    countryCode: 'CA',
    nameEn: 'Canada',
    nameZh: '加拿大',
    flagEmoji: '🇨🇦',
    capital: 'Ottawa',
    majorCities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    timezones: [
      'America/Toronto',
      'America/Vancouver',
      'America/Edmonton',
      'America/Winnipeg',
      'America/Halifax',
    ],
    defaultTimezone: 'America/Toronto',
    currencyCode: 'CAD',
    currencyName: 'Canadian Dollar',
    dialingCode: '+1',
    languages: ['English', 'French'],
    postalDataStatus: 'full',
    postalRecordCount: 901432,
    postalCodeName: 'Postal Code',
    postalCodeFormat: 'ANA NAN',
    addressFormatExample: canadaAddressExample,
    officialPostalUrl: 'https://www.canadapost.ca',
    officialCustomsUrl: 'https://www.cbsa-asfc.gc.ca',
    officialImmigrationUrl:
      'https://www.canada.ca/en/immigration-refugees-citizenship.html',
    heroTitle: '加拿大邮编与地址查询',
    heroSubtitle:
      '一站式查询加拿大 Postal Code、地址格式、时区与官方入口，助力跨境物流与出海业务。',
    seoTitle: '加拿大邮编查询 | Postal Code、地址格式与时区 - 奇熊',
    seoDescription:
      '查询加拿大邮政编码 (Postal Code)、地址格式、时区、货币及官方邮政/海关/移民入口，支持跨境物流、快递面单填写与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['canada-shipping-guide'],
    faqItems: buildStandardFaqs('Postal Code', canadaAddressExample),
    hotSearches: ['Toronto 邮编', 'Vancouver 邮编', 'Montreal 邮编', 'Calgary 邮编'],
    sortOrder: 1,
  },

  'united-states': {
    slug: 'united-states',
    countryCode: 'US',
    nameEn: 'United States',
    nameZh: '美国',
    flagEmoji: '🇺🇸',
    capital: 'Washington, D.C.',
    majorCities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco'],
    timezones: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
    ],
    defaultTimezone: 'America/New_York',
    currencyCode: 'USD',
    currencyName: 'US Dollar',
    dialingCode: '+1',
    languages: ['English'],
    postalDataStatus: 'full',
    postalRecordCount: 41488,
    postalCodeName: 'ZIP Code',
    postalCodeFormat: '12345',
    addressFormatExample: usAddressExample,
    officialPostalUrl: 'https://tools.usps.com',
    officialCustomsUrl: 'https://www.cbp.gov',
    officialImmigrationUrl: 'https://www.uscis.gov',
    heroTitle: '美国邮编与地址查询',
    heroSubtitle:
      '一站式查询美国 ZIP Code、地址格式、时区与官方入口，助力跨境电商与物流派送。',
    seoTitle: '美国邮编查询 | ZIP Code、地址格式与时区 - 奇熊',
    seoDescription:
      '查询美国邮政编码 (ZIP Code)、地址格式、时区、货币及 USPS/CBP/USCIS 官方入口，支持跨境物流与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['us-shipping-guide'],
    faqItems: buildStandardFaqs('ZIP Code', usAddressExample),
    hotSearches: ['New York 邮编', 'Los Angeles 邮编', 'Chicago 邮编', 'Houston 邮编'],
    sortOrder: 2,
  },

  japan: {
    slug: 'japan',
    countryCode: 'JP',
    nameEn: 'Japan',
    nameZh: '日本',
    flagEmoji: '🇯🇵',
    capital: 'Tokyo',
    majorCities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
    timezones: ['Asia/Tokyo'],
    defaultTimezone: 'Asia/Tokyo',
    currencyCode: 'JPY',
    currencyName: 'Japanese Yen',
    dialingCode: '+81',
    languages: ['Japanese'],
    postalDataStatus: 'full',
    postalRecordCount: 142577,
    postalCodeName: '郵便番号 (〒)',
    postalCodeFormat: 'NNN-NNNN',
    addressFormatExample: japanAddressExample,
    officialPostalUrl: 'https://www.post.japanpost.jp',
    officialCustomsUrl: 'https://www.customs.go.jp',
    officialImmigrationUrl: 'https://www.moj.go.jp/isa/',
    heroTitle: '日本邮编与地址查询',
    heroSubtitle:
      '一站式查询日本郵便番号 (〒)、地址格式、时区与官方入口，助力中日跨境物流与电商。',
    seoTitle: '日本邮编查询 | 郵便番号、地址格式与时区 - 奇熊',
    seoDescription:
      '查询日本邮政编码 (郵便番号 〒)、地址格式、时区、货币及日本邮政/海关/入管官方入口，支持中日跨境物流与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['japan-shipping-guide'],
    faqItems: buildStandardFaqs('郵便番号 (〒)', japanAddressExample),
    hotSearches: ['东京 邮编', '大阪 邮编', '京都 邮编', '横滨 邮编'],
    sortOrder: 3,
  },

  malaysia: {
    slug: 'malaysia',
    countryCode: 'MY',
    nameEn: 'Malaysia',
    nameZh: '马来西亚',
    flagEmoji: '🇲🇾',
    capital: 'Kuala Lumpur',
    majorCities: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Kota Kinabalu', 'Melaka'],
    timezones: ['Asia/Kuala_Lumpur'],
    defaultTimezone: 'Asia/Kuala_Lumpur',
    currencyCode: 'MYR',
    currencyName: 'Malaysian Ringgit',
    dialingCode: '+60',
    languages: ['Malay', 'English', 'Chinese', 'Tamil'],
    postalDataStatus: 'full',
    postalRecordCount: 2757,
    postalCodeName: 'Poskod',
    postalCodeFormat: 'NNNNN',
    addressFormatExample: malaysiaAddressExample,
    officialPostalUrl: 'https://www.pos.com.my',
    officialCustomsUrl: 'https://www.customs.gov.my',
    officialImmigrationUrl: 'https://www.imi.gov.my',
    heroTitle: '马来西亚邮编与地址查询',
    heroSubtitle:
      '一站式查询马来西亚 Poskod、地址格式、时区与官方入口，助力中国—东盟跨境物流。',
    seoTitle: '马来西亚邮编查询 | Poskod、地址格式与时区 - 奇熊',
    seoDescription:
      '查询马来西亚邮政编码 (Poskod)、地址格式、时区、货币及 Pos Malaysia/海关/移民局官方入口，支持中马跨境物流与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['malaysia-shipping-guide'],
    faqItems: buildStandardFaqs('Poskod', malaysiaAddressExample),
    hotSearches: ['吉隆坡 邮编', '槟城 邮编', '新山 邮编', '亚庇 邮编'],
    sortOrder: 4,
  },

  'united-kingdom': {
    slug: 'united-kingdom',
    countryCode: 'GB',
    nameEn: 'United Kingdom',
    nameZh: '英国',
    flagEmoji: '🇬🇧',
    capital: 'London',
    majorCities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'],
    timezones: ['Europe/London'],
    defaultTimezone: 'Europe/London',
    currencyCode: 'GBP',
    currencyName: 'Pound Sterling',
    dialingCode: '+44',
    languages: ['English'],
    postalDataStatus: 'full',
    postalRecordCount: 1820770,
    postalCodeName: 'Postcode',
    postalCodeFormat: 'ANA NAA',
    addressFormatExample: ukAddressExample,
    officialPostalUrl: 'https://www.royalmail.com',
    officialCustomsUrl: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
    officialImmigrationUrl: 'https://www.gov.uk/browse/visas-immigration',
    heroTitle: '英国邮编与地址查询',
    heroSubtitle:
      '一站式查询英国 Postcode、地址格式、时区与官方入口，助力中英跨境物流与电商。',
    seoTitle: '英国邮编查询 | Postcode、地址格式与时区 - 奇熊',
    seoDescription:
      '查询英国邮政编码 (Postcode)、地址格式、时区、货币及 Royal Mail/HMRC/UKVI 官方入口，支持中英跨境物流与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['uk-shipping-guide'],
    faqItems: buildStandardFaqs('Postcode', ukAddressExample),
    hotSearches: ['London 邮编', 'Manchester 邮编', 'Birmingham 邮编', 'Edinburgh 邮编'],
    sortOrder: 5,
  },

  australia: {
    slug: 'australia',
    countryCode: 'AU',
    nameEn: 'Australia',
    nameZh: '澳大利亚',
    flagEmoji: '🇦🇺',
    capital: 'Canberra',
    majorCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    timezones: [
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Brisbane',
      'Australia/Perth',
      'Australia/Adelaide',
    ],
    defaultTimezone: 'Australia/Sydney',
    currencyCode: 'AUD',
    currencyName: 'Australian Dollar',
    dialingCode: '+61',
    languages: ['English'],
    postalDataStatus: 'full',
    postalRecordCount: 3171,
    postalCodeName: 'Postcode',
    postalCodeFormat: 'NNNN',
    addressFormatExample: australiaAddressExample,
    officialPostalUrl: 'https://auspost.com.au',
    officialCustomsUrl: 'https://www.abf.gov.au',
    officialImmigrationUrl: 'https://immi.homeaffairs.gov.au',
    heroTitle: '澳大利亚邮编与地址查询',
    heroSubtitle:
      '一站式查询澳大利亚 Postcode、地址格式、时区与官方入口，助力中澳跨境物流与电商。',
    seoTitle: '澳大利亚邮编查询 | Postcode、地址格式与时区 - 奇熊',
    seoDescription:
      '查询澳大利亚邮政编码 (Postcode)、地址格式、时区、货币及 AusPost/ABF/内政部官方入口，支持中澳跨境物流与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['australia-shipping-guide'],
    faqItems: buildStandardFaqs('Postcode', australiaAddressExample),
    hotSearches: ['Sydney 邮编', 'Melbourne 邮编', 'Brisbane 邮编', 'Perth 邮编'],
    sortOrder: 6,
  },

  singapore: {
    slug: 'singapore',
    countryCode: 'SG',
    nameEn: 'Singapore',
    nameZh: '新加坡',
    flagEmoji: '🇸🇬',
    capital: 'Singapore',
    majorCities: ['Singapore', 'Jurong', 'Tampines', 'Woodlands'],
    timezones: ['Asia/Singapore'],
    defaultTimezone: 'Asia/Singapore',
    currencyCode: 'SGD',
    currencyName: 'Singapore Dollar',
    dialingCode: '+65',
    languages: ['English', 'Malay', 'Chinese', 'Tamil'],
    postalDataStatus: 'full',
    postalRecordCount: 121135,
    postalCodeName: 'Postal Code',
    postalCodeFormat: 'NNNNNN',
    addressFormatExample: singaporeAddressExample,
    officialPostalUrl: 'https://www.singpost.com',
    officialCustomsUrl: 'https://www.customs.gov.sg',
    officialImmigrationUrl: 'https://www.ica.gov.sg',
    heroTitle: '新加坡邮编与地址查询',
    heroSubtitle:
      '一站式查询新加坡 Postal Code、地址格式、时区与官方入口，助力中新跨境物流与电商。',
    seoTitle: '新加坡邮编查询 | Postal Code、地址格式与时区 - 奇熊',
    seoDescription:
      '查询新加坡邮政编码 (Postal Code)、地址格式、时区、货币及 SingPost/海关/ICA 官方入口，支持中新跨境物流与出海合规。',
    relatedToolSlugs: ['postal-code', 'address-formatter'],
    relatedGuideSlugs: ['singapore-shipping-guide'],
    faqItems: buildStandardFaqs('Postal Code', singaporeAddressExample),
    hotSearches: ['新加坡 邮编', 'Jurong 邮编', 'Tampines 邮编', 'Woodlands 邮编'],
    sortOrder: 7,
  },
};

/* ------------------------------------------------------------------ */
/* Lookup helpers                                                     */
/* ------------------------------------------------------------------ */

/** Look up a country config by its URL slug (e.g. "canada"). */
export function getCountryBySlug(slug: string): CountryConfig | null {
  return COUNTRY_CONFIGS[slug] ?? null;
}

/** Look up a country config by its ISO 3166-1 alpha-2 code (e.g. "CA"). */
export function getCountryByCode(code: string): CountryConfig | null {
  const upper = code.toUpperCase();
  for (const config of Object.values(COUNTRY_CONFIGS)) {
    if (config.countryCode === upper) return config;
  }
  return null;
}

/** Return all configured countries, sorted by sortOrder ascending. */
export function getAllCountries(): CountryConfig[] {
  return Object.values(COUNTRY_CONFIGS).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}
