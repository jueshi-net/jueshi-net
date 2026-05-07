'use client';

import { useState } from 'react';
import { MapPin, CheckCircle, AlertCircle, ExternalLink, Info, Copy, Check } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';

interface CountryData {
  name: string;
  flag: string;
  format: string;
  regex: RegExp;
  hint: string;
  examples: { city: string; province: string; code: string; address: string }[];
  stateAbbrevs: { code: string; name: string }[];
  commonErrors: string[];
  officialUrl: string;
  officialName: string;
}

const countryData: Record<string, CountryData> = {
  'CA': {
    name: '加拿大', flag: '🇨🇦',
    format: 'ANA NAN（如 M5V 2T6）',
    regex: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
    hint: '6位，字母和数字交替排列，第3位后空格可选',
    examples: [
      { city: 'Toronto', province: 'ON', code: 'M5V 2T6', address: '123 King Street W' },
      { city: 'Vancouver', province: 'BC', code: 'V6B 1A1', address: '789 Granville Street' },
      { city: 'Montreal', province: 'QC', code: 'H3B 2Y7', address: '456 Rue Sainte-Catherine' },
    ],
    stateAbbrevs: [
      { code: 'AB', name: 'Alberta 阿尔伯塔' }, { code: 'BC', name: 'British Columbia 不列颠哥伦比亚' },
      { code: 'MB', name: 'Manitoba 马尼托巴' }, { code: 'NB', name: 'New Brunswick 新不伦瑞克' },
      { code: 'NL', name: 'Newfoundland 纽芬兰' }, { code: 'NS', name: 'Nova Scotia 新斯科舍' },
      { code: 'NT', name: 'Northwest Territories 西北地区' }, { code: 'NU', name: 'Nunavut 努纳武特' },
      { code: 'ON', name: 'Ontario 安大略' }, { code: 'PE', name: 'Prince Edward Island 爱德华王子岛' },
      { code: 'QC', name: 'Quebec 魁北克' }, { code: 'SK', name: 'Saskatchewan 萨斯喀彻温' },
      { code: 'YT', name: 'Yukon 育空' },
    ],
    commonErrors: ['不要把字母O和数字0混淆', '第一位不能是 D/F/I/O/Q/U', '格式应为 ANA NAN，不要连写', '省份缩写用2位大写字母'],
    officialUrl: 'https://www.canadapost-postescanada.ca/', officialName: 'Canada Post',
  },
  'US': {
    name: '美国', flag: '🇺🇸',
    format: 'XXXXX 或 XXXXX-XXXX（如 10001 或 10001-1234）',
    regex: /^\d{5}(-\d{4})?$/,
    hint: '5位ZIP码或9位ZIP+4码，纯数字',
    examples: [
      { city: 'New York', province: 'NY', code: '10001', address: '350 Fifth Avenue' },
      { city: 'Los Angeles', province: 'CA', code: '90012', address: '200 N Spring Street' },
      { city: 'Chicago', province: 'IL', code: '60601', address: '121 N LaSalle Street' },
    ],
    stateAbbrevs: [
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
    ],
    commonErrors: ['美国邮编只有数字，不要加字母', 'ZIP+4格式中间是连字符不是空格', '州缩写用2位大写字母', '地址中州和邮编之间逗号可省略，但需空格分隔'],
    officialUrl: 'https://www.usps.com/', officialName: 'USPS',
  },
  'GB': {
    name: '英国', flag: '🇬🇧',
    format: 'AA9A 9AA 或 A9A 9AA 等（如 SW1A 1AA）',
    regex: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s\d[A-Za-z]{2}$/,
    hint: '2-4个字母数字组合，中间必须有空格',
    examples: [
      { city: 'London', province: 'England', code: 'SW1A 1AA', address: '10 Downing Street' },
      { city: 'Manchester', province: 'England', code: 'M1 1AE', address: 'Town Hall' },
      { city: 'Edinburgh', province: 'Scotland', code: 'EH1 1YZ', address: 'Royal Mile' },
    ],
    stateAbbrevs: [
      { code: 'ENG', name: 'England 英格兰' }, { code: 'SCT', name: 'Scotland 苏格兰' },
      { code: 'WLS', name: 'Wales 威尔士' }, { code: 'NIR', name: 'Northern Ireland 北爱尔兰' },
    ],
    commonErrors: ['邮编中间必须有空格', '最后一位固定为2个字母', '不能使用的字母：C/I/K/M/O/V 在后半部分', '注意区分邮编和城市名'],
    officialUrl: 'https://www.royalmail.com/', officialName: 'Royal Mail',
  },
  'AU': {
    name: '澳大利亚', flag: '🇦🇺',
    format: 'XXXX（4位数字，如 2000）',
    regex: /^\d{4}$/,
    hint: '4位纯数字，第一位代表州（2=NSW, 3=VIC, 4=QLD, 5=SA, 6=WA, 7=TAS, 0=ACT/NT）',
    examples: [
      { city: 'Sydney', province: 'NSW', code: '2000', address: '1 Martin Place' },
      { city: 'Melbourne', province: 'VIC', code: '3000', address: '1 Treasury Place' },
      { city: 'Brisbane', province: 'QLD', code: '4000', address: '480 Queen Street' },
    ],
    stateAbbrevs: [
      { code: 'NSW', name: 'New South Wales 新南威尔士' }, { code: 'VIC', name: 'Victoria 维多利亚' },
      { code: 'QLD', name: 'Queensland 昆士兰' }, { code: 'SA', name: 'South Australia 南澳大利亚' },
      { code: 'WA', name: 'Western Australia 西澳大利亚' }, { code: 'TAS', name: 'Tasmania 塔斯马尼亚' },
      { code: 'NT', name: 'Northern Territory 北部领地' }, { code: 'ACT', name: 'Australian Capital Territory 首都领地' },
    ],
    commonErrors: ['澳洲邮编只有4位数字', '第一位数字代表州，可以用来校验', '不要加字母或连字符', '州缩写一般为3位大写字母'],
    officialUrl: 'https://auspost.com.au/', officialName: 'Australia Post',
  },
  'NZ': {
    name: '新西兰', flag: '🇳🇿',
    format: 'XXXX（4位数字，如 1010）',
    regex: /^\d{4}$/,
    hint: '4位纯数字',
    examples: [
      { city: 'Auckland', province: 'Auckland', code: '1010', address: '23-29 Albert Street' },
      { city: 'Wellington', province: 'Wellington', code: '6011', address: '113 The Terrace' },
      { city: 'Christchurch', province: 'Canterbury', code: '8011', address: '153 Cambridge Terrace' },
    ],
    stateAbbrevs: [
      { code: 'AUK', name: 'Auckland 奥克兰' }, { code: 'WGN', name: 'Wellington 惠灵顿' },
      { code: 'CAN', name: 'Canterbury 坎特伯雷' }, { code: 'WKO', name: 'Waikato 怀卡托' },
      { code: 'BOP', name: 'Bay of Plenty 丰盛湾' }, { code: 'OTA', name: 'Otago 奥塔哥' },
      { code: 'HKB', name: "Hawke's Bay 霍克斯湾" },
    ],
    commonErrors: ['新西兰邮编只有4位数字', '不要加字母或连字符', '城市和邮编要对应'],
    officialUrl: 'https://www.nzpost.co.nz/', officialName: 'NZ Post',
  },
};

export default function PostalCodePage() {
  const [selectedCountry, setSelectedCountry] = useState('CA');
  const [inputCode, setInputCode] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const country = countryData[selectedCountry];

  const validate = () => {
    if (!inputCode.trim()) { setValidationResult(null); return; }
    const valid = country.regex.test(inputCode.trim());
    setValidationResult({
      valid,
      message: valid ? '✅ 邮编格式正确' : `❌ 格式不正确，应为 ${country.format}`,
    });
  };

  const copyExample = (addr: string) => {
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">邮编格式校验与地址参考</h1>
          <p className="text-lg text-blue-100">邮编格式校验 + 地址示例 + 省州缩写 + 官方查询入口</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>邮编和地址信息仅供整理参考，最终以当地邮政或服务商要求为准。</strong>
            本工具不提供完整邮编数据库查询，仅支持格式校验和地址格式参考。
            精确邮编查询请访问各国邮政官网。
          </p>
        </div>

        {/* Country Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">选择国家</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(countryData).map(([code, c]) => (
              <button key={code} onClick={() => { setSelectedCountry(code); setValidationResult(null); setInputCode(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCountry === code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}>
                {c.flag} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Validation + Format */}
          <div className="space-y-5">
            {/* Format Validation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                邮编格式校验
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {country.flag} {country.name} 邮编格式：<code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm">{country.format}</code>
              </p>
              <div className="flex gap-2">
                <input className="flex-1 px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  placeholder={country.format} value={inputCode} onChange={e => setInputCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && validate()} />
                <button onClick={validate}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                  校验
                </button>
              </div>
              {validationResult && (
                <p className={`mt-2 text-sm font-medium ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">{country.hint}</p>
            </div>

            {/* State Abbreviations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">省州缩写速查</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {country.stateAbbrevs.map(s => (
                  <div key={s.code} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{s.code}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Errors */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> 常见错误提醒
              </h2>
              <ul className="space-y-1">
                {country.commonErrors.map((e, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-1">
                    <span className="shrink-0">•</span> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Examples + Official Link */}
          <div className="space-y-5">
            {/* Address Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                地址示例
              </h2>
              <div className="space-y-3">
                {country.examples.map((ex, i) => {
                  const fullAddr = `${ex.address}\n${ex.city} ${ex.province} ${ex.code}\n${country.name.toUpperCase()}`;
                  return (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{ex.city}, {ex.province}</span>
                        <button onClick={() => copyExample(fullAddr)}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                          {copied ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                        </button>
                      </div>
                      <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans">{fullAddr}</pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Lookup */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-green-600" />
                官方查询入口
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                如需精确查询具体地址的邮编，请访问{country.name}邮政官网：
              </p>
              <a href={country.officialUrl} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                <ExternalLink className="w-4 h-4" /> 前往 {country.officialName}
              </a>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" /> 关于邮编数据
              </h3>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>• 当前版本仅支持格式校验和地址示例，不提供完整邮编查询</li>
                <li>• 后续将导入 GeoNames、UK ONSPD、Australia Post 等数据源</li>
                <li>• 数据模型预留：后续导入数据时建议补充字段 source（数据源名称）、sourceUrl（数据来源链接）、sourceVersion（数据版本号）、license（使用许可证）、effectiveDate（生效日期）、updatedAt（最后更新时间）</li>
                <li>• 公开数据源覆盖范围和更新频率不同，完整投递地址验证应以当地邮政或授权地址服务为准</li>
                <li>• 如需精确邮编查询，请访问上方官方入口</li>
                <li>• 填写快递面单时，邮编格式必须严格符合各国邮政要求</li>
              </ul>
            </div>
          </div>
        </div>

        <RelatedGuidesSection slugs={["canada-postal-code-format"]} />
      </div>
    </div>
  );
}
