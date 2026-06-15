/**
 * Postal Code Official Links Configuration
 * 各国邮政官方查询入口
 */

export interface OfficialPostalLink {
  countryCode: string;
  name: string;
  nameEn: string;
  officialUrl: string;
  lookupUrl?: string;
  phoneCode?: string;
  timezone?: string;
  postalFormat?: string;
  examplePostal?: string;
  verified?: boolean;
}

/**
 * 各国邮政官方链接配置
 * 仅包含已验证的官方链接
 */
export const OFFICIAL_POSTAL_LINKS: Record<string, OfficialPostalLink> = {
  CA: {
    countryCode: 'CA',
    name: '加拿大邮政',
    nameEn: 'Canada Post',
    officialUrl: 'https://www.canadapost-postescanada.ca/',
    lookupUrl: 'https://www.canadapost-postescanada.ca/pccl/pcl/en/find-a-postal-code',
    phoneCode: '+1',
    timezone: 'America/Toronto',
    postalFormat: 'ANA NAN',
    examplePostal: 'M5V 2T6',
    verified: true,
  },
  US: {
    countryCode: 'US',
    name: '美国邮政',
    nameEn: 'USPS',
    officialUrl: 'https://www.usps.com/',
    lookupUrl: 'https://tools.usps.com/go/ZipLookupAction!input.action',
    phoneCode: '+1',
    timezone: 'America/New_York',
    postalFormat: 'XXXXX 或 XXXXX-XXXX',
    examplePostal: '10001',
    verified: true,
  },
  GB: {
    countryCode: 'GB',
    name: '英国皇家邮政',
    nameEn: 'Royal Mail',
    officialUrl: 'https://www.royalmail.com/',
    lookupUrl: 'https://www.royalmail.com/find-a-postcode',
    phoneCode: '+44',
    timezone: 'Europe/London',
    postalFormat: 'AA9A 9AA',
    examplePostal: 'SW1A 1AA',
    verified: true,
  },
  AU: {
    countryCode: 'AU',
    name: '澳大利亚邮政',
    nameEn: 'Australia Post',
    officialUrl: 'https://auspost.com.au/',
    lookupUrl: 'https://auspost.com.au/business/solutions/data-and-insights/postcode-finder',
    phoneCode: '+61',
    timezone: 'Australia/Sydney',
    postalFormat: 'XXXX',
    examplePostal: '2000',
    verified: true,
  },
  NZ: {
    countryCode: 'NZ',
    name: '新西兰邮政',
    nameEn: 'NZ Post',
    officialUrl: 'https://www.nzpost.co.nz/',
    lookupUrl: 'https://www.nzpost.co.nz/tools/find-a-postcode',
    phoneCode: '+64',
    timezone: 'Pacific/Auckland',
    postalFormat: 'XXXX',
    examplePostal: '1010',
    verified: true,
  },
  JP: {
    countryCode: 'JP',
    name: '日本邮政',
    nameEn: 'Japan Post',
    officialUrl: 'https://www.japanpost.jp/',
    lookupUrl: 'https://www.japanpost.jp/zipcode/',
    phoneCode: '+81',
    timezone: 'Asia/Tokyo',
    postalFormat: 'XXX-XXXX',
    examplePostal: '100-0001',
    verified: true,
  },
  SG: {
    countryCode: 'SG',
    name: '新加坡邮政',
    nameEn: 'SingPost',
    officialUrl: 'https://www.singpost.com/',
    lookupUrl: 'https://www.singpost.com/postal-services/find-postal-code',
    phoneCode: '+65',
    timezone: 'Asia/Singapore',
    postalFormat: 'XXXXXX',
    examplePostal: '018956',
    verified: true,
  },
  MY: {
    countryCode: 'MY',
    name: '马来西亚邮政',
    nameEn: 'Pos Malaysia',
    officialUrl: 'https://www.pos.com.my/',
    lookupUrl: 'https://www.pos.com.my/postcode-finder/',
    phoneCode: '+60',
    timezone: 'Asia/Kuala_Lumpur',
    postalFormat: 'XXXXX',
    examplePostal: '50450',
    verified: true,
  },
  KR: {
    countryCode: 'KR',
    name: '韩国邮政',
    nameEn: 'Korea Post',
    officialUrl: 'https://www.epost.go.kr/',
    lookupUrl: 'https://www.epost.go.kr/zipcode/zipcode.search.jsp',
    phoneCode: '+82',
    timezone: 'Asia/Seoul',
    postalFormat: 'XXXXX',
    examplePostal: '04524',
    verified: true,
  },
  CN: {
    countryCode: 'CN',
    name: '中国邮政',
    nameEn: 'China Post',
    officialUrl: 'https://www.chinapost.com.cn/',
    lookupUrl: 'https://www.chinapost.com.cn/youbian/',
    phoneCode: '+86',
    timezone: 'Asia/Shanghai',
    postalFormat: 'XXXXXX',
    examplePostal: '100000',
    verified: true,
  },
  HK: {
    countryCode: 'HK',
    name: '香港邮政',
    nameEn: 'Hongkong Post',
    officialUrl: 'https://www.hongkongpost.hk/',
    lookupUrl: 'https://www.hongkongpost.hk/tc/address_finder/index.htm',
    phoneCode: '+852',
    timezone: 'Asia/Hong_Kong',
    postalFormat: '无邮编制度',
    examplePostal: '999077',
    verified: true,
  },
  TW: {
    countryCode: 'TW',
    name: '中华邮政（中国台湾）',
    nameEn: 'Chunghwa Post (Taiwan, China)',
    officialUrl: 'https://www.post.gov.tw/',
    lookupUrl: 'https://posts.chn.com.tw/ChnDefault.aspx',
    phoneCode: '+886',
    timezone: 'Asia/Taipei',
    postalFormat: 'XXX 或 XXXXXX',
    examplePostal: '100',
    verified: true,
  },
  DE: {
    countryCode: 'DE',
    name: '德国邮政',
    nameEn: 'Deutsche Post',
    officialUrl: 'https://www.deutschepost.de/',
    lookupUrl: 'https://www.deutschepost.de/en/s/postcode-search.html',
    phoneCode: '+49',
    timezone: 'Europe/Berlin',
    postalFormat: 'XXXXX',
    examplePostal: '10115',
    verified: true,
  },
  FR: {
    countryCode: 'FR',
    name: '法国邮政',
    nameEn: 'La Poste',
    officialUrl: 'https://www.laposte.fr/',
    phoneCode: '+33',
    timezone: 'Europe/Paris',
    postalFormat: 'XXXXX',
    examplePostal: '75001',
    verified: true,
  },
  IN: {
    countryCode: 'IN',
    name: '印度邮政',
    nameEn: 'India Post',
    officialUrl: 'https://www.indiapost.gov.in/',
    lookupUrl: 'https://www.indiapost.gov.in/VAS/Pages/findpincode.aspx',
    phoneCode: '+91',
    timezone: 'Asia/Kolkata',
    postalFormat: 'XXXXXX',
    examplePostal: '110001',
    verified: true,
  },
  TH: {
    countryCode: 'TH',
    name: '泰国邮政',
    nameEn: 'Thailand Post',
    officialUrl: 'https://www.thailandpost.co.th/',
    lookupUrl: 'https://www.thailandpost.co.th/en/postal-code',
    phoneCode: '+66',
    timezone: 'Asia/Bangkok',
    postalFormat: 'XXXXX',
    examplePostal: '10100',
    verified: true,
  },
  PH: {
    countryCode: 'PH',
    name: '菲律宾邮政',
    nameEn: 'PhilPost',
    officialUrl: 'https://www.phlpost.gov.ph/',
    phoneCode: '+63',
    timezone: 'Asia/Manila',
    postalFormat: 'XXXX',
    examplePostal: '1000',
    verified: true,
  },
  VN: {
    countryCode: 'VN',
    name: '越南邮政',
    nameEn: 'Vietnam Post',
    officialUrl: 'https://www.vnpost.vn/',
    phoneCode: '+84',
    timezone: 'Asia/Ho_Chi_Minh',
    postalFormat: 'XXXXXX',
    examplePostal: '100000',
    verified: true,
  },
  AE: {
    countryCode: 'AE',
    name: '阿联酋邮政',
    nameEn: 'Emirates Post',
    officialUrl: 'https://www.emiratespost.com/',
    phoneCode: '+971',
    timezone: 'Asia/Dubai',
    postalFormat: '无传统邮编',
    examplePostal: 'N/A',
    verified: true,
  },
  SA: {
    countryCode: 'SA',
    name: '沙特邮政',
    nameEn: 'Saudi Post',
    officialUrl: 'https://www.sp.com.sa/',
    phoneCode: '+966',
    timezone: 'Asia/Riyadh',
    postalFormat: 'XXXXX-XXXX',
    examplePostal: '11564',
    verified: true,
  },
};

/**
 * 获取官方邮政链接
 */
export function getOfficialLink(countryCode: string): OfficialPostalLink | null {
  return OFFICIAL_POSTAL_LINKS[countryCode] || null;
}

/**
 * 检查是否有官方链接
 */
export function hasOfficialLink(countryCode: string): boolean {
  return countryCode in OFFICIAL_POSTAL_LINKS;
}

/**
 * 获取电话区号
 */
export function getPhoneCode(countryCode: string): string | null {
  const link = OFFICIAL_POSTAL_LINKS[countryCode];
  return link?.phoneCode || null;
}

/**
 * 获取时区
 */
export function getTimezone(countryCode: string): string | null {
  const link = OFFICIAL_POSTAL_LINKS[countryCode];
  return link?.timezone || null;
}

/**
 * 获取邮编格式
 */
export function getPostalFormat(countryCode: string): string | null {
  const link = OFFICIAL_POSTAL_LINKS[countryCode];
  return link?.postalFormat || null;
}

/**
 * 获取示例邮编
 */
export function getExamplePostal(countryCode: string): string | null {
  const link = OFFICIAL_POSTAL_LINKS[countryCode];
  return link?.examplePostal || null;
}
