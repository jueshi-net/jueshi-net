/**
 * All Countries Configuration
 *
 * Extends the 7 Tier 1 countries from country-config.ts with Tier 2 (enhanced
 * basic) and Tier 3 (basic coverage) countries, providing global ISO coverage.
 *
 * Tier 1: Full content (Hero, local time, tools, taskchain, FAQ, guides, etc.)
 * Tier 2: Enhanced basic (local time, currency, cities, official links, tools)
 * Tier 3: Basic coverage (name, flag, code, timezone, currency, CTA entry)
 *
 * Data sources: ISO 3166-1, IANA timezone database, ISO 4217 currency codes.
 * Postal/official data marked honestly — no fabricated coverage.
 */

import type { CountryConfig, PostalDataStatus, FaqItem } from './country-config';
import { COUNTRY_CONFIGS } from './country-config';

export type CompletenessTier = 1 | 2 | 3;

export interface AllCountryConfig extends CountryConfig {
  region: string;
  subregion: string;
  completenessTier: CompletenessTier;
  isPublished: boolean;
  indexable: boolean;
}

/* ------------------------------------------------------------------ */
/* Generic FAQ for Tier 2/3                                           */
/* ------------------------------------------------------------------ */

const genericFaqs: FaqItem[] = [
  {
    question: '这个国家的邮编叫什么？',
    answer: '不同国家对邮政编码的叫法不同（如 Postal Code、ZIP Code、Postcode、PLZ 等）。请查看本页基础信息卡了解该国家的邮编格式说明。',
  },
  {
    question: '地址格式怎么写？',
    answer: '国际地址一般遵循：收件人姓名 → 街道地址 → 城市/省州 邮编 → 国家。具体格式可能因国家而异，请参考本页地址格式说明或咨询当地邮政。',
  },
  {
    question: '地图结果是否代表精确邮编位置？',
    answer: '地图参考按城市/地区搜索，不代表精确邮编位置。邮编覆盖范围可能跨越多个街区，如需精确投递请以当地邮政官方查询结果为准。',
  },
  {
    question: '找不到邮编时怎么办？',
    answer: '可尝试更换城市/地区名称、检查拼写，或直接访问当地邮政官方网站查询。如仍无法找到，建议联系收件人确认邮编。',
  },
];

/* ------------------------------------------------------------------ */
/* Tier 2 configs                                                      */
/* ------------------------------------------------------------------ */

function makeTier2(
  slug: string,
  countryCode: string,
  nameEn: string,
  nameZh: string,
  region: string,
  subregion: string,
  capital: string,
  majorCities: string[],
  defaultTimezone: string,
  currencyCode: string,
  currencyName: string,
  dialingCode: string,
  postalCodeName: string,
  postalCodeFormat: string,
  addressFormatExample: string,
  officialPostalUrl: string,
  languages: string[],
): AllCountryConfig {
  return {
    slug,
    countryCode,
    nameEn,
    nameZh,
    flagEmoji: countryCodeToFlag(countryCode),
    capital,
    majorCities,
    timezones: [defaultTimezone],
    defaultTimezone,
    currencyCode,
    currencyName,
    dialingCode,
    languages,
    postalDataStatus: 'none' as PostalDataStatus,
    postalRecordCount: 0,
    postalCodeName,
    postalCodeFormat,
    addressFormatExample,
    officialPostalUrl,
    officialCustomsUrl: null,
    officialImmigrationUrl: null,
    heroTitle: `${nameZh} ${nameEn}`,
    heroSubtitle: `${nameZh}地址邮编、货币、时区与发货工具参考`,
    seoTitle: `${nameZh}地址邮编、时间、货币与发货工具 - 绝世百宝箱`,
    seoDescription: `查询${nameZh}邮编和地址格式，使用HS编码、运费计算、商业发票和装箱单工具。`,
    relatedToolSlugs: ['postal-code', 'hs-code', 'shipping-estimator', 'commercial-invoice', 'packing-list', 'address-formatter', 'cbm', 'exchange-rate'],
    relatedGuideSlugs: [],
    faqItems: genericFaqs,
    hotSearches: majorCities.slice(0, 4).map(c => `${c} 邮编`),
    sortOrder: 100,
    region,
    subregion,
    completenessTier: 2,
    isPublished: true,
    indexable: true,
  };
}

/* ------------------------------------------------------------------ */
/* Tier 3 configs                                                      */
/* ------------------------------------------------------------------ */

function makeTier3(
  countryCode: string,
  nameEn: string,
  nameZh: string,
  region: string,
  subregion: string,
  capital: string,
  defaultTimezone: string,
  currencyCode: string,
  currencyName: string,
  dialingCode: string,
): AllCountryConfig {
  const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    slug,
    countryCode,
    nameEn,
    nameZh,
    flagEmoji: countryCodeToFlag(countryCode),
    capital,
    majorCities: [],
    timezones: defaultTimezone ? [defaultTimezone] : [],
    defaultTimezone: defaultTimezone || 'UTC',
    currencyCode,
    currencyName,
    dialingCode,
    languages: [],
    postalDataStatus: 'none' as PostalDataStatus,
    postalRecordCount: 0,
    postalCodeName: 'Postal Code',
    postalCodeFormat: '—',
    addressFormatExample: 'Address format data is being collected.\nPlease refer to the local postal service for accurate formatting.',
    officialPostalUrl: '',
    officialCustomsUrl: null,
    officialImmigrationUrl: null,
    heroTitle: `${nameZh} ${nameEn}`,
    heroSubtitle: `${nameZh}基础信息与时区参考，资料持续补充中`,
    seoTitle: `${nameZh}时间、货币与基础信息 - 绝世百宝箱`,
    seoDescription: `${nameZh}当地时间、货币、电话区号等基础参考信息。`,
    relatedToolSlugs: ['postal-code', 'hs-code', 'shipping-estimator', 'commercial-invoice', 'packing-list', 'exchange-rate'],
    relatedGuideSlugs: [],
    faqItems: genericFaqs,
    hotSearches: [],
    sortOrder: 999,
    region,
    subregion,
    completenessTier: 3,
    isPublished: true,
    indexable: false,
  };
}

/* ------------------------------------------------------------------ */
/* Flag emoji helper                                                   */
/* ------------------------------------------------------------------ */

function countryCodeToFlag(cc: string): string {
  if (!cc || cc.length !== 2) return '🏳️';
  const cp1 = 0x1F1E6 + cc.charCodeAt(0) - 65;
  const cp2 = 0x1F1E6 + cc.charCodeAt(1) - 65;
  return String.fromCodePoint(cp1, cp2);
}

/* ------------------------------------------------------------------ */
/* Build all configs                                                   */
/* ------------------------------------------------------------------ */

const tier2Data: AllCountryConfig[] = [
  makeTier2("china","CN","China","中国","Asia","Eastern Asia","Beijing",["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],"Asia/Shanghai","CNY","Chinese Yuan","+86","邮政编码","NNNNNN","张三\n北京市朝阳区建国路88号\n100022\n中国","https://www.chinapost.cn",["Chinese", "English"]),
  makeTier2("germany","DE","Germany","德国","Europe","Western Europe","Berlin",["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],"Europe/Berlin","EUR","Euro","+49","Postleitzahl (PLZ)","NNNNN","Max Mustermann\nHauptstraße 1\n10115 Berlin\nGermany","https://www.deutschepost.de",["German"]),
  makeTier2("france","FR","France","法国","Europe","Western Europe","Paris",["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],"Europe/Paris","EUR","Euro","+33","Code Postal","NNNNN","Jean Dupont\n12 Rue de la Paix\n75002 Paris\nFrance","https://www.laposte.fr",["French"]),
  makeTier2("italy","IT","Italy","意大利","Europe","Southern Europe","Rome",["Rome", "Milan", "Naples", "Turin", "Florence"],"Europe/Rome","EUR","Euro","+39","CAP","NNNNN","Mario Rossi\nVia Roma 1\n00100 Roma\nItaly","https://www.poste.it",["Italian"]),
  makeTier2("spain","ES","Spain","西班牙","Europe","Southern Europe","Madrid",["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],"Europe/Madrid","EUR","Euro","+34","Código Postal","NNNNN","Juan García\nCalle Mayor 1\n28001 Madrid\nSpain","https://www.correos.es",["Spanish"]),
  makeTier2("netherlands","NL","Netherlands","荷兰","Europe","Western Europe","Amsterdam",["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],"Europe/Amsterdam","EUR","Euro","+31","Postcode","NNNN AA","Jan Jansen\nKalverstraat 1\n1011 NX Amsterdam\nNetherlands","https://www.postnl.nl",["Dutch"]),
  makeTier2("united-arab-emirates","AE","United Arab Emirates","阿联酋","Asia","Western Asia","Abu Dhabi",["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain"],"Asia/Dubai","AED","UAE Dirham","+971","Postal Code","NNNNN","Ahmed Ali\nSheikh Zayed Road\nDubai\nUnited Arab Emirates","https://www.epg.ae",["Arabic", "English"]),
  makeTier2("thailand","TH","Thailand","泰国","Asia","Southeast Asia","Bangkok",["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Khon Kaen"],"Asia/Bangkok","THB","Thai Baht","+66","Postal Code","NNNNN","Somchai Jaidee\n123 Sukhumvit Road\n10110 Bangkok\nThailand","https://www.thailandpost.co.th",["Thai"]),
  makeTier2("vietnam","VN","Vietnam","越南","Asia","Southeast Asia","Hanoi",["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho"],"Asia/Ho_Chi_Minh","VND","Vietnamese Dong","+84","Mã bưu chính","NNNNNN","Nguyen Van A\n123 Le Loi Street\n700000 Ho Chi Minh City\nVietnam","https://www.vnpost.vn",["Vietnamese"]),
  makeTier2("south-korea","KR","South Korea","韩国","Asia","Eastern Asia","Seoul",["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],"Asia/Seoul","KRW","South Korean Won","+82","우편번호","NNNNN","Kim Min-su\n123 Gangnam-daero\n06236 Seoul\nSouth Korea","https://www.koreapost.go.kr",["Korean"]),
  makeTier2("india","IN","India","印度","Asia","Southern Asia","New Delhi",["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"],"Asia/Kolkata","INR","Indian Rupee","+91","PIN Code","NNNNNN","Raj Kumar\n123 MG Road\n110001 New Delhi\nIndia","https://www.indiapost.gov.in",["Hindi", "English"]),
  makeTier2("indonesia","ID","Indonesia","印度尼西亚","Asia","Southeast Asia","Jakarta",["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"],"Asia/Jakarta","IDR","Indonesian Rupiah","+62","Kode Pos","NNNNN","Budi Santoso\nJl. Sudirman No.1\n12190 Jakarta\nIndonesia","https://www.posindonesia.co.id",["Indonesian"]),
  makeTier2("philippines","PH","Philippines","菲律宾","Asia","Southeast Asia","Manila",["Manila", "Quezon City", "Davao", "Cebu City", "Caloocan"],"Asia/Manila","PHP","Philippine Peso","+63","Postal Code","NNNN","Juan Dela Cruz\n123 Mabini Street\n1000 Manila\nPhilippines","https://www.phlpost.gov.ph",["Filipino", "English"]),
  makeTier2("new-zealand","NZ","New Zealand","新西兰","Oceania","Australia and New Zealand","Wellington",["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga"],"Pacific/Auckland","NZD","New Zealand Dollar","+64","Postcode","NNNN","John Smith\n123 Queen Street\n1010 Auckland\nNew Zealand","https://www.nzpost.co.nz",["English"]),
  makeTier2("ireland","IE","Ireland","爱尔兰","Europe","Northern Europe","Dublin",["Dublin", "Cork", "Galway", "Limerick", "Waterford"],"Europe/Dublin","EUR","Euro","+353","Eircode","A65 F4E2","John Murphy\n123 O\'Connell Street\nD01 AB12 Dublin\nIreland","https://www.anpost.ie",["English"]),
  makeTier2("portugal","PT","Portugal","葡萄牙","Europe","Southern Europe","Lisbon",["Lisbon", "Porto", "Braga", "Coimbra", "Faro"],"Europe/Lisbon","EUR","Euro","+351","Código Postal","NNNN-NNN","João Silva\nRua Augusta 1\n1100-053 Lisboa\nPortugal","https://www.ctt.pt",["Portuguese"]),
  makeTier2("belgium","BE","Belgium","比利时","Europe","Western Europe","Brussels",["Brussels", "Antwerp", "Ghent", "Bruges", "Liege"],"Europe/Brussels","EUR","Euro","+32","Postcode","NNNN","Jean Dupont\nRue Neuve 1\n1000 Bruxelles\nBelgium","https://www.bpost.be",["Dutch", "French"]),
  makeTier2("switzerland","CH","Switzerland","瑞士","Europe","Western Europe","Bern",["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],"Europe/Zurich","CHF","Swiss Franc","+41","PLZ / NPA","NNNN","Hans Müller\nBahnhofstrasse 1\n8001 Zürich\nSwitzerland","https://www.post.ch",["German", "French", "Italian"]),
  makeTier2("austria","AT","Austria","奥地利","Europe","Western Europe","Vienna",["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],"Europe/Vienna","EUR","Euro","+43","Postleitzahl","NNNN","Hans Schmidt\nStephansplatz 1\n1010 Wien\nAustria","https://www.post.at",["German"]),
  makeTier2("sweden","SE","Sweden","瑞典","Europe","Northern Europe","Stockholm",["Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras"],"Europe/Stockholm","SEK","Swedish Krona","+46","Postnummer","NNN NN","Erik Andersson\nDrottninggatan 1\n111 51 Stockholm\nSweden","https://www.postnord.se",["Swedish"]),
  makeTier2("norway","NO","Norway","挪威","Europe","Northern Europe","Oslo",["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen"],"Europe/Oslo","NOK","Norwegian Krone","+47","Postnummer","NNNN","Ole Hansen\nKarl Johans gate 1\n0154 Oslo\nNorway","https://www.posten.no",["Norwegian"]),
  makeTier2("denmark","DK","Denmark","丹麦","Europe","Northern Europe","Copenhagen",["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"],"Europe/Copenhagen","DKK","Danish Krone","+45","Postnummer","NNNN","Jens Nielsen\nStrøget 1\n1000 København\nDenmark","https://www.postnord.dk",["Danish"]),
  makeTier2("finland","FI","Finland","芬兰","Europe","Northern Europe","Helsinki",["Helsinki", "Espoo", "Tampere", "Vantaa", "Turku"],"Europe/Helsinki","EUR","Euro","+358","Postinumero","NNNNN","Matti Virtanen\nMannerheimintie 1\n00100 Helsinki\nFinland","https://www.posti.fi",["Finnish", "Swedish"]),
  makeTier2("poland","PL","Poland","波兰","Europe","Eastern Europe","Warsaw",["Warsaw", "Krakow", "Lodz", "Wroclaw", "Poznan"],"Europe/Warsaw","PLN","Polish Zloty","+48","Kod pocztowy","NN-NNN","Jan Kowalski\nul. Marszałkowska 1\n00-001 Warszawa\nPoland","https://www.poczta-polska.pl",["Polish"]),
  makeTier2("czech-republic","CZ","Czech Republic","捷克","Europe","Eastern Europe","Prague",["Prague", "Brno", "Ostrava", "Plzen", "Liberec"],"Europe/Prague","CZK","Czech Koruna","+420","PSČ","NNN NN","Jan Novák\nVáclavské náměstí 1\n110 00 Praha\nCzech Republic","https://www.ceskaposta.cz",["Czech"]),
  makeTier2("greece","GR","Greece","希腊","Europe","Southern Europe","Athens",["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],"Europe/Athens","EUR","Euro","+30","Ταχυδρομικός Κώδικας","NNN NN","Giannis Papadopoulos\nErmou 1\n105 60 Athina\nGreece","https://www.elta.gr",["Greek"]),
  makeTier2("turkey","TR","Turkey","土耳其","Asia","Western Asia","Ankara",["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],"Europe/Istanbul","TRY","Turkish Lira","+90","Posta Kodu","NNNNN","Ahmet Yilmaz\nIstiklal Caddesi 1\n34421 Istanbul\nTurkey","https://www.ptt.gov.tr",["Turkish"]),
  makeTier2("russia","RU","Russia","俄罗斯","Europe","Eastern Europe","Moscow",["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"],"Europe/Moscow","RUB","Russian Ruble","+7","Почтовый индекс","NNNNNN","Ivan Ivanov\nul. Tverskaya 1\n125009 Moscow\nRussia","https://www.pochta.ru",["Russian"]),
  makeTier2("brazil","BR","Brazil","巴西","Americas","South America","Brasilia",["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza"],"America/Sao_Paulo","BRL","Brazilian Real","+55","CEP","NNNNN-NNN","João Silva\nAv. Paulista 1\n01310-100 São Paulo\nBrazil","https://www.correios.com.br",["Portuguese"]),
  makeTier2("mexico","MX","Mexico","墨西哥","Americas","North America","Mexico City",["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],"America/Mexico_City","MXN","Mexican Peso","+52","Código Postal","NNNNN","Juan López\nAv. Reforma 1\n06600 Ciudad de México\nMexico","https://www.correosdemexico.gob.mx",["Spanish"]),
  makeTier2("south-africa","ZA","South Africa","南非","Africa","Southern Africa","Pretoria",["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],"Africa/Johannesburg","ZAR","South African Rand","+27","Postal Code","NNNN","John Smith\n123 Main Street\n2000 Johannesburg\nSouth Africa","https://www.postoffice.co.za",["English", "Afrikaans"]),
  makeTier2("egypt","EG","Egypt","埃及","Africa","Northern Africa","Cairo",["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"],"Africa/Cairo","EGP","Egyptian Pound","+20","Postal Code","NNNNN","Ahmed Hassan\n123 Tahrir Square\n11511 Cairo\nEgypt","https://www.egyptpost.org",["Arabic"]),
  makeTier2("saudi-arabia","SA","Saudi Arabia","沙特阿拉伯","Asia","Western Asia","Riyadh",["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],"Asia/Riyadh","SAR","Saudi Riyal","+966","Postal Code","NNNNN","Abdullah Al-Saud\nKing Fahd Road\n12244 Riyadh\nSaudi Arabia","https://www.sp.com.sa",["Arabic"]),
  makeTier2("hong-kong","HK","Hong Kong","香港","Asia","Eastern Asia","Hong Kong",["Hong Kong", "Kowloon", "Tsuen Wan", "Yuen Long", "Tuen Mun"],"Asia/Hong_Kong","HKD","Hong Kong Dollar","+852","—","—","Chan Tai Man\n123 Nathan Road\nTsim Sha Tsui\nHong Kong","",["Chinese", "English"]),
  makeTier2("taiwan","TW","Taiwan","台湾","Asia","Eastern Asia","Taipei",["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu"],"Asia/Taipei","TWD","New Taiwan Dollar","+886","郵遞區號","NNNN","Lin Chia-ming\n123 Zhongxiao E. Rd\n100 Taipei\nTaiwan","https://www.post.gov.tw",["Chinese"]),
];

/* ------------------------------------------------------------------ */
/* Tier 3 configs                                                      */
/* ------------------------------------------------------------------ */

const tier3Data: AllCountryConfig[] = [
  makeTier3("AF","Afghanistan","阿富汗","Asia","Southern Asia","Kabul","Asia/Kabul","AFN","Afghan Afghani","+93"),
  makeTier3("AL","Albania","阿尔巴尼亚","Europe","Southern Europe","Tirana","Europe/Tirane","ALL","Albanian Lek","+355"),
  makeTier3("DZ","Algeria","阿尔及利亚","Africa","Northern Africa","Algiers","Africa/Algiers","DZD","Algerian Dinar","+213"),
  makeTier3("AD","Andorra","安道尔","Europe","Southern Europe","Andorra la Vella","Europe/Andorra","EUR","Euro","+376"),
  makeTier3("AO","Angola","安哥拉","Africa","Sub-Saharan Africa","Luanda","Africa/Luanda","AOA","Angolan Kwanza","+244"),
  makeTier3("AG","Antigua and Barbuda","安提瓜和巴布达","Americas","Caribbean","Saint John's","America/Antigua","XCD","East Caribbean Dollar","+1"),
  makeTier3("AR","Argentina","阿根廷","Americas","South America","Buenos Aires","America/Argentina/Buenos_Aires","ARS","Argentine Peso","+54"),
  makeTier3("AM","Armenia","亚美尼亚","Asia","Western Asia","Yerevan","Asia/Yerevan","AMD","Armenian Dram","+374"),
  makeTier3("AW","Aruba","阿鲁巴","Americas","Caribbean","Oranjestad","America/Aruba","AWG","Aruban Florin","+297"),
  makeTier3("AZ","Azerbaijan","阿塞拜疆","Asia","Western Asia","Baku","Asia/Baku","AZN","Azerbaijani Manat","+994"),
  makeTier3("BS","Bahamas","巴哈马","Americas","Caribbean","Nassau","America/Nassau","BSD","Bahamian Dollar","+1"),
  makeTier3("BH","Bahrain","巴林","Asia","Western Asia","Manama","Asia/Bahrain","BHD","Bahraini Dinar","+973"),
  makeTier3("BD","Bangladesh","孟加拉国","Asia","Southern Asia","Dhaka","Asia/Dhaka","BDT","Bangladeshi Taka","+880"),
  makeTier3("BB","Barbados","巴巴多斯","Americas","Caribbean","Bridgetown","America/Barbados","BBD","Barbadian Dollar","+1"),
  makeTier3("BY","Belarus","白俄罗斯","Europe","Eastern Europe","Minsk","Europe/Minsk","BYN","Belarusian Ruble","+375"),
  makeTier3("BZ","Belize","伯利兹","Americas","Central America","Belmopan","America/Belize","BZD","Belize Dollar","+501"),
  makeTier3("BJ","Benin","贝宁","Africa","Sub-Saharan Africa","Porto-Novo","Africa/Porto-Novo","XOF","West African CFA Franc","+229"),
  makeTier3("BT","Bhutan","不丹","Asia","Southern Asia","Thimphu","Asia/Thimphu","BTN","Bhutanese Ngultrum","+975"),
  makeTier3("BO","Bolivia","玻利维亚","Americas","South America","Sucre","America/La_Paz","BOB","Bolivian Boliviano","+591"),
  makeTier3("BA","Bosnia and Herzegovina","波黑","Europe","Southern Europe","Sarajevo","Europe/Sarajevo","BAM","Bosnia Mark","+387"),
  makeTier3("BW","Botswana","博茨瓦纳","Africa","Sub-Saharan Africa","Gaborone","Africa/Gaborone","BWP","Botswana Pula","+267"),
  makeTier3("BN","Brunei","文莱","Asia","Southeast Asia","Bandar Seri Begawan","Asia/Brunei","BND","Brunei Dollar","+673"),
  makeTier3("BG","Bulgaria","保加利亚","Europe","Eastern Europe","Sofia","Europe/Sofia","BGN","Bulgarian Lev","+359"),
  makeTier3("BF","Burkina Faso","布基纳法索","Africa","Sub-Saharan Africa","Ouagadougou","Africa/Ouagadougou","XOF","West African CFA Franc","+226"),
  makeTier3("BI","Burundi","布隆迪","Africa","Sub-Saharan Africa","Gitega","Africa/Bujumbura","BIF","Burundian Franc","+257"),
  makeTier3("KH","Cambodia","柬埔寨","Asia","Southeast Asia","Phnom Penh","Asia/Phnom_Penh","KHR","Cambodian Riel","+855"),
  makeTier3("CM","Cameroon","喀麦隆","Africa","Sub-Saharan Africa","Yaounde","Africa/Douala","XAF","Central African CFA Franc","+237"),
  makeTier3("CV","Cape Verde","佛得角","Africa","Sub-Saharan Africa","Praia","Atlantic/Cape_Verde","CVE","Cape Verdean Escudo","+238"),
  makeTier3("CF","Central African Republic","中非","Africa","Sub-Saharan Africa","Bangui","Africa/Bangui","XAF","Central African CFA Franc","+236"),
  makeTier3("TD","Chad","乍得","Africa","Sub-Saharan Africa","N'Djamena","Africa/Ndjamena","XAF","Central African CFA Franc","+235"),
  makeTier3("CL","Chile","智利","Americas","South America","Santiago","America/Santiago","CLP","Chilean Peso","+56"),
  makeTier3("CO","Colombia","哥伦比亚","Americas","South America","Bogota","America/Bogota","COP","Colombian Peso","+57"),
  makeTier3("KM","Comoros","科摩罗","Africa","Sub-Saharan Africa","Moroni","Indian/Comoro","KMF","Comorian Franc","+269"),
  makeTier3("CG","Congo","刚果","Africa","Sub-Saharan Africa","Brazzaville","Africa/Brazzaville","XAF","Central African CFA Franc","+242"),
  makeTier3("CD","DR Congo","刚果(金)","Africa","Sub-Saharan Africa","Kinshasa","Africa/Kinshasa","CDF","Congolese Franc","+243"),
  makeTier3("CR","Costa Rica","哥斯达黎加","Americas","Central America","San Jose","America/Costa_Rica","CRC","Costa Rican Colon","+506"),
  makeTier3("CI","Cote d'Ivoire","科特迪瓦","Africa","Sub-Saharan Africa","Yamoussoukro","Africa/Abidjan","XOF","West African CFA Franc","+225"),
  makeTier3("HR","Croatia","克罗地亚","Europe","Southern Europe","Zagreb","Europe/Zagreb","EUR","Euro","+385"),
  makeTier3("CU","Cuba","古巴","Americas","Caribbean","Havana","America/Havana","CUP","Cuban Peso","+53"),
  makeTier3("CY","Cyprus","塞浦路斯","Europe","Southern Europe","Nicosia","Asia/Nicosia","EUR","Euro","+357"),
  makeTier3("DJ","Djibouti","吉布提","Africa","Sub-Saharan Africa","Djibouti","Africa/Djibouti","DJF","Djiboutian Franc","+253"),
  makeTier3("DM","Dominica","多米尼克","Americas","Caribbean","Roseau","America/Dominica","XCD","East Caribbean Dollar","+1"),
  makeTier3("DO","Dominican Republic","多米尼加","Americas","Caribbean","Santo Domingo","America/Santo_Domingo","DOP","Dominican Peso","+1"),
  makeTier3("EC","Ecuador","厄瓜多尔","Americas","South America","Quito","America/Guayaquil","USD","US Dollar","+593"),
  makeTier3("SV","El Salvador","萨尔瓦多","Americas","Central America","San Salvador","America/El_Salvador","USD","US Dollar","+503"),
  makeTier3("GQ","Equatorial Guinea","赤道几内亚","Africa","Sub-Saharan Africa","Malabo","Africa/Malabo","XAF","Central African CFA Franc","+240"),
  makeTier3("ER","Eritrea","厄立特里亚","Africa","Sub-Saharan Africa","Asmara","Africa/Asmara","ERN","Eritrean Nakfa","+291"),
  makeTier3("EE","Estonia","爱沙尼亚","Europe","Northern Europe","Tallinn","Europe/Tallinn","EUR","Euro","+372"),
  makeTier3("SZ","Eswatini","斯威士兰","Africa","Sub-Saharan Africa","Mbabane","Africa/Mbabane","SZL","Swazi Lilangeni","+268"),
  makeTier3("ET","Ethiopia","埃塞俄比亚","Africa","Sub-Saharan Africa","Addis Ababa","Africa/Addis_Ababa","ETB","Ethiopian Birr","+251"),
  makeTier3("FJ","Fiji","斐济","Oceania","Melanesia","Suva","Pacific/Fiji","FJD","Fijian Dollar","+679"),
  makeTier3("GA","Gabon","加蓬","Africa","Sub-Saharan Africa","Libreville","Africa/Libreville","XAF","Central African CFA Franc","+241"),
  makeTier3("GM","Gambia","冈比亚","Africa","Sub-Saharan Africa","Banjul","Africa/Banjul","GMD","Gambian Dalasi","+220"),
  makeTier3("GE","Georgia","格鲁吉亚","Asia","Western Asia","Tbilisi","Asia/Tbilisi","GEL","Georgian Lari","+995"),
  makeTier3("GH","Ghana","加纳","Africa","Sub-Saharan Africa","Accra","Africa/Accra","GHS","Ghanaian Cedi","+233"),
  makeTier3("GD","Grenada","格林纳达","Americas","Caribbean","Saint George's","America/Grenada","XCD","East Caribbean Dollar","+1"),
  makeTier3("GT","Guatemala","危地马拉","Americas","Central America","Guatemala City","America/Guatemala","GTQ","Guatemalan Quetzal","+502"),
  makeTier3("GN","Guinea","几内亚","Africa","Sub-Saharan Africa","Conakry","Africa/Conakry","GNF","Guinean Franc","+224"),
  makeTier3("GW","Guinea-Bissau","几内亚比绍","Africa","Sub-Saharan Africa","Bissau","Africa/Bissau","XOF","West African CFA Franc","+245"),
  makeTier3("GY","Guyana","圭亚那","Americas","South America","Georgetown","America/Guyana","GYD","Guyanese Dollar","+592"),
  makeTier3("HT","Haiti","海地","Americas","Caribbean","Port-au-Prince","America/Port-au-Prince","HTG","Haitian Gourde","+509"),
  makeTier3("HN","Honduras","洪都拉斯","Americas","Central America","Tegucigalpa","America/Tegucigalpa","HNL","Honduran Lempira","+504"),
  makeTier3("HU","Hungary","匈牙利","Europe","Eastern Europe","Budapest","Europe/Budapest","HUF","Hungarian Forint","+36"),
  makeTier3("IS","Iceland","冰岛","Europe","Northern Europe","Reykjavik","Atlantic/Reykjavik","ISK","Icelandic Krona","+354"),
  makeTier3("IR","Iran","伊朗","Asia","Southern Asia","Tehran","Asia/Tehran","IRR","Iranian Rial","+98"),
  makeTier3("IQ","Iraq","伊拉克","Asia","Western Asia","Baghdad","Asia/Baghdad","IQD","Iraqi Dinar","+964"),
  makeTier3("IL","Israel","以色列","Asia","Western Asia","Jerusalem","Asia/Jerusalem","ILS","Israeli Shekel","+972"),
  makeTier3("JM","Jamaica","牙买加","Americas","Caribbean","Kingston","America/Jamaica","JMD","Jamaican Dollar","+1"),
  makeTier3("JO","Jordan","约旦","Asia","Western Asia","Amman","Asia/Amman","JOD","Jordanian Dinar","+962"),
  makeTier3("KZ","Kazakhstan","哈萨克斯坦","Asia","Central Asia","Astana","Asia/Almaty","KZT","Kazakhstani Tenge","+7"),
  makeTier3("KE","Kenya","肯尼亚","Africa","Sub-Saharan Africa","Nairobi","Africa/Nairobi","KES","Kenyan Shilling","+254"),
  makeTier3("KI","Kiribati","基里巴斯","Oceania","Micronesia","Tarawa","Pacific/Tarawa","AUD","Australian Dollar","+686"),
  makeTier3("KP","North Korea","朝鲜","Asia","Eastern Asia","Pyongyang","Asia/Pyongyang","KPW","North Korean Won","+850"),
  makeTier3("KW","Kuwait","科威特","Asia","Western Asia","Kuwait City","Asia/Kuwait","KWD","Kuwaiti Dinar","+965"),
  makeTier3("KG","Kyrgyzstan","吉尔吉斯斯坦","Asia","Central Asia","Bishkek","Asia/Bishkek","KGS","Kyrgyzstani Som","+996"),
  makeTier3("LA","Laos","老挝","Asia","Southeast Asia","Vientiane","Asia/Vientiane","LAK","Lao Kip","+856"),
  makeTier3("LV","Latvia","拉脱维亚","Europe","Northern Europe","Riga","Europe/Riga","EUR","Euro","+371"),
  makeTier3("LB","Lebanon","黎巴嫩","Asia","Western Asia","Beirut","Asia/Beirut","LBP","Lebanese Pound","+961"),
  makeTier3("LS","Lesotho","莱索托","Africa","Sub-Saharan Africa","Maseru","Africa/Maseru","LSL","Lesotho Loti","+266"),
  makeTier3("LR","Liberia","利比里亚","Africa","Sub-Saharan Africa","Monrovia","Africa/Monrovia","LRD","Liberian Dollar","+231"),
  makeTier3("LY","Libya","利比亚","Africa","Northern Africa","Tripoli","Africa/Tripoli","LYD","Libyan Dinar","+218"),
  makeTier3("LI","Liechtenstein","列支敦士登","Europe","Western Europe","Vaduz","Europe/Vaduz","CHF","Swiss Franc","+423"),
  makeTier3("LT","Lithuania","立陶宛","Europe","Northern Europe","Vilnius","Europe/Vilnius","EUR","Euro","+370"),
  makeTier3("LU","Luxembourg","卢森堡","Europe","Western Europe","Luxembourg","Europe/Luxembourg","EUR","Euro","+352"),
  makeTier3("MO","Macao","澳门","Asia","Eastern Asia","Macau","Asia/Macau","MOP","Macanese Pataca","+853"),
  makeTier3("MG","Madagascar","马达加斯加","Africa","Sub-Saharan Africa","Antananarivo","Indian/Antananarivo","MGA","Malagasy Ariary","+261"),
  makeTier3("MW","Malawi","马拉维","Africa","Sub-Saharan Africa","Lilongwe","Africa/Blantyre","MWK","Malawian Kwacha","+265"),
  makeTier3("MV","Maldives","马尔代夫","Asia","Southern Asia","Male","Indian/Maldives","MVR","Maldivian Rufiyaa","+960"),
  makeTier3("ML","Mali","马里","Africa","Sub-Saharan Africa","Bamako","Africa/Bamako","XOF","West African CFA Franc","+223"),
  makeTier3("MT","Malta","马耳他","Europe","Southern Europe","Valletta","Europe/Malta","EUR","Euro","+356"),
  makeTier3("MR","Mauritania","毛里塔尼亚","Africa","Sub-Saharan Africa","Nouakchott","Africa/Nouakchott","MRU","Mauritanian Ouguiya","+222"),
  makeTier3("MU","Mauritius","毛里求斯","Africa","Sub-Saharan Africa","Port Louis","Indian/Mauritius","MUR","Mauritian Rupee","+230"),
  makeTier3("MD","Moldova","摩尔多瓦","Europe","Eastern Europe","Chisinau","Europe/Chisinau","MDL","Moldovan Leu","+373"),
  makeTier3("MC","Monaco","摩纳哥","Europe","Western Europe","Monaco","Europe/Monaco","EUR","Euro","+377"),
  makeTier3("MN","Mongolia","蒙古","Asia","Eastern Asia","Ulaanbaatar","Asia/Ulaanbaatar","MNT","Mongolian Tugrik","+976"),
  makeTier3("ME","Montenegro","黑山","Europe","Southern Europe","Podgorica","Europe/Podgorica","EUR","Euro","+382"),
  makeTier3("MA","Morocco","摩洛哥","Africa","Northern Africa","Rabat","Africa/Casablanca","MAD","Moroccan Dirham","+212"),
  makeTier3("MZ","Mozambique","莫桑比克","Africa","Sub-Saharan Africa","Maputo","Africa/Maputo","MZN","Mozambican Metical","+258"),
  makeTier3("MM","Myanmar","缅甸","Asia","Southeast Asia","Naypyidaw","Asia/Yangon","MMK","Burmese Kyat","+95"),
  makeTier3("NA","Namibia","纳米比亚","Africa","Sub-Saharan Africa","Windhoek","Africa/Windhoek","NAD","Namibian Dollar","+264"),
  makeTier3("NR","Nauru","瑙鲁","Oceania","Micronesia","Yaren","Pacific/Nauru","AUD","Australian Dollar","+674"),
  makeTier3("NP","Nepal","尼泊尔","Asia","Southern Asia","Kathmandu","Asia/Kathmandu","NPR","Nepalese Rupee","+977"),
  makeTier3("NI","Nicaragua","尼加拉瓜","Americas","Central America","Managua","America/Managua","NIO","Nicaraguan Cordoba","+505"),
  makeTier3("NE","Niger","尼日尔","Africa","Sub-Saharan Africa","Niamey","Africa/Niamey","XOF","West African CFA Franc","+227"),
  makeTier3("NG","Nigeria","尼日利亚","Africa","Sub-Saharan Africa","Abuja","Africa/Lagos","NGN","Nigerian Naira","+234"),
  makeTier3("MK","North Macedonia","北马其顿","Europe","Southern Europe","Skopje","Europe/Skopje","MKD","Macedonian Denar","+389"),
  makeTier3("OM","Oman","阿曼","Asia","Western Asia","Muscat","Asia/Muscat","OMR","Omani Rial","+968"),
  makeTier3("PK","Pakistan","巴基斯坦","Asia","Southern Asia","Islamabad","Asia/Karachi","PKR","Pakistani Rupee","+92"),
  makeTier3("PW","Palau","帕劳","Oceania","Micronesia","Ngerulmud","Pacific/Palau","USD","US Dollar","+680"),
  makeTier3("PA","Panama","巴拿马","Americas","Central America","Panama City","America/Panama","PAB","Panamanian Balboa","+507"),
  makeTier3("PG","Papua New Guinea","巴布亚新几内亚","Oceania","Melanesia","Port Moresby","Pacific/Port_Moresby","PGK","Papua New Guinean Kina","+675"),
  makeTier3("PY","Paraguay","巴拉圭","Americas","South America","Asuncion","America/Asuncion","PYG","Paraguayan Guarani","+595"),
  makeTier3("PE","Peru","秘鲁","Americas","South America","Lima","America/Lima","PEN","Peruvian Sol","+51"),
  makeTier3("QA","Qatar","卡塔尔","Asia","Western Asia","Doha","Asia/Qatar","QAR","Qatari Riyal","+974"),
  makeTier3("RO","Romania","罗马尼亚","Europe","Eastern Europe","Bucharest","Europe/Bucharest","RON","Romanian Leu","+40"),
  makeTier3("RW","Rwanda","卢旺达","Africa","Sub-Saharan Africa","Kigali","Africa/Kigali","RWF","Rwandan Franc","+250"),
  makeTier3("WS","Samoa","萨摩亚","Oceania","Polynesia","Apia","Pacific/Apia","WST","Samoan Tala","+685"),
  makeTier3("SM","San Marino","圣马力诺","Europe","Southern Europe","San Marino","Europe/San_Marino","EUR","Euro","+378"),
  makeTier3("ST","Sao Tome and Principe","圣多美和普林西比","Africa","Sub-Saharan Africa","Sao Tome","Africa/Sao_Tome","STN","Sao Tome Dobra","+239"),
  makeTier3("SN","Senegal","塞内加尔","Africa","Sub-Saharan Africa","Dakar","Africa/Dakar","XOF","West African CFA Franc","+221"),
  makeTier3("RS","Serbia","塞尔维亚","Europe","Southern Europe","Belgrade","Europe/Belgrade","RSD","Serbian Dinar","+381"),
  makeTier3("SC","Seychelles","塞舌尔","Africa","Sub-Saharan Africa","Victoria","Indian/Mahe","SCR","Seychellois Rupee","+248"),
  makeTier3("SL","Sierra Leone","塞拉利昂","Africa","Sub-Saharan Africa","Freetown","Africa/Freetown","SLL","Sierra Leonean Leone","+232"),
  makeTier3("SK","Slovakia","斯洛伐克","Europe","Eastern Europe","Bratislava","Europe/Bratislava","EUR","Euro","+421"),
  makeTier3("SI","Slovenia","斯洛文尼亚","Europe","Southern Europe","Ljubljana","Europe/Ljubljana","EUR","Euro","+386"),
  makeTier3("SB","Solomon Islands","所罗门群岛","Oceania","Melanesia","Honiara","Pacific/Guadalcanal","SBD","Solomon Islands Dollar","+677"),
  makeTier3("SO","Somalia","索马里","Africa","Sub-Saharan Africa","Mogadishu","Africa/Mogadishu","SOS","Somali Shilling","+252"),
  makeTier3("LK","Sri Lanka","斯里兰卡","Asia","Southern Asia","Colombo","Asia/Colombo","LKR","Sri Lankan Rupee","+94"),
  makeTier3("SD","Sudan","苏丹","Africa","Northern Africa","Khartoum","Africa/Khartoum","SDG","Sudanese Pound","+249"),
  makeTier3("SR","Suriname","苏里南","Americas","South America","Paramaribo","America/Paramaribo","SRD","Surinamese Dollar","+597"),
  makeTier3("SY","Syria","叙利亚","Asia","Western Asia","Damascus","Asia/Damascus","SYP","Syrian Pound","+963"),
  makeTier3("TJ","Tajikistan","塔吉克斯坦","Asia","Central Asia","Dushanbe","Asia/Dushanbe","TJS","Tajikistani Somoni","+992"),
  makeTier3("TZ","Tanzania","坦桑尼亚","Africa","Sub-Saharan Africa","Dodoma","Africa/Dar_es_Salaam","TZS","Tanzanian Shilling","+255"),
  makeTier3("TL","Timor-Leste","东帝汶","Asia","Southeast Asia","Dili","Asia/Dili","USD","US Dollar","+670"),
  makeTier3("TG","Togo","多哥","Africa","Sub-Saharan Africa","Lome","Africa/Lome","XOF","West African CFA Franc","+228"),
  makeTier3("TO","Tonga","汤加","Oceania","Polynesia","Nuku'alofa","Pacific/Tongatapu","TOP","Tongan Pa'anga","+676"),
  makeTier3("TT","Trinidad and Tobago","特立尼达和多巴哥","Americas","Caribbean","Port of Spain","America/Port_of_Spain","TTD","Trinidad Dollar","+1"),
  makeTier3("TN","Tunisia","突尼斯","Africa","Northern Africa","Tunis","Africa/Tunis","TND","Tunisian Dinar","+216"),
  makeTier3("TM","Turkmenistan","土库曼斯坦","Asia","Central Asia","Ashgabat","Asia/Ashgabat","TMT","Turkmenistani Manat","+993"),
  makeTier3("TV","Tuvalu","图瓦卢","Oceania","Polynesia","Funafuti","Pacific/Funafuti","AUD","Australian Dollar","+688"),
  makeTier3("UG","Uganda","乌干达","Africa","Sub-Saharan Africa","Kampala","Africa/Kampala","UGX","Ugandan Shilling","+256"),
  makeTier3("UA","Ukraine","乌克兰","Europe","Eastern Europe","Kyiv","Europe/Kyiv","UAH","Ukrainian Hryvnia","+380"),
  makeTier3("UY","Uruguay","乌拉圭","Americas","South America","Montevideo","America/Montevideo","UYU","Uruguayan Peso","+598"),
  makeTier3("UZ","Uzbekistan","乌兹别克斯坦","Asia","Central Asia","Tashkent","Asia/Tashkent","UZS","Uzbekistani Som","+998"),
  makeTier3("VU","Vanuatu","瓦努阿图","Oceania","Melanesia","Port Vila","Pacific/Efate","VUV","Vanuatu Vatu","+678"),
  makeTier3("VA","Vatican City","梵蒂冈","Europe","Southern Europe","Vatican City","Europe/Vatican","EUR","Euro","+379"),
  makeTier3("VE","Venezuela","委内瑞拉","Americas","South America","Caracas","America/Caracas","VES","Venezuelan Bolivar","+58"),
  makeTier3("YE","Yemen","也门","Asia","Western Asia","Sanaa","Asia/Aden","YER","Yemeni Rial","+967"),
  makeTier3("ZM","Zambia","赞比亚","Africa","Sub-Saharan Africa","Lusaka","Africa/Lusaka","ZMW","Zambian Kwacha","+260"),
  makeTier3("ZW","Zimbabwe","津巴布韦","Africa","Sub-Saharan Africa","Harare","Africa/Harare","ZWL","Zimbabwean Dollar","+263"),
];

/* ------------------------------------------------------------------ */
/* Merge: Tier 1 (from country-config.ts) + Tier 2 + Tier 3           */
/* ------------------------------------------------------------------ */

// Convert Tier 1 configs to AllCountryConfig
const tier1Configs: AllCountryConfig[] = Object.values(COUNTRY_CONFIGS).map((c) => ({
  ...c,
  region: getRegionForTier1(c.countryCode),
  subregion: '',
  completenessTier: 1 as const,
  isPublished: true,
  indexable: true,
}));

function getRegionForTier1(cc: string): string {
  const map: Record<string, string> = {
    CA: 'Americas', US: 'Americas', GB: 'Europe', AU: 'Oceania',
    JP: 'Asia', SG: 'Asia', MY: 'Asia',
  };
  return map[cc] || 'Other';
}

export const ALL_COUNTRIES: AllCountryConfig[] = [
  ...tier1Configs,
  ...tier2Data,
  ...tier3Data,
];

export const ALL_COUNTRIES_BY_SLUG: Record<string, AllCountryConfig> = Object.fromEntries(
  ALL_COUNTRIES.map((c) => [c.slug, c]),
);

export function getAllCountries(): AllCountryConfig[] {
  return ALL_COUNTRIES;
}

export function getCountryBySlug(slug: string): AllCountryConfig | undefined {
  return ALL_COUNTRIES_BY_SLUG[slug];
}

export function getCountriesByTier(tier: CompletenessTier): AllCountryConfig[] {
  return ALL_COUNTRIES.filter((c) => c.completenessTier === tier);
}

export function getCountriesByRegion(region: string): AllCountryConfig[] {
  return ALL_COUNTRIES.filter((c) => c.region === region);
}

export const REGIONS = ['Asia', 'Europe', 'Americas', 'Oceania', 'Africa', 'Middle East'] as const;
