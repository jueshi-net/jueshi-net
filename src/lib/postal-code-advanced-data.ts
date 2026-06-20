/**
 * Advanced Postal Code Data
 * Chinese-English mappings, abbreviations, address formats, and notes
 */

// ─── Chinese-English City Name Mappings ─────────────────────────────────────

export interface CityMapping {
  en: string;
  cn: string;
  countryCode: string;
  province: string;
  postalPrefix: string;
  postalRange: string;
}

export const CITY_MAPPINGS: CityMapping[] = [
  // Canada
  { en: 'Toronto', cn: '多伦多', countryCode: 'CA', province: 'ON', postalPrefix: 'M', postalRange: 'M1A–M9Z' },
  { en: 'Vancouver', cn: '温哥华', countryCode: 'CA', province: 'BC', postalPrefix: 'V', postalRange: 'V5A–V7Y' },
  { en: 'Montreal', cn: '蒙特利尔', countryCode: 'CA', province: 'QC', postalPrefix: 'H', postalRange: 'H1A–H9Z' },
  { en: 'Ottawa', cn: '渥太华', countryCode: 'CA', province: 'ON', postalPrefix: 'K', postalRange: 'K1A–K4C' },
  { en: 'Calgary', cn: '卡尔加里', countryCode: 'CA', province: 'AB', postalPrefix: 'T', postalRange: 'T1Y–T3Z' },
  { en: 'Edmonton', cn: '埃德蒙顿', countryCode: 'CA', province: 'AB', postalPrefix: 'T', postalRange: 'T5A–T6Z' },
  { en: 'Mississauga', cn: '密西沙加', countryCode: 'CA', province: 'ON', postalPrefix: 'L', postalRange: 'L4A–L7Z' },
  { en: 'Markham', cn: '万锦', countryCode: 'CA', province: 'ON', postalPrefix: 'L', postalRange: 'L3A–L6Z' },
  { en: 'Richmond Hill', cn: '列治文山', countryCode: 'CA', province: 'ON', postalPrefix: 'L', postalRange: 'L4B–L4Z' },
  { en: 'Burnaby', cn: '本拿比', countryCode: 'CA', province: 'BC', postalPrefix: 'V', postalRange: 'V3A–V5Z' },
  { en: 'Richmond', cn: '列治文', countryCode: 'CA', province: 'BC', postalPrefix: 'V', postalRange: 'V6A–V7C' },
  { en: 'Surrey', cn: '素里', countryCode: 'CA', province: 'BC', postalPrefix: 'V', postalRange: 'V3A–V4Z' },
  { en: 'Victoria', cn: '维多利亚', countryCode: 'CA', province: 'BC', postalPrefix: 'V', postalRange: 'V8A–V9Z' },
  { en: 'Halifax', cn: '哈利法克斯', countryCode: 'CA', province: 'NS', postalPrefix: 'B', postalRange: 'B3A–B4Z' },
  { en: 'Winnipeg', cn: '温尼伯', countryCode: 'CA', province: 'MB', postalPrefix: 'R', postalRange: 'R2A–R3Z' },
  { en: 'Quebec City', cn: '魁北克城', countryCode: 'CA', province: 'QC', postalPrefix: 'G', postalRange: 'G1A–G3Z' },
  { en: 'Hamilton', cn: '汉密尔顿', countryCode: 'CA', province: 'ON', postalPrefix: 'L', postalRange: 'L8A–L8Z' },
  { en: 'Brampton', cn: '宾顿', countryCode: 'CA', province: 'ON', postalPrefix: 'L', postalRange: 'L6A–L7A' },
  { en: 'Laval', cn: '拉瓦尔', countryCode: 'CA', province: 'QC', postalPrefix: 'H', postalRange: 'H7A–H7Z' },
  { en: 'London', cn: '伦敦', countryCode: 'CA', province: 'ON', postalPrefix: 'N', postalRange: 'N5A–N6Z' },

  // United States
  { en: 'New York', cn: '纽约', countryCode: 'US', province: 'NY', postalPrefix: '100', postalRange: '10001–10292' },
  { en: 'Los Angeles', cn: '洛杉矶', countryCode: 'US', province: 'CA', postalPrefix: '900', postalRange: '90001–90089' },
  { en: 'Chicago', cn: '芝加哥', countryCode: 'US', province: 'IL', postalPrefix: '606', postalRange: '60601–60697' },
  { en: 'Houston', cn: '休斯顿', countryCode: 'US', province: 'TX', postalPrefix: '770', postalRange: '77001–77299' },
  { en: 'Phoenix', cn: '凤凰城', countryCode: 'US', province: 'AZ', postalPrefix: '850', postalRange: '85001–85099' },
  { en: 'San Francisco', cn: '旧金山', countryCode: 'US', province: 'CA', postalPrefix: '941', postalRange: '94101–94199' },
  { en: 'Seattle', cn: '西雅图', countryCode: 'US', province: 'WA', postalPrefix: '981', postalRange: '98101–98199' },
  { en: 'Boston', cn: '波士顿', countryCode: 'US', province: 'MA', postalPrefix: '021', postalRange: '02101–02299' },
  { en: 'Miami', cn: '迈阿密', countryCode: 'US', province: 'FL', postalPrefix: '331', postalRange: '33101–33199' },
  { en: 'Dallas', cn: '达拉斯', countryCode: 'US', province: 'TX', postalPrefix: '752', postalRange: '75201–75398' },
  { en: 'San Diego', cn: '圣地亚哥', countryCode: 'US', province: 'CA', postalPrefix: '921', postalRange: '92101–92199' },
  { en: 'San Jose', cn: '圣何塞', countryCode: 'US', province: 'CA', postalPrefix: '951', postalRange: '95101–95199' },
  { en: 'Austin', cn: '奥斯汀', countryCode: 'US', province: 'TX', postalPrefix: '787', postalRange: '78701–78799' },
  { en: 'Denver', cn: '丹佛', countryCode: 'US', province: 'CO', postalPrefix: '802', postalRange: '80201–80299' },
  { en: 'Las Vegas', cn: '拉斯维加斯', countryCode: 'US', province: 'NV', postalPrefix: '891', postalRange: '89101–89199' },
  { en: 'Portland', cn: '波特兰', countryCode: 'US', province: 'OR', postalPrefix: '972', postalRange: '97201–97299' },
  { en: 'Washington', cn: '华盛顿', countryCode: 'US', province: 'DC', postalPrefix: '200', postalRange: '20001–20099' },
  { en: 'Atlanta', cn: '亚特兰大', countryCode: 'US', province: 'GA', postalPrefix: '303', postalRange: '30301–30399' },
  { en: 'Detroit', cn: '底特律', countryCode: 'US', province: 'MI', postalPrefix: '482', postalRange: '48201–48299' },
  { en: 'Minneapolis', cn: '明尼阿波利斯', countryCode: 'US', province: 'MN', postalPrefix: '554', postalRange: '55401–55499' },
  { en: 'Philadelphia', cn: '费城', countryCode: 'US', province: 'PA', postalPrefix: '191', postalRange: '19019–19255' },
  { en: 'Nashville', cn: '纳什维尔', countryCode: 'US', province: 'TN', postalPrefix: '372', postalRange: '37201–37299' },
  { en: 'Charlotte', cn: '夏洛特', countryCode: 'US', province: 'NC', postalPrefix: '282', postalRange: '28201–28299' },
  { en: 'San Antonio', cn: '圣安东尼奥', countryCode: 'US', province: 'TX', postalPrefix: '782', postalRange: '78201–78299' },
  { en: 'Tampa', cn: '坦帕', countryCode: 'US', province: 'FL', postalPrefix: '336', postalRange: '33601–33699' },
  { en: 'Sacramento', cn: '萨克拉门托', countryCode: 'US', province: 'CA', postalPrefix: '958', postalRange: '95814–95899' },

  // United Kingdom
  { en: 'London', cn: '伦敦', countryCode: 'GB', province: 'England', postalPrefix: 'SW1', postalRange: 'E1–E20, EC1–EC4, N1–N22, NW1–NW11, SE1–SE28, SW1–SW20, W1–W14, WC1–WC2' },
  { en: 'Manchester', cn: '曼彻斯特', countryCode: 'GB', province: 'England', postalPrefix: 'M', postalRange: 'M1–M99' },
  { en: 'Birmingham', cn: '伯明翰', countryCode: 'GB', province: 'England', postalPrefix: 'B', postalRange: 'B1–B99' },
  { en: 'Liverpool', cn: '利物浦', countryCode: 'GB', province: 'England', postalPrefix: 'L', postalRange: 'L1–L99' },
  { en: 'Edinburgh', cn: '爱丁堡', countryCode: 'GB', province: 'Scotland', postalPrefix: 'EH', postalRange: 'EH1–EH99' },
  { en: 'Glasgow', cn: '格拉斯哥', countryCode: 'GB', province: 'Scotland', postalPrefix: 'G', postalRange: 'G1–G99' },
  { en: 'Leeds', cn: '利兹', countryCode: 'GB', province: 'England', postalPrefix: 'LS', postalRange: 'LS1–LS99' },
  { en: 'Bristol', cn: '布里斯托', countryCode: 'GB', province: 'England', postalPrefix: 'BS', postalRange: 'BS1–BS99' },
  { en: 'Cardiff', cn: '卡迪夫', countryCode: 'GB', province: 'Wales', postalPrefix: 'CF', postalRange: 'CF1–CF99' },
  { en: 'Belfast', cn: '贝尔法斯特', countryCode: 'GB', province: 'Northern Ireland', postalPrefix: 'BT', postalRange: 'BT1–BT99' },
  { en: 'Newcastle', cn: '纽卡斯尔', countryCode: 'GB', province: 'England', postalPrefix: 'NE', postalRange: 'NE1–NE99' },
  { en: 'Cambridge', cn: '剑桥', countryCode: 'GB', province: 'England', postalPrefix: 'CB', postalRange: 'CB1–CB99' },
  { en: 'Oxford', cn: '牛津', countryCode: 'GB', province: 'England', postalPrefix: 'OX', postalRange: 'OX1–OX99' },
  { en: 'Sheffield', cn: '谢菲尔德', countryCode: 'GB', province: 'England', postalPrefix: 'S', postalRange: 'S1–S99' },
  { en: 'Nottingham', cn: '诺丁汉', countryCode: 'GB', province: 'England', postalPrefix: 'NG', postalRange: 'NG1–NG99' },

  // Japan
  { en: 'Tokyo', cn: '东京', countryCode: 'JP', province: 'Tokyo', postalPrefix: '100', postalRange: '100-0001–100-8999' },
  { en: 'Osaka', cn: '大阪', countryCode: 'JP', province: 'Osaka', postalPrefix: '530', postalRange: '530-0001–530-8999' },
  { en: 'Yokohama', cn: '横滨', countryCode: 'JP', province: 'Kanagawa', postalPrefix: '220', postalRange: '220-0001–220-8999' },
  { en: 'Nagoya', cn: '名古屋', countryCode: 'JP', province: 'Aichi', postalPrefix: '460', postalRange: '460-0001–460-8999' },
  { en: 'Sapporo', cn: '札幌', countryCode: 'JP', province: 'Hokkaido', postalPrefix: '060', postalRange: '060-0001–060-8999' },
  { en: 'Fukuoka', cn: '福冈', countryCode: 'JP', province: 'Fukuoka', postalPrefix: '810', postalRange: '810-0001–810-8999' },
  { en: 'Kobe', cn: '神户', countryCode: 'JP', province: 'Hyogo', postalPrefix: '650', postalRange: '650-0001–650-8999' },
  { en: 'Kyoto', cn: '京都', countryCode: 'JP', province: 'Kyoto', postalPrefix: '600', postalRange: '600-0001–600-8999' },
  { en: 'Sendai', cn: '仙台', countryCode: 'JP', province: 'Miyagi', postalPrefix: '980', postalRange: '980-0001–980-8999' },
  { en: 'Hiroshima', cn: '广岛', countryCode: 'JP', province: 'Hiroshima', postalPrefix: '730', postalRange: '730-0001–730-8999' },

  // Australia
  { en: 'Sydney', cn: '悉尼', countryCode: 'AU', province: 'NSW', postalPrefix: '2', postalRange: '2000–2999' },
  { en: 'Melbourne', cn: '墨尔本', countryCode: 'AU', province: 'VIC', postalPrefix: '3', postalRange: '3000–3999' },
  { en: 'Brisbane', cn: '布里斯班', countryCode: 'AU', province: 'QLD', postalPrefix: '4', postalRange: '4000–4999' },
  { en: 'Perth', cn: '珀斯', countryCode: 'AU', province: 'WA', postalPrefix: '6', postalRange: '6000–6999' },
  { en: 'Adelaide', cn: '阿德莱德', countryCode: 'AU', province: 'SA', postalPrefix: '5', postalRange: '5000–5999' },
  { en: 'Hobart', cn: '霍巴特', countryCode: 'AU', province: 'TAS', postalPrefix: '7', postalRange: '7000–7999' },
  { en: 'Darwin', cn: '达尔文', countryCode: 'AU', province: 'NT', postalPrefix: '08', postalRange: '0800–0899' },
  { en: 'Canberra', cn: '堪培拉', countryCode: 'AU', province: 'ACT', postalPrefix: '26', postalRange: '2600–2699' },
  { en: 'Gold Coast', cn: '黄金海岸', countryCode: 'AU', province: 'QLD', postalPrefix: '42', postalRange: '4200–4299' },
  { en: 'Newcastle', cn: '纽卡斯尔', countryCode: 'AU', province: 'NSW', postalPrefix: '23', postalRange: '2300–2399' },

  // New Zealand
  { en: 'Auckland', cn: '奥克兰', countryCode: 'NZ', province: 'Auckland', postalPrefix: '10', postalRange: '1010–1072' },
  { en: 'Wellington', cn: '惠灵顿', countryCode: 'NZ', province: 'Wellington', postalPrefix: '60', postalRange: '6011–6061' },
  { en: 'Christchurch', cn: '基督城', countryCode: 'NZ', province: 'Canterbury', postalPrefix: '80', postalRange: '8011–8083' },
  { en: 'Hamilton', cn: '哈密尔顿', countryCode: 'NZ', province: 'Waikato', postalPrefix: '32', postalRange: '3200–3299' },
  { en: 'Dunedin', cn: '达尼丁', countryCode: 'NZ', province: 'Otago', postalPrefix: '90', postalRange: '9010–9099' },

  // Singapore
  { en: 'Singapore', cn: '新加坡', countryCode: 'SG', province: 'Singapore', postalPrefix: '01', postalRange: '018956–829999' },

  // South Korea
  { en: 'Seoul', cn: '首尔', countryCode: 'KR', province: 'Seoul', postalPrefix: '01', postalRange: '01001–09999' },
  { en: 'Busan', cn: '釜山', countryCode: 'KR', province: 'Busan', postalPrefix: '46', postalRange: '46001–49999' },
  { en: 'Incheon', cn: '仁川', countryCode: 'KR', province: 'Incheon', postalPrefix: '21', postalRange: '21001–23999' },

  // Germany
  { en: 'Berlin', cn: '柏林', countryCode: 'DE', province: 'Berlin', postalPrefix: '10', postalRange: '10115–14199' },
  { en: 'Munich', cn: '慕尼黑', countryCode: 'DE', province: 'Bavaria', postalPrefix: '80', postalRange: '80331–81929' },
  { en: 'Hamburg', cn: '汉堡', countryCode: 'DE', province: 'Hamburg', postalPrefix: '20', postalRange: '20095–21149' },
  { en: 'Frankfurt', cn: '法兰克福', countryCode: 'DE', province: 'Hesse', postalPrefix: '60', postalRange: '60306–65936' },
  { en: 'Cologne', cn: '科隆', countryCode: 'DE', province: 'NRW', postalPrefix: '50', postalRange: '50667–51149' },

  // France
  { en: 'Paris', cn: '巴黎', countryCode: 'FR', province: 'Île-de-France', postalPrefix: '75', postalRange: '75001–75999' },
  { en: 'Lyon', cn: '里昂', countryCode: 'FR', province: 'Auvergne-Rhône-Alpes', postalPrefix: '69', postalRange: '69001–69009' },
  { en: 'Marseille', cn: '马赛', countryCode: 'FR', province: 'Provence', postalPrefix: '13', postalRange: '13001–13016' },
];

// ─── Common Abbreviations ───────────────────────────────────────────────────

export interface AbbreviationMapping {
  abbr: string;
  full: string;
  type: 'city' | 'state' | 'country';
  countryCode?: string;
}

export const ABBREVIATIONS: AbbreviationMapping[] = [
  // US State abbreviations → full names (Chinese)
  { abbr: 'CA', full: 'California', type: 'state', countryCode: 'US' },
  { abbr: 'NY', full: 'New York', type: 'state', countryCode: 'US' },
  { abbr: 'TX', full: 'Texas', type: 'state', countryCode: 'US' },
  { abbr: 'FL', full: 'Florida', type: 'state', countryCode: 'US' },
  { abbr: 'IL', full: 'Illinois', type: 'state', countryCode: 'US' },
  { abbr: 'WA', full: 'Washington', type: 'state', countryCode: 'US' },
  { abbr: 'MA', full: 'Massachusetts', type: 'state', countryCode: 'US' },
  { abbr: 'PA', full: 'Pennsylvania', type: 'state', countryCode: 'US' },
  { abbr: 'OH', full: 'Ohio', type: 'state', countryCode: 'US' },
  { abbr: 'GA', full: 'Georgia', type: 'state', countryCode: 'US' },
  { abbr: 'NC', full: 'North Carolina', type: 'state', countryCode: 'US' },
  { abbr: 'MI', full: 'Michigan', type: 'state', countryCode: 'US' },
  { abbr: 'NJ', full: 'New Jersey', type: 'state', countryCode: 'US' },
  { abbr: 'VA', full: 'Virginia', type: 'state', countryCode: 'US' },
  { abbr: 'AZ', full: 'Arizona', type: 'state', countryCode: 'US' },
  { abbr: 'CO', full: 'Colorado', type: 'state', countryCode: 'US' },
  { abbr: 'NV', full: 'Nevada', type: 'state', countryCode: 'US' },
  { abbr: 'OR', full: 'Oregon', type: 'state', countryCode: 'US' },
  { abbr: 'TN', full: 'Tennessee', type: 'state', countryCode: 'US' },
  { abbr: 'MN', full: 'Minnesota', type: 'state', countryCode: 'US' },
  { abbr: 'DC', full: 'District of Columbia', type: 'state', countryCode: 'US' },

  // Canadian Province abbreviations
  { abbr: 'ON', full: 'Ontario', type: 'state', countryCode: 'CA' },
  { abbr: 'BC', full: 'British Columbia', type: 'state', countryCode: 'CA' },
  { abbr: 'QC', full: 'Quebec', type: 'state', countryCode: 'CA' },
  { abbr: 'AB', full: 'Alberta', type: 'state', countryCode: 'CA' },
  { abbr: 'MB', full: 'Manitoba', type: 'state', countryCode: 'CA' },

  // Australian State abbreviations
  { abbr: 'NSW', full: 'New South Wales', type: 'state', countryCode: 'AU' },
  { abbr: 'VIC', full: 'Victoria', type: 'state', countryCode: 'AU' },
  { abbr: 'QLD', full: 'Queensland', type: 'state', countryCode: 'AU' },
  { abbr: 'SA', full: 'South Australia', type: 'state', countryCode: 'AU' },
  { abbr: 'WA', full: 'Western Australia', type: 'state', countryCode: 'AU' },
  { abbr: 'TAS', full: 'Tasmania', type: 'state', countryCode: 'AU' },

  // Chinese state/province names → English
  { abbr: '加州', full: 'California', type: 'state', countryCode: 'US' },
  { abbr: '纽约州', full: 'New York', type: 'state', countryCode: 'US' },
  { abbr: '德州', full: 'Texas', type: 'state', countryCode: 'US' },
  { abbr: '佛罗里达', full: 'Florida', type: 'state', countryCode: 'US' },
  { abbr: '华盛顿州', full: 'Washington', type: 'state', countryCode: 'US' },
  { abbr: '麻省', full: 'Massachusetts', type: 'state', countryCode: 'US' },
  { abbr: '宾州', full: 'Pennsylvania', type: 'state', countryCode: 'US' },
  { abbr: '伊利诺伊', full: 'Illinois', type: 'state', countryCode: 'US' },
  { abbr: '内华达', full: 'Nevada', type: 'state', countryCode: 'US' },
  { abbr: '俄勒冈', full: 'Oregon', type: 'state', countryCode: 'US' },
  { abbr: '科罗拉多', full: 'Colorado', type: 'state', countryCode: 'US' },
  { abbr: '安大略', full: 'Ontario', type: 'state', countryCode: 'CA' },
  { abbr: '卑诗省', full: 'British Columbia', type: 'state', countryCode: 'CA' },
  { abbr: '魁北克', full: 'Quebec', type: 'state', countryCode: 'CA' },
  { abbr: '阿尔伯塔', full: 'Alberta', type: 'state', countryCode: 'CA' },
  { abbr: '新南威尔士', full: 'New South Wales', type: 'state', countryCode: 'AU' },
  { abbr: '维多利亚州', full: 'Victoria', type: 'state', countryCode: 'AU' },
  { abbr: '昆士兰', full: 'Queensland', type: 'state', countryCode: 'AU' },

  // Chinese country names
  { abbr: '美国', full: 'United States', type: 'country' },
  { abbr: '加拿大', full: 'Canada', type: 'country' },
  { abbr: '英国', full: 'United Kingdom', type: 'country' },
  { abbr: '日本', full: 'Japan', type: 'country' },
  { abbr: '澳大利亚', full: 'Australia', type: 'country' },
  { abbr: '澳洲', full: 'Australia', type: 'country' },
  { abbr: '新西兰', full: 'New Zealand', type: 'country' },
  { abbr: '新加坡', full: 'Singapore', type: 'country' },
  { abbr: '韩国', full: 'South Korea', type: 'country' },
  { abbr: '德国', full: 'Germany', type: 'country' },
  { abbr: '法国', full: 'France', type: 'country' },
  { abbr: '马来西亚', full: 'Malaysia', type: 'country' },
  { abbr: '泰国', full: 'Thailand', type: 'country' },
  { abbr: '越南', full: 'Vietnam', type: 'country' },
  { abbr: '菲律宾', full: 'Philippines', type: 'country' },
  { abbr: '印度', full: 'India', type: 'country' },
  { abbr: '意大利', full: 'Italy', type: 'country' },
  { abbr: '西班牙', full: 'Spain', type: 'country' },
  { abbr: '荷兰', full: 'Netherlands', type: 'country' },
  { abbr: '瑞士', full: 'Switzerland', type: 'country' },
  { abbr: '瑞典', full: 'Sweden', type: 'country' },
  { abbr: '挪威', full: 'Norway', type: 'country' },
  { abbr: '丹麦', full: 'Denmark', type: 'country' },
  { abbr: '芬兰', full: 'Finland', type: 'country' },
  { abbr: '波兰', full: 'Poland', type: 'country' },
  { abbr: '俄罗斯', full: 'Russia', type: 'country' },
  { abbr: '巴西', full: 'Brazil', type: 'country' },
  { abbr: '墨西哥', full: 'Mexico', type: 'country' },
  { abbr: '阿联酋', full: 'United Arab Emirates', type: 'country' },
  { abbr: '沙特', full: 'Saudi Arabia', type: 'country' },
  { abbr: '南非', full: 'South Africa', type: 'country' },
  { abbr: '埃及', full: 'Egypt', type: 'country' },

  // Common city abbreviations
  { abbr: 'LA', full: 'Los Angeles', type: 'city', countryCode: 'US' },
  { abbr: 'NYC', full: 'New York', type: 'city', countryCode: 'US' },
  { abbr: 'SF', full: 'San Francisco', type: 'city', countryCode: 'US' },
  { abbr: 'DC', full: 'Washington', type: 'city', countryCode: 'US' },
];

// ─── Address Format Templates ───────────────────────────────────────────────

export interface AddressFormat {
  countryCode: string;
  countryName: string;
  countryNameCn: string;
  flag: string;
  format: string;           // Standard English format template
  formatCn: string;         // Chinese explanation
  example: string;          // Full example address
  notes: string[];          // Important notes in Chinese
  fields: {
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
  }[];
  officialLookupUrl: string;
  officialName: string;
}

export const ADDRESS_FORMATS: Record<string, AddressFormat> = {
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    countryNameCn: '加拿大',
    flag: '🇨🇦',
    format: `[Recipient Name]
[Street Number] [Street Name], [Apt/Suite #]
[City], [Province] [Postal Code]
Canada`,
    formatCn: '加拿大地址格式：收件人 → 街道门牌（含公寓号）→ 城市 + 省份缩写 + 邮编 → 国家名。邮编格式为 A1A 1A1（字母数字交替，中间有空格）。',
    example: `John Smith
123 Main Street, Apt 4B
Toronto, ON M5V 2T6
Canada`,
    notes: [
      '省份使用2位大写字母缩写（如 ON = Ontario, BC = British Columbia）',
      '邮编格式为 A1A 1A1，中间空格可选但建议保留',
      '公寓号/套房号写在街道地址后面，用逗号分隔',
      '城市名和省份之间用逗号分隔',
      '国际邮件最后一行写 "Canada"',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'John Smith', required: true },
      { name: 'streetAddress', label: '街道地址', placeholder: '123 Main Street, Apt 4B', required: true },
      { name: 'city', label: '城市', placeholder: 'Toronto', required: true },
      { name: 'province', label: '省份', placeholder: 'ON', required: true },
      { name: 'postalCode', label: '邮编', placeholder: 'M5V 2T6', required: true },
      { name: 'country', label: '国家', placeholder: 'Canada', required: true },
    ],
    officialLookupUrl: 'https://www.canadapost-postescanada.ca/pccl/pcl/en/find-a-postal-code',
    officialName: 'Canada Post',
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    countryNameCn: '美国',
    flag: '🇺🇸',
    format: `[Recipient Name]
[Street Number] [Street Name], [Apt/Suite #]
[City], [State Abbreviation] [ZIP Code]
United States`,
    formatCn: '美国地址格式：收件人 → 街道门牌（含公寓号）→ 城市 + 州缩写 + ZIP Code → 国家名。ZIP Code 为5位数字或 ZIP+4（XXXXX-XXXX）。',
    example: `Jane Doe
456 Oak Avenue, Suite 200
Los Angeles, CA 90001
United States`,
    notes: [
      '州名使用2位大写字母缩写（如 CA = California, NY = New York）',
      'ZIP Code 为5位纯数字，ZIP+4 格式为 XXXXX-XXXX',
      '州和 ZIP Code 之间有一个空格',
      '公寓/套房号写在街道地址后面',
      '国际邮件最后一行写 "United States" 或 "USA"',
      '不要在国家名前面加邮编',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Jane Doe', required: true },
      { name: 'streetAddress', label: '街道地址', placeholder: '456 Oak Avenue, Suite 200', required: true },
      { name: 'city', label: '城市', placeholder: 'Los Angeles', required: true },
      { name: 'state', label: '州', placeholder: 'CA', required: true },
      { name: 'zipCode', label: 'ZIP Code', placeholder: '90001', required: true },
      { name: 'country', label: '国家', placeholder: 'United States', required: true },
    ],
    officialLookupUrl: 'https://tools.usps.com/go/ZipLookupAction!input.action',
    officialName: 'USPS',
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    countryNameCn: '英国',
    flag: '🇬🇧',
    format: `[Recipient Name]
[House Number] [Street Name]
[Locality] (optional)
[CITY]
[Postcode]
United Kingdom`,
    formatCn: '英国地址格式：收件人 → 门牌+街道 → 区域（可选）→ 城市（大写）→ 邮编 → 国家名。邮编格式如 SW1A 1AA，中间必须有空格。',
    example: `Mr. John Smith
10 Downing Street
Westminster
LONDON
SW1A 2AA
United Kingdom`,
    notes: [
      '邮编格式为 AA9A 9AA 或 A9 9AA 等变体，中间必须有空格',
      '城市名通常全大写',
      '不需要写郡名（County），除非必要',
      '国际邮件最后一行写 "United Kingdom"',
      '不要缩写 "United Kingdom" 为 "UK"（部分邮局要求全写）',
      'Outward Code（空格前）标识区域，Inward Code（空格后）标识街道',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Mr. John Smith', required: true },
      { name: 'streetAddress', label: '街道地址', placeholder: '10 Downing Street', required: true },
      { name: 'locality', label: '区域（可选）', placeholder: 'Westminster', required: false },
      { name: 'city', label: '城市', placeholder: 'LONDON', required: true },
      { name: 'postcode', label: '邮编', placeholder: 'SW1A 2AA', required: true },
      { name: 'country', label: '国家', placeholder: 'United Kingdom', required: true },
    ],
    officialLookupUrl: 'https://www.royalmail.com/find-a-postcode',
    officialName: 'Royal Mail',
  },
  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    countryNameCn: '日本',
    flag: '🇯🇵',
    format: `[Recipient Name]
[Building Name & Room #] (optional)
[House Number]-[Block Number]-[Lot Number] [Chome], [Area/District]
[City] [Prefecture] [Postal Code]
Japan`,
    formatCn: '日本地址格式：收件人 → 建筑名/房间号（可选）→ 丁目-番地-号 → 市区町村 + 都道府县 + 邮编 → 国家名。邮编格式为 XXX-XXXX（7位数字）。',
    example: `Taro Yamada
Sakura Building 301
2-3-1 Shibuya, Shibuya-ku
Tokyo 150-0002
Japan`,
    notes: [
      '邮编格式为 XXX-XXXX（7位数字，中间有连字符）',
      '日本地址从小到大地写：丁目 → 番地 → 号',
      '都道府县名写在城市后面',
      '国际邮件建议用英文格式，最后一行写 "Japan"',
      '建筑物名和房间号可以写在第一行地址上方',
      '区名（如渋谷区 = Shibuya-ku）要写清楚',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Taro Yamada / 山田太郎', required: true },
      { name: 'building', label: '建筑/房间号（可选）', placeholder: 'Sakura Building 301', required: false },
      { name: 'streetAddress', label: '丁目-番地-号', placeholder: '2-3-1 Shibuya', required: true },
      { name: 'district', label: '区', placeholder: 'Shibuya-ku', required: true },
      { name: 'city', label: '城市', placeholder: 'Tokyo', required: true },
      { name: 'prefecture', label: '都道府县', placeholder: 'Tokyo', required: true },
      { name: 'postalCode', label: '邮编', placeholder: '150-0002', required: true },
      { name: 'country', label: '国家', placeholder: 'Japan', required: true },
    ],
    officialLookupUrl: 'https://www.post.japanpost.jp/zipcode/',
    officialName: 'Japan Post',
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    countryNameCn: '澳大利亚',
    flag: '🇦🇺',
    format: `[Recipient Name]
[Street Number] [Street Name]
[Suburb] [State Abbreviation] [Postcode]
Australia`,
    formatCn: '澳大利亚地址格式：收件人 → 街道门牌 → 区/郊区 + 州缩写 + 邮编 → 国家名。邮编为4位数字。',
    example: `Jane Smith
42 Wallaby Street
Sydney NSW 2000
Australia`,
    notes: [
      '邮编为4位纯数字',
      '州名使用缩写（NSW, VIC, QLD, SA, WA, TAS, NT, ACT）',
      '郊区名（Suburb）写在州名前面',
      '城市和郊区之间不需要逗号',
      '国际邮件最后一行写 "Australia"',
      '街道地址不需要写 "Street" 全拼，可以用 "St"',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Jane Smith', required: true },
      { name: 'streetAddress', label: '街道地址', placeholder: '42 Wallaby Street', required: true },
      { name: 'suburb', label: '区/郊区', placeholder: 'Sydney', required: true },
      { name: 'state', label: '州', placeholder: 'NSW', required: true },
      { name: 'postcode', label: '邮编', placeholder: '2000', required: true },
      { name: 'country', label: '国家', placeholder: 'Australia', required: true },
    ],
    officialLookupUrl: 'https://auspost.com.au/business/solutions/data-and-insights/postcode-finder',
    officialName: 'Australia Post',
  },
  NZ: {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    countryNameCn: '新西兰',
    flag: '🇳🇿',
    format: `[Recipient Name]
[Street Number] [Street Name]
[Suburb]
[City] [Postcode]
New Zealand`,
    formatCn: '新西兰地址格式：收件人 → 街道门牌 → 郊区 → 城市 + 邮编 → 国家名。邮编为4位数字。',
    example: `John Brown
15 Queen Street
Ponsonby
Auckland 1011
New Zealand`,
    notes: [
      '邮编为4位纯数字',
      '郊区（Suburb）单独一行',
      '城市名写在邮编前面',
      '国际邮件最后一行写 "New Zealand"',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'John Brown', required: true },
      { name: 'streetAddress', label: '街道地址', placeholder: '15 Queen Street', required: true },
      { name: 'suburb', label: '郊区', placeholder: 'Ponsonby', required: true },
      { name: 'city', label: '城市', placeholder: 'Auckland', required: true },
      { name: 'postcode', label: '邮编', placeholder: '1011', required: true },
      { name: 'country', label: '国家', placeholder: 'New Zealand', required: true },
    ],
    officialLookupUrl: 'https://www.nzpost.co.nz/tools/find-a-postcode',
    officialName: 'NZ Post',
  },
  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    countryNameCn: '新加坡',
    flag: '🇸🇬',
    format: `[Recipient Name]
[Building Name], [Unit Number]
[Street Number] [Street Name]
Singapore [Postal Code]`,
    formatCn: '新加坡地址格式：收件人 → 建筑名+单元号 → 门牌+街道 → Singapore + 邮编。邮编为6位数字。',
    example: `Tan Ah Kow
Marina Bay Sands, #01-01
10 Bayfront Avenue
Singapore 018956`,
    notes: [
      '邮编为6位纯数字',
      '单元号格式为 #楼层-房间号（如 #01-01）',
      '新加坡是小国，不需要写 "省/州"',
      '最后一行写 "Singapore" + 邮编',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Tan Ah Kow', required: true },
      { name: 'building', label: '建筑名+单元号', placeholder: 'Marina Bay Sands, #01-01', required: true },
      { name: 'streetAddress', label: '门牌+街道', placeholder: '10 Bayfront Avenue', required: true },
      { name: 'postalCode', label: '邮编', placeholder: '018956', required: true },
      { name: 'country', label: '国家', placeholder: 'Singapore', required: true },
    ],
    officialLookupUrl: 'https://www.singpost.com/postal-services/find-postal-code',
    officialName: 'SingPost',
  },
  KR: {
    countryCode: 'KR',
    countryName: 'South Korea',
    countryNameCn: '韩国',
    flag: '🇰🇷',
    format: `[Recipient Name]
[Building Name] (optional)
[House Number] [Street Name], [District]
[City], [Province] [Postal Code]
South Korea`,
    formatCn: '韩国地址格式：收件人 → 建筑名（可选）→ 门牌+街道+区 → 城市 + 道/特别市 + 邮编 → 国家名。邮编为5位数字。',
    example: `Kim Minjun
Gangnam Tower 5F
152 Teheran-ro, Gangnam-gu
Seoul 06236
South Korea`,
    notes: [
      '邮编为5位纯数字（2015年改为5位制）',
      '区名（gu）要写清楚，如 Gangnam-gu',
      '特别市/广域市直接写城市名',
      '国际邮件最后一行写 "South Korea" 或 "Republic of Korea"',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Kim Minjun', required: true },
      { name: 'streetAddress', label: '街道地址', placeholder: '152 Teheran-ro, Gangnam-gu', required: true },
      { name: 'city', label: '城市', placeholder: 'Seoul', required: true },
      { name: 'postalCode', label: '邮编', placeholder: '06236', required: true },
      { name: 'country', label: '国家', placeholder: 'South Korea', required: true },
    ],
    officialLookupUrl: 'https://www.epost.go.kr/zipcode/zipcode.search.jsp',
    officialName: 'Korea Post',
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    countryNameCn: '德国',
    flag: '🇩🇪',
    format: `[Recipient Name]
[Street Name] [House Number]
[Postal Code] [City]
Germany`,
    formatCn: '德国地址格式：收件人 → 街道名+门牌号 → 邮编+城市 → 国家名。邮编为5位数字，写在城市前面。',
    example: `Hans Mueller
Hauptstraße 42
10115 Berlin
Germany`,
    notes: [
      '邮编为5位纯数字',
      '邮编写在城市名前面（与美国相反）',
      '门牌号写在街道名后面',
      '国际邮件最后一行写 "Germany" 或 "Deutschland"',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Hans Mueller', required: true },
      { name: 'streetAddress', label: '街道+门牌', placeholder: 'Hauptstraße 42', required: true },
      { name: 'postalCode', label: '邮编', placeholder: '10115', required: true },
      { name: 'city', label: '城市', placeholder: 'Berlin', required: true },
      { name: 'country', label: '国家', placeholder: 'Germany', required: true },
    ],
    officialLookupUrl: 'https://www.deutschepost.de/en/s/postcode-search.html',
    officialName: 'Deutsche Post',
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    countryNameCn: '法国',
    flag: '🇫🇷',
    format: `[Recipient Name]
[Street Number] [Street Name]
[Postal Code] [City]
France`,
    formatCn: '法国地址格式：收件人 → 门牌+街道 → 邮编+城市 → 国家名。邮编为5位数字，写在城市前面。',
    example: `Jean Dupont
15 Rue de Rivoli
75001 Paris
France`,
    notes: [
      '邮编为5位纯数字',
      '邮编写在城市名前面',
      '门牌号写在街道名前面',
      '"Rue" = 街, "Avenue" = 大道, "Boulevard" = 林荫道',
      '国际邮件最后一行写 "France"',
    ],
    fields: [
      { name: 'recipientName', label: '收件人', placeholder: 'Jean Dupont', required: true },
      { name: 'streetAddress', label: '门牌+街道', placeholder: '15 Rue de Rivoli', required: true },
      { name: 'postalCode', label: '邮编', placeholder: '75001', required: true },
      { name: 'city', label: '城市', placeholder: 'Paris', required: true },
      { name: 'country', label: '国家', placeholder: 'France', required: true },
    ],
    officialLookupUrl: 'https://www.laposte.fr/',
    officialName: 'La Poste',
  },
};

// ─── Search Helpers ─────────────────────────────────────────────────────────

/**
 * Resolve a query to a city mapping, supporting Chinese, English, and abbreviations
 */
export function resolveCityQuery(query: string): CityMapping[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: CityMapping[] = [];

  for (const city of CITY_MAPPINGS) {
    const enLower = city.en.toLowerCase();
    const cn = city.cn;

    // Exact match
    if (enLower === q || cn === query.trim()) {
      results.unshift(city);
      continue;
    }

    // Partial match
    if (enLower.includes(q) || q.includes(enLower) || cn.includes(query.trim()) || query.trim().includes(cn)) {
      results.push(city);
      continue;
    }
  }

  // Also check abbreviations for city names
  for (const abbr of ABBREVIATIONS.filter(a => a.type === 'city')) {
    if (abbr.abbr.toLowerCase() === q || abbr.full.toLowerCase() === q) {
      const cityMatch = CITY_MAPPINGS.find(c => c.en === abbr.full);
      if (cityMatch && !results.includes(cityMatch)) {
        results.push(cityMatch);
      }
    }
  }

  return results.slice(0, 10);
}

/**
 * Resolve abbreviation to full name
 */
export function resolveAbbreviation(query: string): string | null {
  const q = query.trim().toLowerCase();
  for (const abbr of ABBREVIATIONS) {
    if (abbr.abbr.toLowerCase() === q || abbr.full.toLowerCase() === q) {
      return abbr.full;
    }
  }
  return null;
}

/**
 * Get address format for a country
 */
export function getAddressFormat(countryCode: string): AddressFormat | null {
  return ADDRESS_FORMATS[countryCode] || null;
}

/**
 * Get popular cities for recommendations
 */
export function getPopularCities(countryCode?: string): CityMapping[] {
  if (countryCode) {
    return CITY_MAPPINGS.filter(c => c.countryCode === countryCode).slice(0, 6);
  }
  // Return top cities from each major country
  const topCities = ['Toronto', 'Vancouver', 'New York', 'Los Angeles', 'London', 'Tokyo', 'Sydney', 'Singapore'];
  return topCities.map(name => CITY_MAPPINGS.find(c => c.en === name)).filter(Boolean) as CityMapping[];
}
