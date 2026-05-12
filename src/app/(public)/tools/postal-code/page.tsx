'use client';
import { AdSlot } from '@/components/ad-slot';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, CheckCircle, AlertCircle, ExternalLink, Info, Copy, Check, Search } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { trackEvent } from '@/lib/analytics';
import { allCountryData, type CountryPostalData } from '@/lib/data/postal-codes';

const STORAGE_KEY = 'postal-code-tool-state';

interface ValidationDetail {
  valid: boolean;
  message: string;
  matchedRegion?: string;
  matchedCity?: string;
}

function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [key, state]);

  return [state, setState];
}

export default function PostalCodePage() {
  const [selectedCountryCode, setSelectedCountryCode] = usePersistedState<string>(STORAGE_KEY + '-country', 'CA');
  const [inputCode, setInputCode] = usePersistedState<string>(STORAGE_KEY + '-input', '');
  const [validationResult, setValidationResult] = useState<ValidationDetail | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const country = useMemo(
    () => allCountryData.find(c => c.code === selectedCountryCode) ?? allCountryData[0],
    [selectedCountryCode],
  );

  // Reset search and validation on country change
  const selectCountry = useCallback((code: string) => {
    setSelectedCountryCode(code);
    setCitySearch('');
    setValidationResult(null);
    setInputCode('');
  }, [setSelectedCountryCode, setInputCode]);

  // Validate postal code with region lookup
  const validate = useCallback(() => {
    const trimmed = inputCode.trim();
    if (!trimmed) { setValidationResult(null); return; }

    const formatOk = country.formatRegex.test(trimmed);

    // Try to match against known ranges
    let matchedCity: string | undefined;
    let matchedRegion: string | undefined;

    if (formatOk) {
      const normalized = trimmed.toUpperCase().replace(/\s+/g, ' ');
      // For Canada: check first letter
      if (country.code === 'CA' && /^[A-Z]/.test(normalized)) {
        const firstLetter = normalized[0];
        const regionMap: Record<string, string> = {
          'A': 'NL', 'B': 'NS', 'C': 'PE', 'E': 'NB',
          'G': 'QC', 'H': 'QC', 'J': 'QC',
          'K': 'ON', 'L': 'ON', 'M': 'ON', 'N': 'ON', 'P': 'ON',
          'R': 'MB', 'S': 'SK', 'T': 'AB', 'V': 'BC',
          'X': 'NT/NU', 'Y': 'YT',
        };
        matchedRegion = regionMap[firstLetter] || '';
        // Try to find matching city
        const match = country.ranges.find(r => normalized.startsWith(r.prefix));
        if (match) { matchedCity = match.city; matchedRegion = match.region; }
      }

      // For US: check first 3 digits
      if (country.code === 'US' && /^\d{3}/.test(normalized)) {
        const prefix3 = normalized.slice(0, 3);
        const match = country.ranges.find(r => r.prefix === prefix3);
        if (match) { matchedCity = match.city; matchedRegion = match.region; }
      }

      // For UK: check outward code prefix
      if (country.code === 'GB') {
        const parts = normalized.split(' ');
        if (parts.length >= 1) {
          const outward = parts[0].replace(/\d/g, '');
          // Try exact match first
          const exactMatch = country.ranges.find(r =>
            r.prefix.split(',').map(p => p.trim()).includes(outward)
          );
          if (exactMatch) { matchedCity = exactMatch.city; matchedRegion = exactMatch.region; }
          // Try first 1-2 letters
          else if (outward.length >= 1) {
            const shortMatch = country.ranges.find(r =>
              r.prefix.split(',').map(p => p.trim()).some(p => p.startsWith(outward) || outward.startsWith(p))
            );
            if (shortMatch) { matchedCity = shortMatch.city; matchedRegion = shortMatch.region; }
          }
        }
      }

      // For AU: check first digit
      if (country.code === 'AU' && /^\d/.test(normalized)) {
        const firstDigit = normalized[0];
        const regionMap: Record<string, string> = {
          '0': 'NT/ACT', '2': 'NSW/ACT', '3': 'VIC', '4': 'QLD',
          '5': 'SA', '6': 'WA', '7': 'TAS', '9': 'Australia Post',
        };
        matchedRegion = regionMap[firstDigit] || '';
        const prefix2 = normalized.slice(0, 2);
        const match = country.ranges.find(r => r.prefix === firstDigit || r.prefix.includes(prefix2));
        if (match) { matchedCity = match.city; matchedRegion = match.region; }
      }

      // For NZ: check first 2 digits
      if (country.code === 'NZ' && /^\d{2}/.test(normalized)) {
        const prefix2 = normalized.slice(0, 2);
        const regionMap: Record<string, string> = {
          '01': 'Northland', '06': 'Auckland', '10': 'Auckland', '20': 'Auckland',
          '30': 'Bay of Plenty', '31': 'Bay of Plenty', '32': 'Waikato',
          '40': 'Gisborne', '41': "Hawke's Bay", '43': 'Taranaki', '44': 'Manawatū-Whanganui',
          '50': 'Wellington', '60': 'Wellington',
          '70': 'Nelson', '71': 'Canterbury', '80': 'Canterbury',
          '90': 'Otago', '93': 'Otago', '98': 'Southland',
        };
        matchedRegion = regionMap[prefix2] || '';
        const match = country.ranges.find(r => r.prefix.split('/').includes(prefix2));
        if (match) { matchedCity = match.city; matchedRegion = match.region; }
      }
    }

    if (formatOk) {
      let msg = '✅ 邮编格式正确';
      if (matchedCity) msg += ` — 可能属于：${matchedCity}, ${matchedRegion}`;
      else if (matchedRegion) msg += ` — 区域：${matchedRegion}`;
      setValidationResult({ valid: true, message: msg, matchedRegion, matchedCity });
    } else {
      setValidationResult({
        valid: false,
        message: `❌ 格式不正确，应为 ${country.format}`,
      });
    }
  }, [inputCode, country]);

  // Filtered ranges based on city search
  const filteredRanges = useMemo(() => {
    if (!citySearch.trim()) return country.ranges;
    const q = citySearch.toLowerCase();
    return country.ranges.filter(r =>
      r.city.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q) ||
      r.range.toLowerCase().includes(q) ||
      r.prefix.toLowerCase().includes(q),
    );
  }, [citySearch, country.ranges]);

  const copyText = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">邮编参考查询工具</h1>
          <p className="text-lg text-blue-100">格式校验 + 城市邮编范围查询 + 官方查询入口 — 覆盖加拿大、美国、英国、澳大利亚、新西兰</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>本站提供的邮编信息仅供参考，不构成完整投递地址验证。实际邮编请以各国邮政官网为准。</strong>
          </p>
        </div>

        {/* Country Tab Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">选择国家</h2>
          <div className="flex flex-wrap gap-2">
            {allCountryData.map(c => (
              <button key={c.code} onClick={() => selectCountry(c.code)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCountryCode === c.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}>
                {c.flag} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column (2/3): Validation + Search + Ranges */}
          <div className="lg:col-span-2 space-y-5">
            {/* Format Validation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                邮编格式校验
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {country.flag} {country.name}（{country.nameEn}）邮编格式：<code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm font-mono">{country.format}</code>
              </p>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-base"
                  placeholder={country.format}
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && validate()}
                />
                <button onClick={() => { validate(); trackEvent.postalQuery(); }}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  校验
                </button>
              </div>
              {validationResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                  validationResult.valid
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                  {validationResult.message}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{country.hint}</p>
            </div>

            {/* City / Region Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                按城市/地区查询邮编范围
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="输入城市名或地区缩写（如 Toronto、NSW、100）..."
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                />
              </div>

              {filteredRanges.length === 0 && citySearch && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  未找到匹配 "{citySearch}" 的记录
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {filteredRanges.map((r, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{r.city}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({r.region})</span>
                    </div>
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{r.range}</span>
                  </div>
                ))}
              </div>
              {citySearch && (
                <p className="text-xs text-gray-400 mt-2">找到 {filteredRanges.length} 条记录</p>
              )}
            </div>

            {/* Common Errors */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> 常见错误提醒
              </h2>
              <ul className="space-y-1">
                {country.commonErrors.map((e, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-1">
                    <span className="shrink-0 mt-0.5">•</span> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (1/3): States + Official Links */}
          <div className="space-y-5">
            {/* State/Region Abbreviations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {country.code === 'GB' ? '地区速查' : country.code === 'NZ' ? '地区速查' : '省州缩写速查'}
              </h2>
              <div className="grid grid-cols-1 gap-1.5 max-h-96 overflow-y-auto">
                {country.stateAbbrevs.map(s => (
                  <div key={s.code} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm w-10 shrink-0">{s.code}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Lookup Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-green-600" />
                官方查询入口
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                如需精确查询具体地址的邮编，请访问{country.name}邮政官网：
              </p>

              <div className="space-y-3">
                <a href={country.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  <ExternalLink className="w-4 h-4" /> 查询邮编 — {country.officialName}
                </a>
                <a href={country.officialUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <ExternalLink className="w-4 h-4" /> 前往 {country.officialName} 首页
                </a>
              </div>

              {/* Quick links to all countries */}
              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">各国官方邮编查询</p>
                <div className="space-y-1.5">
                  {allCountryData.filter(c => c.code !== country.code).map(c => (
                    <a key={c.code} href={c.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <span>{c.flag}</span>
                      <span>{c.name} — {c.officialName}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Address Format Reference */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                地址格式参考
              </h2>
              <div className="space-y-3">
                {country.ranges.slice(0, 4).map((r, i) => {
                  const addr = getSampleAddress(country.code, r.city, r.region, r.range);
                  return (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{r.city}, {r.region}</span>
                        <button onClick={() => copyText(addr, `addr-${i}`)}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                          {copiedField === `addr-${i}` ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                        </button>
                      </div>
                      <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans leading-relaxed">{addr}</pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About Data */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" /> 关于邮编数据
              </h3>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>• 本工具提供格式校验和城市邮编范围参考</li>
                <li>• 邮编覆盖范围仅为主要城市，非完整数据库</li>
                <li>• 精确投递地址验证请以当地邮政官方为准</li>
                <li>• 填写快递面单时，邮编格式必须严格符合各国邮政要求</li>
              </ul>
            </div>
          </div>
        </div>

        <RelatedGuidesSection slugs={["canada-postal-code-format"]} />

        {/* FAQ */}
        <FAQSection title="邮编查询常见问题" items={[
          {
            question: "邮编校验通过就一定能收到包裹吗？",
            answer: "不一定。本站只做格式校验和参考数据匹配，不验证地址是否真实存在。邮编正确只是投递成功的一个条件，还需要街道地址、门牌号、收件人姓名电话等信息完整准确。偏远地区即使邮编正确也可能需要额外派送时间或费用。",
          },
          {
            question: "各国邮编格式是什么样的？",
            answer: "加拿大：A1A 1A1（字母+数字+字母+空格+数字+字母+数字）；美国：12345 或 12345-6789（ZIP+4）；英国：SW1A 1AA（格式较灵活）；澳大利亚：1234（4位数字）；新西兰：1234（4位数字）。",
          },
          {
            question: "美国 ZIP+4 是什么？必须填吗？",
            answer: "ZIP+4 是在 5 位 ZIP Code 基础上增加的 4 位扩展码，用于更精确地定位到街道段或建筑群。普通邮寄写 5 位即可，但使用 ZIP+4 可以提高分拣效率和投递准确性。",
          },
          {
            question: "加拿大邮编的字母 O 和数字 0 怎么区分？",
            answer: "加拿大邮编不使用字母 O、D、F、I、Q、U（避免与数字混淆）。所以如果你看到类似字母 O，它实际上是数字 0。邮编的第一位字母表示省份，如 V 开头是 BC 省，M 开头是安大略省多伦多。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-postal-code-bottom" className="mt-8 mb-8" />
      </div>
    </div>
  );
}

function getSampleAddress(countryCode: string, city: string, region: string, range: string): string {
  const samplePostcode = range.split(/[–,\s]+/)[0];

  switch (countryCode) {
    case 'CA':
      return `${samplePostcode}\n${city} ${region}\nCanada`;
    case 'US':
      return `${samplePostcode}\n${city}, ${region}\nUnited States`;
    case 'GB':
      return `${samplePostcode}\n${city}\nUnited Kingdom`;
    case 'AU':
      return `${samplePostcode}\n${city} ${region}\nAustralia`;
    case 'NZ':
      return `${samplePostcode}\n${city}\nNew Zealand`;
    default:
      return `${samplePostcode}\n${city}, ${region}`;
  }
}
