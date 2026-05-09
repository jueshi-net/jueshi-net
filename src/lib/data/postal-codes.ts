/**
 * Postal code reference data for 5 countries.
 * Includes format rules, city-to-postal-code ranges, and official lookup links.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PostalCodeRange {
  city: string;
  region: string;
  range: string;       // human-readable range like "M1A–M9Z" or "10001–10292"
  prefix: string;      // prefix for quick matching
}

export interface CountryPostalData {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  format: string;
  formatRegex: RegExp;
  hint: string;
  ranges: PostalCodeRange[];
  stateAbbrevs: { code: string; name: string }[];
  commonErrors: string[];
  officialUrl: string;
  officialName: string;
  officialLookupUrl: string;
}

// ─── Canada ──────────────────────────────────────────────────────────────────

export const canadaRanges: PostalCodeRange[] = [
  { city: 'Toronto', region: 'ON', range: 'M1A–M9Z', prefix: 'M' },
  { city: 'Vancouver', region: 'BC', range: 'V5A–V7Y', prefix: 'V' },
  { city: 'Montreal', region: 'QC', range: 'H1A–H9Z', prefix: 'H' },
  { city: 'Ottawa', region: 'ON', range: 'K1A–K4C', prefix: 'K' },
  { city: 'Calgary', region: 'AB', range: 'T1Y–T3Z', prefix: 'T' },
  { city: 'Edmonton', region: 'AB', range: 'T5A–T6Z', prefix: 'T' },
  { city: 'Winnipeg', region: 'MB', range: 'R2A–R3Z', prefix: 'R' },
  { city: 'Halifax', region: 'NS', range: 'B3A–B4Z', prefix: 'B' },
  { city: 'Victoria', region: 'BC', range: 'V8A–V9Z', prefix: 'V' },
  { city: 'Quebec City', region: 'QC', range: 'G1A–G3Z', prefix: 'G' },
  { city: 'Saskatoon', region: 'SK', range: 'S7A–S7Z', prefix: 'S' },
  { city: 'Regina', region: 'SK', range: 'S4A–S4Z', prefix: 'S' },
  { city: 'St. John\'s', region: 'NL', range: 'A1A–A1Z', prefix: 'A' },
  { city: 'Hamilton', region: 'ON', range: 'L8A–L8Z', prefix: 'L' },
  { city: 'London', region: 'ON', range: 'N5A–N6Z', prefix: 'N' },
  { city: 'Kitchener', region: 'ON', range: 'N2A–N2Z', prefix: 'N' },
  { city: 'Mississauga', region: 'ON', range: 'L4A–L7Z', prefix: 'L' },
  { city: 'Brampton', region: 'ON', range: 'L6A–L7A', prefix: 'L' },
  { city: 'Surrey', region: 'BC', range: 'V3A–V4Z', prefix: 'V' },
  { city: 'Hamilton', region: 'ON', range: 'L8A–L8Z', prefix: 'L' },
  { city: 'Brampton', region: 'ON', range: 'L6A–L7A', prefix: 'L' },
  { city: 'Markham', region: 'ON', range: 'L3A–L6Z', prefix: 'L' },
  { city: 'Vaughan', region: 'ON', range: 'L4H–L6A', prefix: 'L' },
  { city: 'Richmond Hill', region: 'ON', range: 'L4B–L4Z', prefix: 'L' },
  { city: 'Oakville', region: 'ON', range: 'L6H–L6M', prefix: 'L' },
  { city: 'Burlington', region: 'ON', range: 'L7A–L7Z', prefix: 'L' },
  { city: 'Oshawa', region: 'ON', range: 'L1A–L1Z', prefix: 'L' },
  { city: 'Barrie', region: 'ON', range: 'L4A–L4N', prefix: 'L' },
  { city: 'St. Catharines', region: 'ON', range: 'L2A–L2Z', prefix: 'L' },
  { city: 'Guelph', region: 'ON', range: 'N1A–N1Z', prefix: 'N' },
  { city: 'Kingston', region: 'ON', range: 'K7A–K7Z', prefix: 'K' },
  { city: 'Burnaby', region: 'BC', range: 'V3A–V5Z', prefix: 'V' },
  { city: 'Richmond', region: 'BC', range: 'V6A–V7C', prefix: 'V' },
  { city: 'Abbotsford', region: 'BC', range: 'V2A–V4X', prefix: 'V' },
  { city: 'Coquitlam', region: 'BC', range: 'V3A–V3Z', prefix: 'V' },
  { city: 'Kelowna', region: 'BC', range: 'V1A–V1Z', prefix: 'V' },
  { city: 'Kamloops', region: 'BC', range: 'V2A–V2Z', prefix: 'V' },
  { city: 'Laval', region: 'QC', range: 'H7A–H7Z', prefix: 'H' },
  { city: 'Gatineau', region: 'QC', range: 'J8A–J9Z', prefix: 'J' },
  { city: 'Longueuil', region: 'QC', range: 'J4A–J4Z', prefix: 'J' },
  { city: 'Sherbrooke', region: 'QC', range: 'J1A–J1Z', prefix: 'J' },
  { city: 'Red Deer', region: 'AB', range: 'T4A–T4Z', prefix: 'T' },
  { city: 'Lethbridge', region: 'AB', range: 'T1A–T1Z', prefix: 'T' },
  { city: 'Medicine Hat', region: 'AB', range: 'T1A–T1Z', prefix: 'T' },
  { city: 'Surrey', region: 'BC', range: 'V3A–V4Z', prefix: 'V' },
  { city: 'Thunder Bay', region: 'ON', range: 'P7A–P7Z', prefix: 'P' },
  { city: 'Sudbury', region: 'ON', range: 'P3A–P3Z', prefix: 'P' },
  { city: 'Moncton', region: 'NB', range: 'E1A–E1Z', prefix: 'E' },
  { city: 'Fredericton', region: 'NB', range: 'E3A–E3Z', prefix: 'E' },
  { city: 'Charlottetown', region: 'PE', range: 'C1A–C1E', prefix: 'C' },
  { city: 'Whitehorse', region: 'YT', range: 'Y1A', prefix: 'Y' },
  { city: 'Yellowknife', region: 'NT', range: 'X1A', prefix: 'X' },

  { city: 'Laval', region: 'QC', range: 'H7A–H7Z', prefix: 'H' },
];

export const canadaStates = [
  { code: 'AB', name: 'Alberta 阿尔伯塔' }, { code: 'BC', name: 'British Columbia 不列颠哥伦比亚' },
  { code: 'MB', name: 'Manitoba 马尼托巴' }, { code: 'NB', name: 'New Brunswick 新不伦瑞克' },
  { code: 'NL', name: 'Newfoundland 纽芬兰' }, { code: 'NS', name: 'Nova Scotia 新斯科舍' },
  { code: 'NT', name: 'Northwest Territories 西北地区' }, { code: 'NU', name: 'Nunavut 努纳武特' },
  { code: 'ON', name: 'Ontario 安大略' }, { code: 'PE', name: 'Prince Edward Island 爱德华王子岛' },
  { code: 'QC', name: 'Quebec 魁北克' }, { code: 'SK', name: 'Saskatchewan 萨斯喀彻温' },
  { code: 'YT', name: 'Yukon 育空' },
];

// Canada postal code first-letter to province mapping
export const canadaFirstLetterMap: Record<string, string> = {
  'A': 'NL', 'B': 'NS', 'C': 'PE', 'E': 'NB',
  'G': 'QC', 'H': 'QC', 'J': 'QC',
  'K': 'ON', 'L': 'ON', 'M': 'ON', 'N': 'ON', 'P': 'ON',
  'R': 'MB',
  'S': 'SK',
  'T': 'AB',
  'V': 'BC',
  'X': 'NT/NU', 'Y': 'YT',
};

// ─── United States ───────────────────────────────────────────────────────────

export const usRanges: PostalCodeRange[] = [
  { city: 'New York', region: 'NY', range: '10001–10292', prefix: '100' },
  { city: 'Los Angeles', region: 'CA', range: '90001–90089', prefix: '900' },
  { city: 'Chicago', region: 'IL', range: '60601–60697', prefix: '606' },
  { city: 'Houston', region: 'TX', range: '77001–77299', prefix: '770' },
  { city: 'Phoenix', region: 'AZ', range: '85001–85099', prefix: '850' },
  { city: 'Philadelphia', region: 'PA', range: '19019–19255', prefix: '191' },
  { city: 'San Antonio', region: 'TX', range: '78201–78299', prefix: '782' },
  { city: 'San Diego', region: 'CA', range: '92101–92199', prefix: '921' },
  { city: 'Dallas', region: 'TX', range: '75201–75398', prefix: '752' },
  { city: 'San Jose', region: 'CA', range: '95101–95199', prefix: '951' },
  { city: 'Austin', region: 'TX', range: '73301–73344, 78701–78799', prefix: '787' },
  { city: 'Jacksonville', region: 'FL', range: '32099–32299', prefix: '322' },
  { city: 'San Francisco', region: 'CA', range: '94101–94199', prefix: '941' },
  { city: 'Seattle', region: 'WA', range: '98101–98199', prefix: '981' },
  { city: 'Denver', region: 'CO', range: '80201–80299', prefix: '802' },
  { city: 'Boston', region: 'MA', range: '02101–02299', prefix: '021' },
  { city: 'Nashville', region: 'TN', range: '37201–37299', prefix: '372' },
  { city: 'Portland', region: 'OR', range: '97201–97299', prefix: '972' },
  { city: 'Las Vegas', region: 'NV', range: '89101–89199', prefix: '891' },
  { city: 'Miami', region: 'FL', range: '33101–33199', prefix: '331' },
  { city: 'Los Angeles', region: 'CA', range: '90001–90089', prefix: '900' },
  { city: 'Chicago', region: 'IL', range: '60601–60661', prefix: '606' },
  { city: 'Houston', region: 'TX', range: '77001–77099', prefix: '770' },
  { city: 'Phoenix', region: 'AZ', range: '85001–85099', prefix: '850' },
  { city: 'Philadelphia', region: 'PA', range: '19101–19154', prefix: '191' },
  { city: 'San Antonio', region: 'TX', range: '78201–78299', prefix: '782' },
  { city: 'San Diego', region: 'CA', range: '92101–92199', prefix: '921' },
  { city: 'Dallas', region: 'TX', range: '75201–75299', prefix: '752' },
  { city: 'San Jose', region: 'CA', range: '95101–95199', prefix: '951' },
  { city: 'Austin', region: 'TX', range: '73301–78799', prefix: '787' },
  { city: 'Jacksonville', region: 'FL', range: '32099–32299', prefix: '322' },
  { city: 'Fort Worth', region: 'TX', range: '76101–76199', prefix: '761' },
  { city: 'Columbus', region: 'OH', range: '43085–43299', prefix: '432' },
  { city: 'Indianapolis', region: 'IN', range: '46201–46299', prefix: '462' },
  { city: 'Charlotte', region: 'NC', range: '28201–28299', prefix: '282' },
  { city: 'Seattle', region: 'WA', range: '98101–98199', prefix: '981' },
  { city: 'Denver', region: 'CO', range: '80201–80299', prefix: '802' },
  { city: 'Washington', region: 'DC', range: '20001–20099', prefix: '200' },
  { city: 'Boston', region: 'MA', range: '02101–02299', prefix: '021' },
  { city: 'Nashville', region: 'TN', range: '37201–37299', prefix: '372' },
  { city: 'Detroit', region: 'MI', range: '48201–48299', prefix: '482' },
  { city: 'Portland', region: 'OR', range: '97201–97299', prefix: '972' },
  { city: 'Las Vegas', region: 'NV', range: '89101–89199', prefix: '891' },
  { city: 'Baltimore', region: 'MD', range: '21201–21299', prefix: '212' },
  { city: 'Milwaukee', region: 'WI', range: '53201–53299', prefix: '532' },
  { city: 'Atlanta', region: 'GA', range: '30301–30399', prefix: '303' },
  { city: 'Minneapolis', region: 'MN', range: '55401–55499', prefix: '554' },
  { city: 'Tampa', region: 'FL', range: '33601–33699', prefix: '336' },
];

export const usStates = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

// US ZIP code first-digit to region mapping
export const usFirstDigitMap: Record<string, string> = {
  '0': 'MA, CT, VT, NH, ME, RI', '1': 'NY, DE, PA, NJ',
  '2': 'DC, MD, VA, WV', '3': 'AL, FL, GA, MS, TN',
  '4': 'IN, KY, MI, OH', '5': 'IA, MN, MT, ND, SD, WI',
  '6': 'IL, KS, MO, NE', '7': 'AR, LA, OK, TX',
  '8': 'AZ, CO, ID, NM, NV, UT, WY', '9': 'AK, CA, HI, OR, WA',
};

// ─── United Kingdom ──────────────────────────────────────────────────────────

export const ukRanges: PostalCodeRange[] = [
  { city: 'London', region: 'England', range: 'E1–E20, EC1–EC4, N1–N22, NW1–NW11, SE1–SE28, SW1–SW20, W1–W14, WC1–WC2', prefix: 'E,EC,N,NW,SE,SW,W,WC' },
  { city: 'Manchester', region: 'England', range: 'M1–M99', prefix: 'M' },
  { city: 'Birmingham', region: 'England', range: 'B1–B99', prefix: 'B' },
  { city: 'Liverpool', region: 'England', range: 'L1–L99', prefix: 'L' },
  { city: 'Leeds', region: 'England', range: 'LS1–LS99', prefix: 'LS' },
  { city: 'Sheffield', region: 'England', range: 'S1–S99', prefix: 'S' },
  { city: 'Bristol', region: 'England', range: 'BS1–BS99', prefix: 'BS' },
  { city: 'Newcastle', region: 'England', range: 'NE1–NE99', prefix: 'NE' },
  { city: 'Nottingham', region: 'England', range: 'NG1–NG99', prefix: 'NG' },
  { city: 'Edinburgh', region: 'Scotland', range: 'EH1–EH99', prefix: 'EH' },
  { city: 'Glasgow', region: 'Scotland', range: 'G1–G99', prefix: 'G' },
  { city: 'Aberdeen', region: 'Scotland', range: 'AB10–AB99', prefix: 'AB' },
  { city: 'Cardiff', region: 'Wales', range: 'CF1–CF99', prefix: 'CF' },
  { city: 'Belfast', region: 'Northern Ireland', range: 'BT1–BT99', prefix: 'BT' },
  { city: 'Cambridge', region: 'England', range: 'CB1–CB99', prefix: 'CB' },
  { city: 'Oxford', region: 'England', range: 'OX1–OX99', prefix: 'OX' },
  { city: 'Southampton', region: 'England', range: 'SO1–SO99', prefix: 'SO' },
  { city: 'Brighton', region: 'England', range: 'BN1–BN99', prefix: 'BN' },
  { city: 'Leicester', region: 'England', range: 'LE1–LE99', prefix: 'LE' },
  { city: 'York', region: 'England', range: 'YO1–YO99', prefix: 'YO' },
  { city: 'Birmingham', region: 'West Midlands', range: 'B1–B99', prefix: 'B' },
  { city: 'Manchester', region: 'Greater Manchester', range: 'M1–M99', prefix: 'M' },
  { city: 'Leeds', region: 'West Yorkshire', range: 'LS1–LS99', prefix: 'LS' },
  { city: 'Liverpool', region: 'Merseyside', range: 'L1–L99', prefix: 'L' },
  { city: 'Bristol', region: 'Bristol', range: 'BS1–BS99', prefix: 'BS' },
  { city: 'Sheffield', region: 'South Yorkshire', range: 'S1–S99', prefix: 'S' },
  { city: 'Edinburgh', region: 'Scotland', range: 'EH1–EH99', prefix: 'EH' },
  { city: 'Glasgow', region: 'Scotland', range: 'G1–G99', prefix: 'G' },
  { city: 'Leicester', region: 'Leicestershire', range: 'LE1–LE99', prefix: 'LE' },
  { city: 'Nottingham', region: 'Nottinghamshire', range: 'NG1–NG99', prefix: 'NG' },
  { city: 'Newcastle', region: 'Tyne and Wear', range: 'NE1–NE99', prefix: 'NE' },
  { city: 'Cardiff', region: 'Wales', range: 'CF1–CF99', prefix: 'CF' },
  { city: 'Belfast', region: 'Northern Ireland', range: 'BT1–BT99', prefix: 'BT' },
  { city: 'Southampton', region: 'Hampshire', range: 'SO1–SO99', prefix: 'SO' },
  { city: 'Portsmouth', region: 'Hampshire', range: 'PO1–PO99', prefix: 'PO' },
  { city: 'Brighton', region: 'East Sussex', range: 'BN1–BN99', prefix: 'BN' },
  { city: 'Plymouth', region: 'Devon', range: 'PL1–PL99', prefix: 'PL' },
  { city: 'Reading', region: 'Berkshire', range: 'RG1–RG99', prefix: 'RG' },
  { city: 'Cambridge', region: 'Cambridgeshire', range: 'CB1–CB99', prefix: 'CB' },
  { city: 'Oxford', region: 'Oxfordshire', range: 'OX1–OX99', prefix: 'OX' },
  { city: 'Bath', region: 'Somerset', range: 'BA1–BA99', prefix: 'BA' },
  { city: 'Aberdeen', region: 'Scotland', range: 'AB1–AB99', prefix: 'AB' },
  { city: 'Dundee', region: 'Scotland', range: 'DD1–DD99', prefix: 'DD' },
  { city: 'Swansea', region: 'Wales', range: 'SA1–SA99', prefix: 'SA' },
];

export const ukRegions = [
  { code: 'ENG', name: 'England 英格兰' }, { code: 'SCT', name: 'Scotland 苏格兰' },
  { code: 'WLS', name: 'Wales 威尔士' }, { code: 'NIR', name: 'Northern Ireland 北爱尔兰' },
];

// UK postcode area to city mapping (key outward code areas)
export const ukAreaMap: Record<string, string> = {
  'AB': 'Aberdeen', 'B': 'Birmingham', 'BA': 'Bath', 'BB': 'Blackburn',
  'BD': 'Bradford', 'BH': 'Bournemouth', 'BL': 'Bolton', 'BN': 'Brighton',
  'BR': 'Bromley', 'BS': 'Bristol', 'BT': 'Belfast', 'CA': 'Carlisle',
  'CB': 'Cambridge', 'CF': 'Cardiff', 'CH': 'Chester', 'CM': 'Chelmsford',
  'CO': 'Colchester', 'CR': 'Croydon', 'CT': 'Canterbury', 'CV': 'Coventry',
  'CW': 'Crewe', 'DA': 'Dartford', 'DD': 'Dundee', 'DE': 'Derby',
  'DG': 'Dumfries', 'DH': 'Durham', 'DL': 'Darlington', 'DN': 'Doncaster',
  'DT': 'Dorchester', 'DY': 'Dudley', 'E': 'East London', 'EC': 'East Central London',
  'EH': 'Edinburgh', 'EN': 'Enfield', 'EX': 'Exeter', 'FK': 'Falkirk',
  'FY': 'Blackpool', 'G': 'Glasgow', 'GL': 'Gloucester', 'GU': 'Guildford',
  'HA': 'Harrow', 'HD': 'Huddersfield', 'HG': 'Harrogate', 'HP': 'Hemel Hempstead',
  'HR': 'Hereford', 'HS': 'Hebrides', 'HU': 'Hull', 'HX': 'Halifax',
  'IG': 'Ilford', 'IP': 'Ipswich', 'IV': 'Inverness', 'KA': 'Kilmarnock',
  'KT': 'Kingston upon Thames', 'KW': 'Kirkwall', 'KY': 'Kirkcaldy',
  'L': 'Liverpool', 'LA': 'Lancaster', 'LD': 'Llandrindod', 'LE': 'Leicester',
  'LL': 'Llandudno', 'LN': 'Lincoln', 'LS': 'Leeds', 'LU': 'Luton',
  'M': 'Manchester', 'ME': 'Medway', 'MK': 'Milton Keynes', 'ML': 'Motherwell',
  'N': 'North London', 'NE': 'Newcastle', 'NG': 'Nottingham', 'NN': 'Northampton',
  'NP': 'Newport', 'NR': 'Norwich', 'NW': 'North West London', 'OL': 'Oldham',
  'OX': 'Oxford', 'PA': 'Paisley', 'PE': 'Peterborough', 'PH': 'Perth',
  'PL': 'Plymouth', 'PO': 'Portsmouth', 'PR': 'Preston', 'RG': 'Reading',
  'RH': 'Redhill', 'RM': 'Romford', 'S': 'Sheffield', 'SA': 'Swansea',
  'SE': 'South East London', 'SG': 'Stevenage', 'SK': 'Stockport',
  'SL': 'Slough', 'SM': 'Sutton', 'SN': 'Swindon', 'SO': 'Southampton',
  'SP': 'Salisbury', 'SR': 'Sunderland', 'SS': 'Southend-on-Sea',
  'ST': 'Stoke-on-Trent', 'SW': 'South West London', 'SY': 'Shrewsbury',
  'TA': 'Taunton', 'TD': 'Galashiels', 'TF': 'Telford', 'TN': 'Tunbridge Wells',
  'TQ': 'Torquay', 'TR': 'Truro', 'TS': 'Middlesbrough', 'TW': 'Twickenham',
  'UB': 'Southall', 'W': 'West London', 'WA': 'Warrington', 'WC': 'West Central London',
  'WD': 'Watford', 'WF': 'Wakefield', 'WN': 'Wigan', 'WR': 'Worcester',
  'WS': 'Walsall', 'WV': 'Wolverhampton', 'YO': 'York', 'ZE': 'Shetland',
};

// ─── Australia ───────────────────────────────────────────────────────────────

export const auRanges: PostalCodeRange[] = [
  { city: 'Sydney', region: 'NSW', range: '2000–2999', prefix: '2' },
  { city: 'Melbourne', region: 'VIC', range: '3000–3999', prefix: '3' },
  { city: 'Brisbane', region: 'QLD', range: '4000–4999', prefix: '4' },
  { city: 'Adelaide', region: 'SA', range: '5000–5999', prefix: '5' },
  { city: 'Perth', region: 'WA', range: '6000–6999', prefix: '6' },
  { city: 'Hobart', region: 'TAS', range: '7000–7999', prefix: '7' },
  { city: 'Darwin', region: 'NT', range: '0800–0899', prefix: '0' },
  { city: 'Canberra', region: 'ACT', range: '0200–0299, 2600–2699', prefix: '0/2' },
  { city: 'Newcastle', region: 'NSW', range: '2300–2399', prefix: '23' },
  { city: 'Wollongong', region: 'NSW', range: '2500–2599', prefix: '25' },
  { city: 'Gold Coast', region: 'QLD', range: '4200–4299', prefix: '42' },
  { city: 'Cairns', region: 'QLD', range: '4800–4899', prefix: '48' },
  { city: 'Geelong', region: 'VIC', range: '3200–3299', prefix: '32' },
  { city: 'Townsville', region: 'QLD', range: '4810–4819', prefix: '481' },
  { city: 'Ballarat', region: 'VIC', range: '3350–3359', prefix: '335' },
  { city: 'Bendigo', region: 'VIC', range: '3550–3559', prefix: '355' },
  { city: 'Albury', region: 'NSW', range: '2640–2649', prefix: '264' },
  { city: 'Launceston', region: 'TAS', range: '7200–7299', prefix: '72' },
  { city: 'Mackay', region: 'QLD', range: '4740–4749', prefix: '474' },
  { city: 'Rockhampton', region: 'QLD', range: '4700–4709', prefix: '470' },
  { city: 'Melbourne', region: 'VIC', range: '3000–3207', prefix: '3' },
  { city: 'Brisbane', region: 'QLD', range: '4000–4199', prefix: '4' },
  { city: 'Perth', region: 'WA', range: '6000–6199', prefix: '6' },
  { city: 'Adelaide', region: 'SA', range: '5000–5199', prefix: '5' },
  { city: 'Gold Coast', region: 'QLD', range: '4210–4218', prefix: '4' },
  { city: 'Newcastle', region: 'NSW', range: '2300–2319', prefix: '2' },
  { city: 'Canberra', region: 'ACT', range: '0200–0299', prefix: '0' },
  { city: 'Sunshine Coast', region: 'QLD', range: '4550–4574', prefix: '4' },
  { city: 'Wollongong', region: 'NSW', range: '2500–2530', prefix: '2' },
  { city: 'Hobart', region: 'TAS', range: '7000–7099', prefix: '7' },
  { city: 'Geelong', region: 'VIC', range: '3210–3227', prefix: '3' },
  { city: 'Townsville', region: 'QLD', range: '4810–4819', prefix: '4' },
  { city: 'Cairns', region: 'QLD', range: '4860–4879', prefix: '4' },
  { city: 'Toowoomba', region: 'QLD', range: '4350–4359', prefix: '4' },
  { city: 'Ballarat', region: 'VIC', range: '3350–3360', prefix: '3' },
  { city: 'Bendigo', region: 'VIC', range: '3550–3559', prefix: '3' },
  { city: 'Albury', region: 'NSW', range: '2640', prefix: '2' },
  { city: 'Launceston', region: 'TAS', range: '7250–7259', prefix: '7' },
  { city: 'Mackay', region: 'QLD', range: '4740–4759', prefix: '4' },
];

export const auStates = [
  { code: 'NSW', name: 'New South Wales 新南威尔士' }, { code: 'VIC', name: 'Victoria 维多利亚' },
  { code: 'QLD', name: 'Queensland 昆士兰' }, { code: 'SA', name: 'South Australia 南澳大利亚' },
  { code: 'WA', name: 'Western Australia 西澳大利亚' }, { code: 'TAS', name: 'Tasmania 塔斯马尼亚' },
  { code: 'NT', name: 'Northern Territory 北部领地' }, { code: 'ACT', name: 'Australian Capital Territory 首都领地' },
];

// Australia first-digit to state mapping
export const auFirstDigitMap: Record<string, string> = {
  '0': 'NT / ACT', '2': 'NSW / ACT', '3': 'VIC', '4': 'QLD',
  '5': 'SA', '6': 'WA', '7': 'TAS', '8': 'NT', '9': 'Australia Post (LVR)',
};

// ─── New Zealand ─────────────────────────────────────────────────────────────

export const nzRanges: PostalCodeRange[] = [
  { city: 'Auckland', region: 'Auckland', range: '0600–0699, 1010–1072, 2010–2164', prefix: '06/10/20' },
  { city: 'Wellington', region: 'Wellington', range: '5010–5047, 6011–6061', prefix: '50/60' },
  { city: 'Christchurch', region: 'Canterbury', range: '8011–8083', prefix: '80' },
  { city: 'Hamilton', region: 'Waikato', range: '3200–3299', prefix: '32' },
  { city: 'Tauranga', region: 'Bay of Plenty', range: '3110–3179', prefix: '31' },
  { city: 'Dunedin', region: 'Otago', range: '9010–9099', prefix: '90' },
  { city: 'Palmerston North', region: 'Manawatū-Whanganui', range: '4410–4499', prefix: '44' },
  { city: 'Napier', region: "Hawke's Bay", range: '4110–4199', prefix: '41' },
  { city: 'Rotorua', region: 'Bay of Plenty', range: '3010–3099', prefix: '30' },
  { city: 'New Plymouth', region: 'Taranaki', range: '4310–4399', prefix: '43' },
  { city: 'Nelson', region: 'Nelson', range: '7010–7099', prefix: '70' },
  { city: 'Invercargill', region: 'Southland', range: '9810–9899', prefix: '98' },
  { city: 'Whangārei', region: 'Northland', range: '0110–0199', prefix: '01' },
  { city: 'Queenstown', region: 'Otago', range: '9300–9399', prefix: '93' },
  { city: 'Gisborne', region: 'Gisborne', range: '4010–4099', prefix: '40' },
  { city: 'Hamilton', region: 'Waikato', range: '3200–3299', prefix: '3' },
  { city: 'Tauranga', region: 'Bay of Plenty', range: '3110–3199', prefix: '3' },
  { city: 'Dunedin', region: 'Otago', range: '9010–9099', prefix: '9' },
  { city: 'Palmerston North', region: 'Manawatu', range: '4410–4499', prefix: '4' },
  { city: 'Napier', region: 'Hawkes Bay', range: '4110–4199', prefix: '4' },
  { city: 'Rotorua', region: 'Bay of Plenty', range: '3010–3099', prefix: '3' },
  { city: 'New Plymouth', region: 'Taranaki', range: '4310–4399', prefix: '4' },
  { city: 'Whangarei', region: 'Northland', range: '0110–0199', prefix: '0' },
  { city: 'Invercargill', region: 'Southland', range: '9810–9899', prefix: '9' },
  { city: 'Wanganui', region: 'Manawatu', range: '4500–4599', prefix: '4' },
  { city: 'Nelson', region: 'Nelson', range: '7010–7099', prefix: '7' },
  { city: 'Hastings', region: 'Hawkes Bay', range: '4120–4199', prefix: '4' },
  { city: 'Queenstown', region: 'Otago', range: '9300–9399', prefix: '9' },
];

export const nzRegions = [
  { code: 'NTL', name: 'Northland 北地' }, { code: 'AUK', name: 'Auckland 奥克兰' },
  { code: 'WKO', name: 'Waikato 怀卡托' }, { code: 'BOP', name: 'Bay of Plenty 丰盛湾' },
  { code: 'TKI', name: 'Taranaki 塔拉纳基' }, { code: 'GIS', name: 'Gisborne 吉斯伯恩' },
  { code: 'HKB', name: "Hawke's Bay 霍克斯湾" }, { code: 'MWT', name: 'Manawatū-Whanganui 马纳瓦图' },
  { code: 'WGN', name: 'Wellington 惠灵顿' }, { code: 'TAS', name: 'Tasman 塔斯曼' },
  { code: 'NSN', name: 'Nelson 尼尔森' }, { code: 'MBH', name: 'Marlborough 马尔堡' },
  { code: 'WTC', name: 'West Coast 西海岸' }, { code: 'CAN', name: 'Canterbury 坎特伯雷' },
  { code: 'OTA', name: 'Otago 奥塔哥' }, { code: 'STL', name: 'Southland 南部' },
];

// NZ first-two-digits to region mapping
export const nzFirstTwoDigitMap: Record<string, string> = {
  '01': 'Northland', '02': 'Northland / Auckland', '04': 'Northland',
  '06': 'Auckland', '10': 'Auckland', '20': 'Auckland / South Auckland',
  '21': 'Papakura', '22': 'South Auckland',
  '30': 'Bay of Plenty (Rotorua)', '31': 'Bay of Plenty (Tauranga)',
  '32': 'Waikato (Hamilton)', '33': 'Waikato', '34': 'Waikato', '35': 'Coromandel',
  '37': 'Waikato', '38': 'Taupo', '39': 'Bay of Plenty',
  '40': 'Gisborne', '41': "Hawke's Bay", '42': 'Manawatū-Whanganui',
  '43': 'Taranaki', '44': 'Manawatū-Whanganui', '46': 'Manawatū-Whanganui',
  '47': 'Manawatū-Whanganui', '48': 'Manawatū-Whanganui', '49': 'Wellington',
  '50': 'Wellington', '52': 'Upper Hutt', '53': 'Porirua',
  '55': 'Manawatū-Whanganui', '56': 'Wellington', '57': 'Manawatū-Whanganui',
  '58': 'Manawatū-Whanganui', '59': 'Manawatū-Whanganui',
  '60': 'Wellington', '61': 'Wellington', '62': 'Wellington',
  '63': 'Wellington (Lower Hutt)', '64': 'Wellington',
  '70': 'Nelson / Tasman', '71': 'Canterbury', '72': 'Marlborough',
  '73': 'Canterbury', '74': 'Canterbury', '75': 'Canterbury', '76': 'Canterbury',
  '77': 'West Coast', '78': 'West Coast', '79': 'Canterbury',
  '80': 'Canterbury (Christchurch)', '81': 'Christchurch',
  '82': 'Christchurch', '83': 'Canterbury', '84': 'Canterbury', '85': 'Canterbury',
  '86': 'Canterbury', '87': 'Canterbury', '88': 'Canterbury', '89': 'Canterbury',
  '90': 'Otago (Dunedin)', '91': 'Otago', '92': 'Otago', '93': 'Otago (Queenstown)',
  '94': 'Otago', '95': 'Southland', '96': 'Southland', '97': 'Southland',
  '98': 'Southland (Invercargill)', '99': 'Southland',
};

// ─── Combined Export ─────────────────────────────────────────────────────────

export const allCountryData: CountryPostalData[] = [
  {
    code: 'CA', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦',
    format: 'ANA NAN（如 M5V 2T6）',
    formatRegex: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
    hint: '6位，字母和数字交替排列，第3位后空格可选。第一位字母对应省份。',
    ranges: canadaRanges,
    stateAbbrevs: canadaStates,
    commonErrors: [
      '不要把字母 O 和数字 0 混淆',
      '第一位不能是 D/F/I/O/Q/U',
      '第二位不能是 0，因为这是保留字母',
      '格式应为 ANA NAN，中间有空格',
      '省份缩写用2位大写字母',
    ],
    officialUrl: 'https://www.canadapost-postescanada.ca/',
    officialName: 'Canada Post',
    officialLookupUrl: 'https://www.canadapost-postescanada.ca/pccl/pcl/en/find-a-postal-code',
  },
  {
    code: 'US', name: '美国', nameEn: 'United States', flag: '🇺🇸',
    format: 'XXXXX 或 XXXXX-XXXX（如 10001 或 10001-1234）',
    formatRegex: /^\d{5}(-\d{4})?$/,
    hint: '5位ZIP码或9位ZIP+4码，纯数字。首位数字代表地理区域（0=东北部，9=西部）。',
    ranges: usRanges,
    stateAbbrevs: usStates,
    commonErrors: [
      '美国邮编只有数字，不要加字母',
      'ZIP+4格式中间是连字符不是空格',
      '州缩写用2位大写字母',
      '地址中州和邮编之间逗号可省略，但需空格分隔',
    ],
    officialUrl: 'https://www.usps.com/',
    officialName: 'USPS',
    officialLookupUrl: 'https://tools.usps.com/go/ZipLookupAction!input.action',
  },
  {
    code: 'GB', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧',
    format: 'AA9A 9AA 或 A9A 9AA 等（如 SW1A 1AA）',
    formatRegex: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s\d[A-Za-z]{2}$/,
    hint: '2-7个字符，前半部分（Outward Code）标识区域和城市，后半部分（Inward Code）标识街道。中间必须有空格。',
    ranges: ukRanges,
    stateAbbrevs: ukRegions,
    commonErrors: [
      '邮编中间必须有空格（Outward Code + Inward Code）',
      '最后一位固定为2个字母',
      '不能使用的字母：C/I/K/M/O/V 在Inward Code中',
      'Outward Code的第一个字母不能是 Q/V/X',
      '注意区分邮编和城市名，邮编前缀不代表完整城市名',
    ],
    officialUrl: 'https://www.royalmail.com/',
    officialName: 'Royal Mail',
    officialLookupUrl: 'https://www.royalmail.com/find-a-postcode',
  },
  {
    code: 'AU', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺',
    format: 'XXXX（4位数字，如 2000）',
    formatRegex: /^\d{4}$/,
    hint: '4位纯数字，第一位代表州（2=NSW/ACT, 3=VIC, 4=QLD, 5=SA, 6=WA, 7=TAS, 0/8=NT, 9=AusPost LVR）。',
    ranges: auRanges,
    stateAbbrevs: auStates,
    commonErrors: [
      '澳洲邮编只有4位数字',
      '第一位数字代表州，可以用来校验',
      '不要加字母或连字符',
      '州缩写一般为3位大写字母',
      '9开头的邮编为 Australia Post 专用（邮件处理中心）',
    ],
    officialUrl: 'https://auspost.com.au/',
    officialName: 'Australia Post',
    officialLookupUrl: 'https://auspost.com.au/business/solutions/data-and-insights/postcode-finder',
  },
  {
    code: 'NZ', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿',
    format: 'XXXX（4位数字，如 1010）',
    formatRegex: /^\d{4}$/,
    hint: '4位纯数字。前两位数字标识区域：01=Northland, 10=Auckland, 32=Hamilton, 60=Wellington, 80=Christchurch, 90=Dunedin。',
    ranges: nzRanges,
    stateAbbrevs: nzRegions,
    commonErrors: [
      '新西兰邮编只有4位数字',
      '不要加字母或连字符',
      '城市和邮编要对应，前两位数字决定区域',
      '新西兰于2006年引入完整4位邮编系统',
    ],
    officialUrl: 'https://www.nzpost.co.nz/',
    officialName: 'NZ Post',
    officialLookupUrl: 'https://www.nzpost.co.nz/tools/find-a-postcode',
  },
];
