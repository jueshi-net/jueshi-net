'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapPin, CheckCircle, AlertCircle, ExternalLink, Info, Copy, Check, Search, Database, Loader2, ChevronRight, Home, Truck, Shield, Calculator } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import { trackEvent } from '@/lib/analytics';
import { SUPPORTED_COUNTRIES, allCountryData, type CountryPostalData } from '@/lib/data/postal-codes';
import Link from 'next/link';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";

function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s\-]+/g, '');
}

function looksLikePostalCode(q: string): boolean {
  const normalized = normalizePostal(q);
  return /^[A-Z0-9]{2,10}$/.test(normalized);
}

const STORAGE_KEY = 'postal-code-tool-state';

interface ValidationDetail {
  valid: boolean;
  message: string;
  matchedRegion?: string;
  matchedCity?: string;
  deliverability: 'confirmed' | 'likely' | 'unknown' | 'invalid';
}

interface DbResult {
  id: string;
  country: string;
  countryCode: string;
  province: string | null;
  city: string;
  district: string | null;
  postalCode: string;
  normalizedPostalCode: string | null;
  areaName: string | null;
  adminName1: string | null;
  adminCode1: string | null;
  adminName2: string | null;
  adminCode2: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  source: string;
  sourceVersion: string | null;
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
  const [countrySearch, setCountrySearch] = useState('');

  // DB search state
  const [dbQuery, setDbQuery] = useState('');
  const [dbResults, setDbResults] = useState<DbResult[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbTotal, setDbTotal] = useState(0);
  const [dbPage, setDbPage] = useState(1);
  const [dbTab, setDbTab] = useState<'all' | 'code' | 'city'>('all');

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
          const exactMatch = country.ranges.find(r =>
            r.prefix.split(',').map(p => p.trim()).includes(outward)
          );
          if (exactMatch) { matchedCity = exactMatch.city; matchedRegion = exactMatch.region; }
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

      // Also query DB for this postal code (single optimized request, no prefix fallback)
      if (formatOk) {
        queryDb(trimmed, selectedCountryCode);
      }
    }

    if (formatOk) {
      let msg = '✅ 邮编格式正确';
      let deliverability: 'confirmed' | 'likely' | 'unknown' = 'unknown';
      if (matchedCity) {
        msg += ` — 可能属于：${matchedCity}, ${matchedRegion}`;
        deliverability = 'confirmed';
      } else if (matchedRegion) {
        msg += ` — 区域：${matchedRegion}`;
        deliverability = 'likely';
      }
      setValidationResult({ valid: true, message: msg, matchedRegion, matchedCity, deliverability });
    } else {
      setValidationResult({
        valid: false,
        message: `❌ 格式不正确，应为 ${country.format}`,
        deliverability: 'invalid',
      });
    }
  }, [inputCode, country, selectedCountryCode]);

  // Cleanup abort controller and debounce timer on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // DB search with AbortController and 300ms debounce
  // Uses AbortController to cancel in-flight requests when user types again
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryDb = useCallback((q: string, cc: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!q.trim()) {
      setDbResults([]);
      setDbTotal(0);
      setDbLoading(false);
      return;
    }

    // Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Debounce 300ms before firing new request
    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setDbLoading(true);
      try {
        const params = new URLSearchParams({ q, country: cc });
        const res = await fetch(`/api/postal-codes?${params}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        const results = json.results || json.data || [];
        setDbResults(results);
        setDbTotal(json.total || results.length);
        setDbPage(1);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('DB query failed:', e);
        }
      } finally {
        setDbLoading(false);
      }
    }, 300);
  }, []);

  const loadDbPage = useCallback(async (page: number) => {
    setDbLoading(true);
    try {
      const params = new URLSearchParams({ q: dbQuery, country: selectedCountryCode });
      const res = await fetch(`/api/postal-codes?${params}`);
      const json = await res.json();
      const results = json.results || json.data || [];
      setDbResults(results);
      setDbPage(page);
    } catch (e) {
      console.error('DB query failed:', e);
    } finally {
      setDbLoading(false);
    }
  }, [dbQuery, selectedCountryCode]);

  const handleDbSearch = useCallback(() => {
    // Cancel debounce and fire immediately on explicit search
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    queryDb(dbQuery, selectedCountryCode);
    trackEvent.postalQuery();
  }, [dbQuery, selectedCountryCode, queryDb]);

  // Filtered ranges based on city search (legacy)
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
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-teal-100 mb-6 min-h-[44px]">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tools" className="hover:text-white transition-colors">工具</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">邮编查询</span>
          </nav>

          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                <Database className="w-3.5 h-3.5" /> 全球邮编库
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                {SUPPORTED_COUNTRIES.length}+ 国家
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                地址核对
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium border border-white/10">
                集运工具
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              {country.flag} {country.name}邮编查询
            </h1>
            <p className="text-lg text-teal-100/90 max-w-2xl leading-relaxed">
              输入邮编，快速识别城市、省份/州、国家信息。适合集运、清关、地址核对使用。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* ===== DISCLAIMER ===== */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>免责声明：</strong>本站提供的邮编信息仅供参考，不构成完整投递地址验证。实际投递以当地邮政官方为准。
          </div>
        </div>

        {/* ===== COUNTRY SELECTOR ===== */}
        <div className={cardStyles.base}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">选择国家 / 地区</h2>
          <div className="flex flex-wrap gap-2">
            {/* Searchable select */}
            <div className="relative w-full sm:w-72">
              <input
                list="country-list"
                placeholder="搜索国家（如 Japan、德国、JP）…"
                value={countrySearch}
                onChange={e => {
                  setCountrySearch(e.target.value);
                  // Auto-select if exact match
                  const match = SUPPORTED_COUNTRIES.find(c =>
                    c.code.toLowerCase() === e.target.value.toLowerCase() ||
                    c.name.includes(e.target.value) ||
                    c.nameEn.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  if (match) selectCountry(match.code);
                }}
                className={`${inputStyles} pr-10`}
              />
              <datalist id="country-list">
                {SUPPORTED_COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.nameEn})</option>
                ))}
              </datalist>
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Quick-pick: popular countries by region */}
            <div className="flex flex-wrap gap-1.5">
              {/* North America */}
              {['CA', 'US'].map(code => {
                const c = SUPPORTED_COUNTRIES.find(x => x.code === code)!;
                return (
                  <button key={code} onClick={() => { selectCountry(code); setCountrySearch(''); }}
                    className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedCountryCode === code
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                    }`}>
                    {c.flag} {c.name}
                  </button>
                );
              })}
              {/* Europe */}
              {['GB', 'DE', 'FR', 'IT', 'ES', 'NL'].map(code => {
                const c = SUPPORTED_COUNTRIES.find(x => x.code === code)!;
                return (
                  <button key={code} onClick={() => { selectCountry(code); setCountrySearch(''); }}
                    className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedCountryCode === code
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                    }`}>
                    {c.flag} {c.name}
                  </button>
                );
              })}
              {/* Asia Pacific */}
              {['JP', 'KR', 'AU', 'NZ', 'SG', 'MY'].map(code => {
                const c = SUPPORTED_COUNTRIES.find(x => x.code === code)!;
                return (
                  <button key={code} onClick={() => { selectCountry(code); setCountrySearch(''); }}
                    className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedCountryCode === code
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                    }`}>
                    {c.flag} {c.name}
                  </button>
                );
              })}
            </div>

            {/* Current selection badge */}
            <div className="w-full mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">当前：</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                {country.flag} {country.name} ({country.code})
              </span>
              <span className="text-xs text-gray-400 ml-auto">{SUPPORTED_COUNTRIES.length} 个国家可选</span>
            </div>
          </div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column (2/3): Validation + DB Search + Ranges */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Validation */}
            <div className={cardStyles.base}>
              <div className="p-5 border-b border-gray-100">
                <h2 className={cardStyles.header}>
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  邮编格式校验
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {country.flag} {country.name} — 格式：<code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-teal-700">{country.format}</code>
                </p>
              </div>
              <div className="p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className={`${inputStyles} font-mono`}
                    placeholder={country.format}
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && validate()}
                  />
                  <button onClick={() => { validate(); trackEvent.postalQuery(); }}
                    className={`${buttonVariants.primary} shadow-sm`}>
                    <CheckCircle className="w-4 h-4" />
                    校验
                  </button>
                </div>

                {/* Validation result */}
                {validationResult && (
                  <div className={`mt-4 p-4 rounded-lg text-sm border ${
                    validationResult.deliverability === 'confirmed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : validationResult.deliverability === 'likely'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : validationResult.deliverability === 'invalid'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {validationResult.deliverability === 'confirmed' && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      {validationResult.deliverability === 'likely' && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
                      {validationResult.deliverability === 'invalid' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <div>
                        <div className="font-semibold">{validationResult.message}</div>
                        {validationResult.deliverability === 'confirmed' && (
                          <div className="text-xs mt-1 opacity-80">🟢 可投递性：已确认 — 该邮编在数据库中匹配到具体城市</div>
                        )}
                        {validationResult.deliverability === 'likely' && (
                          <div className="text-xs mt-1 opacity-80">🔵 可投递性：可能 — 匹配到地区，但未找到具体城市</div>
                        )}
                        {validationResult.deliverability === 'unknown' && (
                          <div className="text-xs mt-1 opacity-80">⚪ 可投递性：未知 — 格式正确但不在数据库中，请以官方查询为准</div>
                        )}
                        {validationResult.deliverability === 'invalid' && (
                          <div className="text-xs mt-1 opacity-80">请检查输入是否符合 {country.name} 邮编格式</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick examples */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs text-gray-400">示例：</span>
                  {selectedCountryCode === 'CA' && (
                    <>
                      <button onClick={() => { setInputCode('V6B0A1'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">V6B 0A1</button>
                      <button onClick={() => { setInputCode('M5V3L9'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">M5V 3L9</button>
                    </>
                  )}
                  {selectedCountryCode === 'US' && (
                    <>
                      <button onClick={() => { setInputCode('90210'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">90210</button>
                      <button onClick={() => { setInputCode('10001'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">10001</button>
                    </>
                  )}
                  {selectedCountryCode === 'JP' && (
                    <>
                      <button onClick={() => { setInputCode('100-0001'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">100-0001</button>
                      <button onClick={() => { setInputCode('530-0001'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">530-0001</button>
                    </>
                  )}
                  {selectedCountryCode === 'DE' && (
                    <>
                      <button onClick={() => { setInputCode('10115'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">10115</button>
                      <button onClick={() => { setInputCode('80331'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">80331</button>
                    </>
                  )}
                  {selectedCountryCode === 'GB' && (
                    <>
                      <button onClick={() => { setInputCode('SW1A 1AA'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">SW1A 1AA</button>
                      <button onClick={() => { setInputCode('M1 1AE'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">M1 1AE</button>
                    </>
                  )}
                  {selectedCountryCode === 'FR' && (
                    <>
                      <button onClick={() => { setInputCode('75001'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">75001</button>
                      <button onClick={() => { setInputCode('69001'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">69001</button>
                    </>
                  )}
                  {selectedCountryCode === 'AU' && (
                    <>
                      <button onClick={() => { setInputCode('2000'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">2000</button>
                      <button onClick={() => { setInputCode('3000'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">3000</button>
                    </>
                  )}
                  {selectedCountryCode === 'SG' && (
                    <>
                      <button onClick={() => { setInputCode('018956'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">018956</button>
                      <button onClick={() => { setInputCode('238884'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">238884</button>
                    </>
                  )}
                  {selectedCountryCode === 'KR' && (
                    <>
                      <button onClick={() => { setInputCode('04524'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">04524</button>
                      <button onClick={() => { setInputCode('06236'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">06236</button>
                    </>
                  )}
                  {!['CA', 'US', 'JP', 'DE', 'GB', 'FR', 'AU', 'SG', 'KR'].includes(selectedCountryCode) && (
                    <span className="text-xs text-gray-300">请在下方输入邮编进行校验</span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">{country.hint}</p>
              </div>
            </div>

            {/* DB-Powered Search */}
            <div className={cardStyles.base}>
              <div className="p-5 border-b border-gray-100">
                <h2 className={cardStyles.header}>
                  <Database className="w-5 h-5 text-blue-600" />
                  数据库邮编查询
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  从数据库查询具体邮编或城市对应的地址信息
                </p>
              </div>
              <div className="p-5">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { key: 'all' as const, label: '全部' },
                    { key: 'code' as const, label: '按邮编' },
                    { key: 'city' as const, label: '按城市' },
                  ].map(tab => (
                    <button key={tab.key} onClick={() => setDbTab(tab.key)}
                      className={`px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all ${
                        dbTab === tab.key
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                      }`}>{tab.label}</button>
                  ))}
                </div>

                {/* Search input */}
                <div className="flex gap-3 mb-4">
                  <input
                    className={`${inputStyles} flex-1`}
                    placeholder={dbTab === 'code' ? '输入邮编（如 M5V 2T6）...' : dbTab === 'city' ? '输入城市名（如 Toronto）...' : '输入邮编或城市名...'}
                    value={dbQuery}
                    onChange={e => setDbQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDbSearch()}
                  />
                  <button onClick={handleDbSearch} disabled={dbLoading}
                    className={buttonVariants.primary}>
                    {dbLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {dbLoading ? '查询中…' : '查询'}
                  </button>
                </div>

                {/* Loading state */}
                {dbLoading && (
                  <div className="flex items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> 正在查询…
                  </div>
                )}

                {/* Results */}
                {!dbLoading && dbResults.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 mb-3">找到 {dbTotal.toLocaleString()} 条记录</p>
                    <div className="grid sm:grid-cols-2 gap-3 max-h-[32rem] overflow-y-auto divide-y divide-gray-100">
                      {dbResults.map((r) => {
                        const normalizedQuery = dbQuery.trim().toUpperCase().replace(/[\s-]+/g, '');
                        const normalizedCode = (r.normalizedPostalCode || r.postalCode.replace(/[\s-]/g, '').toUpperCase());
                        const queryIsPostal = looksLikePostalCode(dbQuery);

                        let matchLabel = '城市匹配';
                        let matchColor = 'bg-amber-100 text-amber-700';

                        if (queryIsPostal) {
                          if (normalizedCode === normalizedQuery) {
                            matchLabel = '精确匹配';
                            matchColor = 'bg-green-100 text-green-700';
                          } else if (normalizedCode.startsWith(normalizedQuery)) {
                            matchLabel = '前缀匹配';
                            matchColor = 'bg-blue-100 text-blue-700';
                          }
                        }

                        const formatOk = country.formatRegex.test(r.postalCode);

                        return (
                          <div key={r.id} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-100">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-xl font-bold text-teal-600 tracking-wide">
                                {r.postalCode}
                              </span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${matchColor}`}>
                                {matchLabel}
                              </span>
                            </div>
                            <div className="text-base font-semibold text-gray-900">
                              {r.city}{r.areaName && r.areaName !== r.city ? ` (${r.areaName})` : ''}
                            </div>
                            {r.adminName1 && (
                              <div className="text-sm text-gray-600">
                                {r.adminName1}{r.adminCode1 ? ` (${r.adminCode1})` : ''}
                                {r.adminName2 ? ` · ${r.adminName2}` : ''}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">🌍 {r.country}</div>
                            {r.latitude != null && r.longitude != null && (
                              <div className="text-xs text-gray-400">
                                📍 {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                                {r.accuracy != null && <span className="ml-2">{'⭐'.repeat(Math.min(r.accuracy, 5))}</span>}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 border-t border-gray-200 pt-2 mt-1">
                              {formatOk ? '✅ 格式有效' : '📋 数据库存在'} · 以当地邮政官方为准
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {dbTotal > 50 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button onClick={() => loadDbPage(dbPage - 1)} disabled={dbPage <= 1}
                          className="px-3 py-2 min-h-[44px] text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors">上一页</button>
                        <span className="text-xs text-gray-500">第 {dbPage} 页</span>
                        <button onClick={() => loadDbPage(dbPage + 1)} disabled={dbPage * 50 >= dbTotal}
                          className="px-3 py-2 min-h-[44px] text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors">下一页</button>
                      </div>
                    )}
                  </>
                )}

                {/* Empty state */}
                {!dbLoading && dbQuery && dbResults.length === 0 && (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-600 mb-1">没有找到完全匹配</p>
                    <p className="text-sm text-gray-400 mb-4">可以尝试输入邮编前缀、城市名或省州名</p>
                    <a href={country.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                      <ExternalLink className="w-4 h-4" /> 前往 {country.officialName} 官方查询
                    </a>
                  </div>
                )}

                {/* Initial empty state */}
                {!dbLoading && !dbQuery && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">输入邮编或城市名，查询具体地址信息</p>
                  </div>
                )}
              </div>
            </div>

            {/* City / Region Search (legacy) */}
            <div className={cardStyles.base}>
              <div className="p-5 border-b border-gray-100">
                <h2 className={cardStyles.header}>
                  <Search className="w-5 h-5 text-indigo-600" />
                  按城市/地区查询邮编范围（参考）
                </h2>
              </div>
              <div className="p-5">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className={`${inputStyles} pl-9`}
                    placeholder="输入城市名或地区缩写（如 Toronto、NSW、100）..."
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                  />
                </div>

                {filteredRanges.length === 0 && citySearch && (
                  <p className="text-sm text-gray-500 text-center py-6">
                    未找到匹配 "{citySearch}" 的记录
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {filteredRanges.map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-medium text-sm text-gray-900">{r.city}</span>
                        <span className="text-xs text-gray-500 ml-1">({r.region})</span>
                      </div>
                      <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded shrink-0">{r.range}</span>
                    </div>
                  ))}
                </div>
                {citySearch && (
                  <p className="text-xs text-gray-400 mt-2">找到 {filteredRanges.length} 条记录</p>
                )}
              </div>
            </div>

            {/* Common Errors */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> 常见错误提醒
              </h2>
              <ul className="space-y-1.5">
                {country.commonErrors.map((e, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-red-400">•</span> {e}
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage scenarios */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4">使用场景</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">集运收货地址核对</h3>
                    <p className="text-xs text-gray-500 mt-1">确认收货地址邮编格式是否正确，避免包裹投递失败</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">运费估算前置检查</h3>
                    <p className="text-xs text-gray-500 mt-1">邮编决定配送区域和运费，先核实再估算更准确</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">清关/派送区域确认</h3>
                    <p className="text-xs text-gray-500 mt-1">确认邮编对应的省份/州，了解是否属于偏远地区</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1/3): States + Official Links + Address Format */}
          <div className="space-y-6">
            {/* State/Region Abbreviations */}
            <div className={cardStyles.base}>
              <div className="p-4 border-b border-gray-100">
                <h2 className={cardStyles.header}>
                  {country.code === 'GB' ? '地区速查' : country.code === 'NZ' ? '地区速查' : '省州缩写速查'}
                </h2>
              </div>
              <div className="p-3 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1 divide-y divide-gray-100">
                  {country.stateAbbrevs.map(s => (
                    <div key={s.code} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-600 text-sm w-10 shrink-0">{s.code}</span>
                      <span className="text-xs text-gray-500">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Lookup Links */}
            <div className={cardStyles.base}>
              <div className="p-4 border-b border-gray-100">
                <h2 className={cardStyles.header}>
                  <ExternalLink className="w-4 h-4 text-green-600" />
                  官方查询入口
                </h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-4">
                  如需精确查询具体地址的邮编，请访问{country.name}邮政官网：
                </p>
                <div className="space-y-3">
                  <a href={country.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                    className={`${buttonVariants.primary} w-full justify-center`}>
                    <ExternalLink className="w-4 h-4" /> 查询邮编 — {country.officialName}
                  </a>
                  <a href={country.officialUrl} target="_blank" rel="noopener noreferrer"
                    className={`${buttonVariants.secondary} w-full justify-center`}>
                    <ExternalLink className="w-4 h-4" /> 前往 {country.officialName} 首页
                  </a>
                </div>

                {/* Quick links to all countries */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-400 mb-2">各国官方邮编查询</p>
                  <div className="space-y-2">
                    {allCountryData.filter(c => c.code !== country.code).map(c => (
                      <a key={c.code} href={c.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                        <span>{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Format Reference */}
            <div className={cardStyles.base}>
              <div className="p-4 border-b border-gray-100">
                <h2 className={cardStyles.header}>
                  <MapPin className="w-4 h-4 text-blue-600" />
                  地址格式参考
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3 divide-y divide-gray-100">
                  {country.ranges.slice(0, 4).map((r, i) => {
                    const addr = getSampleAddress(country.code, r.city, r.region, r.range);
                    return (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500">{r.city}, {r.region}</span>
                          <button onClick={() => copyText(addr, `addr-${i}`)}
                            className="flex items-center gap-1 text-xs text-teal-600 hover:underline">
                            {copiedField === `addr-${i}` ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                          </button>
                        </div>
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans leading-relaxed">{addr}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* About Data */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> 关于邮编数据
              </h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 本工具提供格式校验和城市邮编范围参考</li>
                <li>• 数据库收录全球 50+ 国家邮编数据（GeoNames 全量数据）</li>
                <li>• 邮编覆盖范围仅为主要城市，非完整数据库</li>
                <li>• 精确投递地址验证请以当地邮政官方为准</li>
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
            question: "加拿大邮编是否需要空格？",
            answer: "加拿大邮编标准格式为 A1A 1A1（中间有空格），但大多数系统也接受不带空格的写法 A1A1A1。填写快递面单时建议加空格，格式更规范。",
          },
          {
            question: "查询不到怎么办？",
            answer: "可以尝试输入邮编前缀（如只输入前3位）、城市名或省州缩写。数据库仅覆盖主要城市，偏远地区数据可能不完整。建议同时使用上方官方查询入口进行交叉验证。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-postal-code-bottom" className="mt-8 mb-8" />

        {/* Footer attribution */}
        <div className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 mt-8">
          部分邮编地理数据参考公开数据源整理，实际投递以当地邮政官方为准。
        </div>
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
