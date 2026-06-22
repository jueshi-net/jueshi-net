'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, CheckCircle, AlertCircle, ExternalLink, Info, Copy, Check, Search, Database, Loader2, ChevronRight, Home, Truck, Shield, Calculator, Globe, FileText, Sparkles, Link2 } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { AdSlot } from '@/components/ads/AdSlot';
import { CountryInfoSection } from '@/components/country-info-section';
import { Breadcrumb } from '@/components/breadcrumb';
import { FAQSection } from '@/components/faq-section';
import SmartRelatedLinks from '@/components/smart-related-links';
import { RelatedChecklistSection } from '@/components/related-checklist-section';
import { TaskChainNextStep, TASK_CHAIN_STEPS } from '@/components/tools/task-chain-next-step';
import { TaskChainSelectDialog } from '@/components/tools/task-chain-select-dialog';
import { trackEvent } from '@/lib/analytics';
import { saveTaskChain } from '@/lib/task-chain';
import { importToolDataToTaskChain, createTaskChain, type TaskChain } from '@/lib/task-chain-api';
import { SUPPORTED_COUNTRIES, allCountryData, type CountryPostalData } from '@/lib/data/postal-codes';
import { getCoverageStatus, getCoverageIcon, getCoverageLabel, type CoverageStatus } from '@/lib/postal-code-coverage-status';
import { getOfficialLink, getPhoneCode, getTimezone, getPostalFormat, getExamplePostal } from '@/lib/postal-code-official-links';
import { ADDRESS_FORMATS, type AddressFormat } from '@/lib/postal-code-advanced-data';
import Link from 'next/link';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";

// Timezone mapping for supported countries
const COUNTRY_TIMEZONE: Record<string, string> = {
  CA: 'America/Toronto',
  US: 'America/New_York',
  GB: 'Europe/London',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',
  SG: 'Asia/Singapore',
  JP: 'Asia/Tokyo',
  MY: 'Asia/Kuala_Lumpur',
};

// Chinese embassy URLs for supported countries
const CHINESE_EMBASSY: Record<string, { name: string; url: string }> = {
  CA: { name: '中国驻加拿大使馆', url: 'https://ca.china-embassy.gov.cn/' },
  US: { name: '中国驻美国大使馆', url: 'https://us.china-embassy.gov.cn/' },
  GB: { name: '中国驻英国大使馆', url: 'https://uk.china-embassy.gov.cn/' },
  AU: { name: '中国驻澳大利亚大使馆', url: 'https://au.china-embassy.gov.cn/' },
  NZ: { name: '中国驻新西兰大使馆', url: 'https://nz.china-embassy.gov.cn/' },
  SG: { name: '中国驻新加坡大使馆', url: 'https://sg.china-embassy.gov.cn/' },
  JP: { name: '中国驻日本大使馆', url: 'https://jp.china-embassy.gov.cn/' },
  MY: { name: '中国驻马来西亚大使馆', url: 'https://my.china-embassy.gov.cn/' },
};

function useLocalTime(timezone: string | undefined) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (!timezone) { setTime(''); return; }
    const update = () => {
      try {
        setTime(new Date().toLocaleString('zh-CN', {
          timeZone: timezone,
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }));
      } catch { setTime('—'); }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return time;
}

function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s\-]+/g, '');
}

function looksLikePostalCode(q: string): boolean {
  const normalized = normalizePostal(q);
  return /^[A-Z0-9]{2,10}$/.test(normalized);
}

const STORAGE_KEY = 'postal-code-tool-state';
const RECENT_QUERIES_KEY = 'postal-code-recent-queries';

interface RecentQuery {
  query: string;
  resultSummary: string;
  timestamp: number;
  country: string;
}

function useRecentQueries(key: string, maxItems = 5): [RecentQuery[], (q: RecentQuery) => void] {
  const [queries, setQueries] = useState<RecentQuery[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const add = useCallback((q: RecentQuery) => {
    setQueries(prev => {
      const next = [q, ...prev.filter(x => x.query !== q.query)].slice(0, maxItems);
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key, maxItems]);
  return [queries, add];
}

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
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [selectedCountryCode, setSelectedCountryCode] = usePersistedState<string>(STORAGE_KEY + '-country', 'CA');
  const [inputCode, setInputCode] = usePersistedState<string>(STORAGE_KEY + '-input', '');
  const [validationResult, setValidationResult] = useState<ValidationDetail | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [recentQueries, addRecentQuery] = useRecentQueries(RECENT_QUERIES_KEY);
  const [queryMode, setQueryMode] = useState<'postal' | 'region' | 'format'>('region');
  const [mainSearch, setMainSearch] = useState('');
  const [taskChainCreating, setTaskChainCreating] = useState(false);
  const [showTaskChainDialog, setShowTaskChainDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Record<string, string> | null>(null);

  // Track Tool_View on mount
  useEffect(() => {
    trackEvent.custom('postal-code', 'view');
  }, []);

  // Local time for selected country
  const timezone = COUNTRY_TIMEZONE[selectedCountryCode];
  const localTime = useLocalTime(timezone);
  const embassy = CHINESE_EMBASSY[selectedCountryCode];

  // Auto-trigger from URL param (e.g. ?q=90210 from homepage search)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setInputCode(q);
      // Wait for state update then validate
      setTimeout(() => {
        const trimmed = q.trim();
        if (!trimmed) return;
        const formatOk = country.formatRegex.test(trimmed);
        // Auto-trigger validation inline (don't wait for user to click)
        if (formatOk) {
          queryDb(trimmed, selectedCountryCode);
        }
        // Build validation result
        const normalized = trimmed.toUpperCase().replace(/\s+/g, ' ');
        let matchedCity: string | undefined;
        let matchedRegion: string | undefined;
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
          const match = country.ranges.find(r => normalized.startsWith(r.prefix));
          if (match) { matchedCity = match.city; matchedRegion = match.region; }
        }
        if (country.code === 'US' && /^\d{3}/.test(normalized)) {
          const prefix3 = normalized.slice(0, 3);
          const match = country.ranges.find(r => r.prefix === prefix3);
          if (match) { matchedCity = match.city; matchedRegion = match.region; }
        }
        let msg = '✅ 邮编格式正确';
        let deliverability: 'confirmed' | 'likely' | 'unknown' = 'unknown';
        if (matchedCity) {
          msg += ` — 可能属于：${matchedCity}, ${matchedRegion}`;
          deliverability = 'confirmed';
        } else if (matchedRegion) {
          msg += ` — 区域：${matchedRegion}`;
          deliverability = 'likely';
        }
        setValidationResult({ valid: formatOk, message: formatOk ? msg : `❌ 格式不正确，应为 ${country.format}`, matchedRegion, matchedCity, deliverability });
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // DB search state
  const [dbQuery, setDbQuery] = useState('');
  const [dbResults, setDbResults] = useState<DbResult[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbTotal, setDbTotal] = useState(0);
  const [dbPage, setDbPage] = useState(1);
  const [dbTab, setDbTab] = useState<'all' | 'code' | 'city'>('all');

  // Advanced search state
  const [advancedCityQuery, setAdvancedCityQuery] = useState('');
  const [advancedCityResults, setAdvancedCityResults] = useState<any[]>([]);
  const [advancedCityLoading, setAdvancedCityLoading] = useState(false);
  const [advancedCityRecommendations, setAdvancedCityRecommendations] = useState<any>(null);

  const [advancedRegionQuery, setAdvancedRegionQuery] = useState('');
  const [advancedRegionResults, setAdvancedRegionResults] = useState<any[]>([]);
  const [advancedRegionLoading, setAdvancedRegionLoading] = useState(false);
  const [advancedRegionRecommendations, setAdvancedRegionRecommendations] = useState<any>(null);

  const [advancedFormatResult, setAdvancedFormatResult] = useState<any>(null);
  const [advancedFormatBasicInfo, setAdvancedFormatBasicInfo] = useState<any>(null);
  const [advancedFormatLoading, setAdvancedFormatLoading] = useState(false);
  const [formatCountryInput, setFormatCountryInput] = useState('');

  const advancedCityAbortRef = useRef<AbortController | null>(null);
  const advancedRegionAbortRef = useRef<AbortController | null>(null);

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
      // Save to recent queries
      addRecentQuery({
        query: trimmed,
        resultSummary: msg,
        timestamp: Date.now(),
        country: selectedCountryCode,
      });
      // Save to task chain
      saveTaskChain({
        sourceTool: 'postal-code',
        postalCode: trimmed,
        destinationCountry: country.name,
      });
      trackEvent.custom('postal-code', 'task_chain_save_context');
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

    // Always set loading when starting a new query (fixes stale loading on rapid type→clear)
    setDbLoading(true);

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
      trackEvent.custom('postal-code', 'copy_result');
    });
  }, []);


  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch { /* ignore */ }
  };

  const joinShippingTaskChain = async (result?: DbResult) => {
    if (sessionStatus === 'loading') return;
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setTaskChainCreating(true);
    try {
      const context: Record<string, string> = {
        destinationCountry: country.name,
      };
      if (result) {
        context.postalCode = result.postalCode;
        context.addressText = `${result.city}${result.areaName && result.areaName !== result.city ? ` (${result.areaName})` : ''}, ${result.province || result.adminName1 || ''}`.trim();
      } else if (dbResults.length > 0) {
        const first = dbResults[0];
        context.postalCode = first.postalCode;
        context.addressText = `${first.city}, ${first.province || first.adminName1 || ''}`.trim();
      } else if (inputCode) {
        context.postalCode = inputCode;
      }

      const res = await fetch('/api/task-chains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `发货任务 - ${country.name} ${context.postalCode || inputCode || ''}`.trim(),
          sourceTool: 'postal-code',
          context,
        }),
      });
      const json = await res.json();
      if (json.success && json.taskChain) {
        trackEvent.custom('postal-code', 'join_shipping_task_chain');
        router.push(`/workspace/task-chains/shipping/${json.taskChain.id}`);
      } else {
        alert(json.error || '创建任务链失败');
      }
    } catch (e) {
      console.error(e);
      alert('网络错误，请稍后重试');
    } finally {
      setTaskChainCreating(false);
    }
  };

  // Open task chain dialog with current address data
  const openTaskChainDialog = (result?: DbResult) => {
    if (sessionStatus === 'loading') return;
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    // Collect address data
    let addressData: Record<string, string> = {
      country: country.name,
    };

    if (result) {
      addressData.postalCode = result.postalCode;
      addressData.city = result.city;
      addressData.province = result.province || result.adminName1 || '';
      addressData.addressLine = `${result.city}${result.areaName && result.areaName !== result.city ? ` (${result.areaName})` : ''}, ${result.province || result.adminName1 || ''}`.trim();
    } else if (dbResults.length > 0) {
      const first = dbResults[0];
      addressData.postalCode = first.postalCode;
      addressData.city = first.city;
      addressData.province = first.province || first.adminName1 || '';
      addressData.addressLine = `${first.city}, ${first.province || first.adminName1 || ''}`.trim();
    } else if (inputCode) {
      addressData.postalCode = inputCode;
    }

    setSelectedAddress(addressData);
    setShowTaskChainDialog(true);
  };

  // Handle selecting an existing task chain
  const handleSelectTaskChain = async (taskChain: TaskChain) => {
    if (!selectedAddress) return;
    setTaskChainCreating(true);
    try {
      await importToolDataToTaskChain(taskChain.id, 'postal-helper', selectedAddress);
      trackEvent.custom('postal-code', 'import_to_task_chain');
      setShowTaskChainDialog(false);
      setSelectedAddress(null);
      router.push(`/workspace/task-chains/${taskChain.id}`);
    } catch (e) {
      console.error(e);
      alert('导入数据到任务链失败，请稍后重试');
    } finally {
      setTaskChainCreating(false);
    }
  };

  // Handle creating a new task chain
  const handleCreateNewTaskChain = async (title: string): Promise<TaskChain> => {
    const context = selectedAddress || { country: country.name };
    const newChain = await createTaskChain({
      title,
      sourceTool: 'postal-code',
      context,
    });
    trackEvent.custom('postal-code', 'create_task_chain_from_dialog');
    return newChain;
  };

  // Advanced city search (Mode 1: 查邮编)
  const searchAdvancedCity = useCallback(async (q: string) => {
    if (!q.trim()) {
      setAdvancedCityResults([]);
      setAdvancedCityRecommendations(null);
      return;
    }
    if (advancedCityAbortRef.current) advancedCityAbortRef.current.abort();
    const controller = new AbortController();
    advancedCityAbortRef.current = controller;
    setAdvancedCityLoading(true);
    try {
      const res = await fetch(`/api/postal-codes/advanced?mode=city&q=${encodeURIComponent(q)}&country=${selectedCountryCode}`, {
        signal: controller.signal,
      });
      const json = await res.json();
      setAdvancedCityResults(json.results || []);
      setAdvancedCityRecommendations(json.recommendations || null);
      trackEvent.custom('postal-code', 'advanced_city_search');
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('Advanced city search failed:', e);
    } finally {
      setAdvancedCityLoading(false);
    }
  }, [selectedCountryCode]);

  // Advanced region search (Mode 2: 查地区)
  const searchAdvancedRegion = useCallback(async (q: string) => {
    if (!q.trim()) {
      setAdvancedRegionResults([]);
      setAdvancedRegionRecommendations(null);
      return;
    }
    if (advancedRegionAbortRef.current) advancedRegionAbortRef.current.abort();
    const controller = new AbortController();
    advancedRegionAbortRef.current = controller;
    setAdvancedRegionLoading(true);
    try {
      const res = await fetch(`/api/postal-codes/advanced?mode=region&q=${encodeURIComponent(q)}&country=${selectedCountryCode}`, {
        signal: controller.signal,
      });
      const json = await res.json();
      setAdvancedRegionResults(json.results || []);
      setAdvancedRegionRecommendations(json.recommendations || null);
      trackEvent.custom('postal-code', 'advanced_region_search');
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('Advanced region search failed:', e);
    } finally {
      setAdvancedRegionLoading(false);
    }
  }, [selectedCountryCode]);

  // Advanced format search (Mode 3: 查地址格式)
  const searchAdvancedFormat = useCallback((countryInput: string) => {
    const code = countryInput || selectedCountryCode;
    const format = ADDRESS_FORMATS[code.toUpperCase()];
    if (format) {
      setAdvancedFormatResult(format);
      setAdvancedFormatBasicInfo(null);
    } else {
      // Build basic info from existing data
      const country = SUPPORTED_COUNTRIES.find(c => c.code === code.toUpperCase());
      const officialLink = getOfficialLink(code.toUpperCase());
      setAdvancedFormatResult(null);
      setAdvancedFormatBasicInfo({
        countryCode: code.toUpperCase(),
        countryName: country?.name || code,
        countryNameEn: country?.nameEn || '',
        flag: country?.flag || '',
        postalFormat: getPostalFormat(code.toUpperCase()) || '请查询官方邮政网站',
        examplePostal: getExamplePostal(code.toUpperCase()) || '',
        phoneCode: getPhoneCode(code.toUpperCase()) || '',
        timezone: getTimezone(code.toUpperCase()) || '',
        officialLookupUrl: officialLink?.lookupUrl || officialLink?.officialUrl || '',
        officialName: officialLink?.nameEn || '',
      });
    }
    trackEvent.custom('postal-code', 'advanced_format_search');
  }, [selectedCountryCode]);

  // Auto-trigger format search when switching to format mode
  useEffect(() => {
    if (queryMode === 'format') {
      searchAdvancedFormat(selectedCountryCode);
    }
  }, [queryMode, selectedCountryCode, searchAdvancedFormat]);

  // Main unified search handler — routes postal codes to region lookup, city/address to DB search
  const handleMainSearch = () => {
    const q = mainSearch.trim();
    if (!q) return;
    if (looksLikePostalCode(q)) {
      setQueryMode('region');
      setAdvancedRegionQuery(q);
      searchAdvancedRegion(q);
    } else {
      setDbQuery(q);
      queryDb(q, selectedCountryCode);
    }
    trackEvent.postalQuery();
  };

  // Scroll to the official links section
  const scrollToOfficialLinks = () => {
    document.getElementById('official-links')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
              海外地址与邮编助手
            </h1>
            <p className="text-lg text-teal-100/90 max-w-2xl leading-relaxed">
              支持输入城市、邮编、州省、地址关键词，查询精确邮编、邮编范围、地址格式和官方查询入口。适用于跨境电商、国际物流、留学、海外生活等场景。
            </p>
            {/* Coverage status badge */}
            {(() => {
              const coverage = getCoverageStatus(selectedCountryCode);
              const icon = getCoverageIcon(coverage.status);
              const label = getCoverageLabel(coverage.status);
              return (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  <span>{icon}</span>
                  <span className="text-teal-100">{country.name}：{label}</span>
                  {coverage.recordCount && <span className="text-teal-200/70 text-xs">({coverage.recordCount.toLocaleString()} 条记录)</span>}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* ===== DISCLAIMER ===== */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>免责声明：</strong>数据来源于公开邮编数据源，结果仅供参考。正式发货前请以当地邮政或物流服务商信息为准。
          </div>
        </div>
        {/* TW Attribution - 中华邮政官方数据来源声明 */}
        {selectedCountryCode === 'TW' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">🟡 中国台湾 — 基础区级 3 码邮递区号参考</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                当前提供区级 3 码邮递区号参考，详细投递前请以官方邮政资料为准。
              </p>
              <p className="text-xs text-blue-600 mt-2 leading-relaxed border-t border-blue-200 pt-2">
                <strong>资料来源：</strong>中华邮政股份有限公司《臺灣地區郵遞區號前3碼一覽表》。本开放资料依政府資料開放授權條款第 1 版提供。查询结果仅供参考，正式投递前请以中华邮政官方资料为准。
              </p>
            </div>
          </div>
        )}

        {/* ===== 1. 选择国家 / 地区 (核心区块 1) ===== */}
        <div className={cardStyles.base + ' mb-6'}>
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-1">1. 选择国家 / 地区</h2>
            <p className="text-sm text-gray-500">选择国家后，下方查询区将自动切换到对应国家的邮编数据库</p>
          </div>
          <div className="p-5">
            {/* 当前查询国家指示器 */}
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-teal-50 rounded-lg border border-teal-100">
              <Database className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">当前查询：{country.flag} {country.name}邮编数据库</span>
              <span className="text-xs text-teal-500 ml-auto">{SUPPORTED_COUNTRIES.length}+ 国家可选</span>
            </div>
            {/* 搜索国家 */}
            <div className="flex flex-wrap gap-2">
              <div className="relative w-full sm:w-72">
                <input
                  list="country-list"
                  placeholder="搜索国家（如 Japan、德国、JP）…"
                  value={countrySearch}
                  onChange={e => {
                    setCountrySearch(e.target.value);
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
              {/* 热门国家快捷选择 */}
              <div className="flex flex-wrap gap-1.5">
                {/* 北美 */}
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
                {/* 欧洲 */}
                {['GB', 'DE', 'FR'].map(code => {
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
                {/* 亚太 */}
                {['JP', 'AU', 'SG', 'MY'].map(code => {
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
            </div>
          </div>
        </div>

        {/* ===== 2. 数据库邮编查询 (核心区块 2) ===== */}
        <div className="bg-white rounded-xl border-2 border-teal-200 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">2. 数据库邮编查询</h2>
            <span className="text-xs text-gray-400 ml-auto">当前查询：{country.flag} {country.name}邮编数据库</span>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className={`${inputStyles} pl-11 text-base`}
                placeholder="输入邮编、城市、州省、地址关键词，例如 M5V 3L9 / Toronto / Tokyo / 90210"
                value={mainSearch}
                onChange={e => setMainSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMainSearch()}
              />
            </div>
            <button onClick={handleMainSearch}
              className={`${buttonVariants.primary} px-6 text-base shadow-sm whitespace-nowrap`}>
              <Search className="w-4 h-4" />
              开始查询
            </button>
          </div>
          <p className="text-xs text-gray-400">数据来源于公开邮编数据源，结果仅供参考。精确邮编以数据库查询、完整地址或官方入口确认为准。</p>
        </div>

        {/* ===== FORMAT MODE PANEL ===== */}
        {queryMode === 'format' && (
          <div className={cardStyles.base + ' mb-6'}>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  {advancedFormatResult?.flag || country.flag} {advancedFormatResult?.countryNameCn || country.name}寄件地址格式
                </h2>
              </div>

              {/* Country selector for format mode */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-gray-400 self-center">选择国家：</span>
                {Object.keys(ADDRESS_FORMATS).map(code => {
                  const fmt = ADDRESS_FORMATS[code];
                  const sc = SUPPORTED_COUNTRIES.find(c => c.code === code);
                  return (
                    <button key={code} onClick={() => searchAdvancedFormat(code)}
                      className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all ${
                        (advancedFormatResult?.countryCode || advancedFormatBasicInfo?.countryCode) === code
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                      }`}>
                      {sc?.flag || fmt.flag} {fmt.countryNameCn}
                    </button>
                  );
                })}
              </div>

              {advancedFormatResult ? (
                <div className="space-y-4">
                  {/* Standard English Format */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">📋 标准英文地址格式</span>
                      <button onClick={() => copyText(advancedFormatResult.format, 'format-template')}
                        className="flex items-center gap-1 text-xs text-teal-600 hover:underline px-2 py-1 rounded hover:bg-teal-50 transition-colors">
                        {copiedField === 'format-template' ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制格式模板</>}
                      </button>
                    </div>
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border">{advancedFormatResult.format}</pre>
                  </div>

                  {/* Chinese Explanation */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <span className="text-sm font-semibold text-blue-800">📝 中文说明</span>
                    <p className="text-sm text-blue-700 mt-2 leading-relaxed">{advancedFormatResult.formatCn}</p>
                  </div>

                  {/* Example Address */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-800">✅ 示例地址</span>
                      <button onClick={() => copyText(advancedFormatResult.example, 'format-example')}
                        className="flex items-center gap-1 text-xs text-green-700 hover:underline px-2 py-1 rounded hover:bg-green-100 transition-colors">
                        {copiedField === 'format-example' ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制示例</>}
                      </button>
                    </div>
                    <pre className="text-sm text-green-900 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border leading-relaxed">{advancedFormatResult.example}</pre>
                  </div>

                  {/* Notes */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <span className="text-sm font-semibold text-amber-800">⚠️ 注意事项</span>
                    <ul className="mt-2 space-y-1.5">
                      {advancedFormatResult.notes.map((note: string, i: number) => (
                        <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">•</span> {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Postal Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">邮编格式</div>
                      <div className="text-sm font-mono font-semibold text-teal-700 mt-1">{advancedFormatResult.countryCode === selectedCountryCode ? country.format : (getPostalFormat(advancedFormatResult.countryCode) || '—')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">示例邮编</div>
                      <div className="text-sm font-mono font-semibold text-teal-700 mt-1">{getExamplePostal(advancedFormatResult.countryCode) || '—'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">电话区号</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{getPhoneCode(advancedFormatResult.countryCode) || '—'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">时区</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{getTimezone(advancedFormatResult.countryCode) || '—'}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {advancedFormatResult.officialLookupUrl && (
                      <a href={advancedFormatResult.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                        <ExternalLink className="w-4 h-4" /> 打开 {advancedFormatResult.officialName} 官方查询
                      </a>
                    )}
                    <Link href="/tools/address-formatter"
                      className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Sparkles className="w-4 h-4" /> 使用地址格式化工具
                    </Link>
                    <button onClick={() => copyText(advancedFormatResult.example, 'format-copy-all')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      {copiedField === 'format-copy-all' ? <><Check className="w-4 h-4 text-green-600" /> 已复制</> : <><Copy className="w-4 h-4" /> 复制示例地址</>}
                    </button>
                  </div>
                </div>
              ) : advancedFormatBasicInfo ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{advancedFormatBasicInfo.flag} {advancedFormatBasicInfo.countryName} 邮编信息</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">邮编格式：</span><code className="font-mono text-teal-700">{advancedFormatBasicInfo.postalFormat}</code></div>
                      {advancedFormatBasicInfo.examplePostal && <div><span className="text-gray-500">示例邮编：</span><code className="font-mono text-teal-700">{advancedFormatBasicInfo.examplePostal}</code></div>}
                      {advancedFormatBasicInfo.phoneCode && <div><span className="text-gray-500">电话区号：</span>{advancedFormatBasicInfo.phoneCode}</div>}
                      {advancedFormatBasicInfo.timezone && <div><span className="text-gray-500">时区：</span>{advancedFormatBasicInfo.timezone}</div>}
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-700">该国家的详细寄件地址格式暂未收录，请参考官方邮政网站获取完整信息。</p>
                  </div>
                  {advancedFormatBasicInfo.officialLookupUrl && (
                    <a href={advancedFormatBasicInfo.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                      <ExternalLink className="w-4 h-4" /> 打开 {advancedFormatBasicInfo.officialName} 官方查询
                    </a>
                  )}
                  <Link href="/tools/address-formatter"
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Sparkles className="w-4 h-4" /> 使用地址格式化工具
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">选择上方国家查看寄件地址格式</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== CITY RANGE SEARCH (辅助参考) ===== */}
        <div className={cardStyles.base + ' mb-6'}>
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className={cardStyles.header}>
                <Globe className="w-5 h-5 text-gray-400" />
                城市/地区邮编范围查询
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                辅助参考
              </span>
            </div>
              <p className="text-sm text-gray-500 mt-1">
                输入城市名（中文或英文），查询邮编范围、地址格式和官方查询入口。支持缩写（如 LA、多伦多）。
              </p>
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                城市级结果仅供参考，精确邮编以数据库查询、完整地址或官方入口确认为准。
              </p>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className={`${inputStyles} pl-9`}
                    placeholder="输入城市名（如 Toronto、多伦多、LA）..."
                    value={advancedCityQuery}
                    onChange={e => setAdvancedCityQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchAdvancedCity(advancedCityQuery)}
                  />
                </div>
                <button onClick={() => searchAdvancedCity(advancedCityQuery)} disabled={advancedCityLoading}
                  className={buttonVariants.primary}>
                  {advancedCityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {advancedCityLoading ? '查询中…' : '查询'}
                </button>
              </div>

              {/* Quick search examples */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-gray-400">热门城市：</span>
                {['Toronto', 'Los Angeles', 'London', 'Tokyo', 'Sydney', 'Singapore', 'New York', 'Vancouver'].map(city => (
                  <button key={city} onClick={() => { setAdvancedCityQuery(city); searchAdvancedCity(city); }}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors">
                    {city}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {advancedCityLoading && (
                <div className="flex items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> 正在查询…
                </div>
              )}

              {/* Results */}
              {!advancedCityLoading && advancedCityResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">找到 {advancedCityResults.length} 个城市</p>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[32rem] overflow-y-auto">
                    {advancedCityResults.map((city, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-bold text-lg text-gray-900">{city.en}</span>
                            <span className="text-sm text-gray-500 ml-2">{city.cn}</span>
                          </div>
                          <span className="font-mono text-sm text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{city.postalRange}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-2">
                          <div><span className="text-gray-400">国家：</span>{SUPPORTED_COUNTRIES.find(c => c.code === city.countryCode)?.flag} {SUPPORTED_COUNTRIES.find(c => c.code === city.countryCode)?.name}</div>
                          <div><span className="text-gray-400">省/州：</span>{city.province}</div>
                          <div><span className="text-gray-400">邮编格式：</span><code className="font-mono text-teal-700">{city.postalFormat}</code></div>
                          {city.timezone && <div><span className="text-gray-400">时区：</span>{city.timezone}</div>}
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-1.5 border-t border-gray-200 pt-2 mt-1">
                          <button onClick={() => copyText(`${city.en}, ${city.province} ${city.postalPrefix}`, `city-adv-${idx}`)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded transition-colors">
                            {copiedField === `city-adv-${idx}` ? '✅ 已复制' : '复制城市+省+邮编'}
                          </button>
                          {city.addressFormat && (
                            <button onClick={() => copyText(city.addressFormat, `addr-adv-${idx}`)}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded transition-colors">
                              {copiedField === `addr-adv-${idx}` ? '✅ 已复制' : '复制地址格式'}
                            </button>
                          )}
                          {city.officialLookupUrl && (
                            <a href={city.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors inline-flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> 官方查询
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations when no results */}
              {!advancedCityLoading && advancedCityQuery && advancedCityResults.length === 0 && advancedCityRecommendations && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">未找到匹配城市</span>
                  </div>
                  <div className="space-y-3">
                    {/* Official lookup */}
                    {advancedCityRecommendations.officialLookup && (
                      <a href={advancedCityRecommendations.officialLookup.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                        <ExternalLink className="w-4 h-4" /> 打开 {advancedCityRecommendations.officialLookup.name} 官方邮编查询
                      </a>
                    )}
                    {/* Popular cities */}
                    {advancedCityRecommendations.popularCities?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">热门城市推荐：</p>
                        <div className="flex flex-wrap gap-1.5">
                          {advancedCityRecommendations.popularCities.map((c: any, i: number) => (
                            <button key={i} onClick={() => { setAdvancedCityQuery(c.name); searchAdvancedCity(c.name); }}
                              className="px-2.5 py-1 text-xs bg-white hover:bg-teal-50 hover:text-teal-700 rounded border border-gray-200 transition-colors">
                              {c.name} / {c.nameCn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Manual format generator link */}
                    <Link href="/tools/address-formatter"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Sparkles className="w-4 h-4" /> 手动地址格式生成器
                    </Link>
                  </div>
                </div>
              )}

              {/* Initial empty state */}
              {!advancedCityLoading && !advancedCityQuery && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">输入城市名（中英文均可），查询邮编范围</p>
                  <p className="text-xs text-gray-300 mt-1">支持缩写如 LA、NYC、SF</p>
                </div>
              )}
            </div>
            </div>

            {/* ===== REGION SEARCH MODE PANEL (查地区) ===== */}
        {queryMode === 'region' && (
          <div className={cardStyles.base + ' mb-6'}>
            <div className="p-5 border-b border-gray-100">
              <h2 className={cardStyles.header}>
                <MapPin className="w-5 h-5 text-indigo-600" />
                邮编查地区
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                输入邮编，查询所属国家、城市、省份、区域和时区信息。
              </p>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-4">
                <input
                  className={`${inputStyles} flex-1 font-mono`}
                  placeholder={country.format || '输入邮编（如 M5V2T6、10001、SW1A1AA）...'}
                  value={advancedRegionQuery}
                  onChange={e => setAdvancedRegionQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAdvancedRegion(advancedRegionQuery)}
                />
                <button onClick={() => searchAdvancedRegion(advancedRegionQuery)} disabled={advancedRegionLoading}
                  className={buttonVariants.primary}>
                  {advancedRegionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {advancedRegionLoading ? '查询中…' : '查询'}
                </button>
              </div>

              {/* Quick examples */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-gray-400">示例：</span>
                {['M5V2T6', '10001', 'SW1A1AA', '100-0001', '2000', '018956'].map(code => (
                  <button key={code} onClick={() => { setAdvancedRegionQuery(code); searchAdvancedRegion(code); }}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md font-mono transition-colors">
                    {code}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {advancedRegionLoading && (
                <div className="flex items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> 正在查询…
                </div>
              )}

              {/* Results */}
              {!advancedRegionLoading && advancedRegionResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">找到 {advancedRegionResults.length} 条匹配</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {advancedRegionResults.map((r, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="font-mono text-xl font-bold text-indigo-600">{r.postalCode}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.matchType === 'exact' ? 'bg-green-100 text-green-700' :
                            r.matchType === 'prefix' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {r.matchType === 'exact' ? '精确匹配' : r.matchType === 'prefix' ? '前缀匹配' : '格式匹配'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-400 text-xs">国家</span><div className="font-semibold text-gray-900">{r.country}</div></div>
                          <div><span className="text-gray-400 text-xs">城市</span><div className="text-gray-700">{r.city || '—'}{r.cityCn ? ` (${r.cityCn})` : ''}</div></div>
                          <div><span className="text-gray-400 text-xs">省/州</span><div className="text-gray-700">{r.province || '—'}</div></div>
                          <div><span className="text-gray-400 text-xs">区域</span><div className="text-gray-700">{r.region || '—'}</div></div>
                          {r.timezone && <div><span className="text-gray-400 text-xs">时区</span><div className="text-gray-700">{r.timezone}</div></div>}
                          {r.phoneCode && <div><span className="text-gray-400 text-xs">电话区号</span><div className="text-gray-700">{r.phoneCode}</div></div>}
                          {r.postalRange && <div className="col-span-2"><span className="text-gray-400 text-xs">邮编范围</span><div className="font-mono text-teal-700">{r.postalRange}</div></div>}
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-1.5 border-t border-gray-200 pt-2 mt-2">
                          <button onClick={() => copyText(`${r.city}, ${r.province} ${r.postalCode}`.trim(), `region-adv-${idx}`)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 rounded transition-colors">
                            {copiedField === `region-adv-${idx}` ? '✅ 已复制' : '复制城市+省+邮编'}
                          </button>
                          {r.officialLookupUrl && (
                            <a href={r.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors inline-flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> 官方查询
                            </a>
                          )}
                        </div>
                        {r.note && (
                          <p className="text-xs text-amber-600 mt-2">{r.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations when no results */}
              {!advancedRegionLoading && advancedRegionQuery && advancedRegionResults.length === 0 && advancedRegionRecommendations && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold text-gray-700">未找到匹配的邮编信息</span>
                  </div>
                  <div className="space-y-3">
                    {advancedRegionRecommendations.officialLookup && (
                      <a href={advancedRegionRecommendations.officialLookup.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                        <ExternalLink className="w-4 h-4" /> 打开 {advancedRegionRecommendations.officialLookup.name} 官方邮编查询
                      </a>
                    )}
                    {advancedRegionRecommendations.popularCities?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">热门城市邮编参考：</p>
                        <div className="flex flex-wrap gap-1.5">
                          {advancedRegionRecommendations.popularCities.map((c: any, i: number) => (
                            <button key={i} onClick={() => { setAdvancedRegionQuery(c.postalPrefix); searchAdvancedRegion(c.postalPrefix); }}
                              className="px-2.5 py-1 text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 rounded border border-gray-200 transition-colors font-mono">
                              {c.name}: {c.postalPrefix}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <Link href="/tools/address-formatter"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Sparkles className="w-4 h-4" /> 手动地址格式生成器
                    </Link>
                  </div>
                </div>
              )}

              {/* Initial empty state */}
              {!advancedRegionLoading && !advancedRegionQuery && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">输入邮编，查询所属地区信息</p>
                  <p className="text-xs text-gray-300 mt-1">支持各国邮编格式（去掉空格和连字符）</p>
                </div>
              )}
            </div>
          </div>
        )}

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
                  {selectedCountryCode === 'MY' && (
                    <>
                      <button onClick={() => { setInputCode('50450'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">50450</button>
                      <button onClick={() => { setInputCode('40000'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md font-mono transition-colors">40000</button>
                      <button onClick={() => { setInputCode('Kuala Lumpur'); }} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors">Kuala Lumpur</button>
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
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${matchColor}`}>
                                  {matchLabel}
                                </span>
                                <button
                                  onClick={() => copyText(`${r.postalCode}\n${r.city}${r.areaName && r.areaName !== r.city ? ` (${r.areaName})` : ''}\n${r.province || r.adminName1 || ''}${r.adminCode1 ? ` (${r.adminCode1})` : ''}\n${r.country}${r.latitude != null && r.longitude != null ? `\n📍 ${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` : ''}`, `all-${r.id}`)}
                                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="复制全部地址信息">
                                  {copiedField === `all-${r.id}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              <div><span className="text-gray-400 text-xs">城市</span><div className="font-semibold text-gray-900">{r.city}{r.areaName && r.areaName !== r.city ? ` (${r.areaName})` : ''}</div></div>
                              <div><span className="text-gray-400 text-xs">省/州</span><div className="text-gray-700">{r.province || r.adminName1 || '—'}{r.adminCode1 ? ` (${r.adminCode1})` : ''}</div></div>
                              {r.district && <div><span className="text-gray-400 text-xs">区域</span><div className="text-gray-700">{r.district}</div></div>}
                              <div><span className="text-gray-400 text-xs">国家</span><div className="text-gray-700">🌍 {r.country}</div></div>
                              {getPhoneCode(r.countryCode) && <div><span className="text-gray-400 text-xs">电话区号</span><div className="text-gray-700">{getPhoneCode(r.countryCode)}</div></div>}
                              {r.source && <div><span className="text-gray-400 text-xs">数据源</span><div className="text-gray-500 text-xs">{r.source}</div></div>}
                              {r.latitude != null && r.longitude != null && (
                                <div><span className="text-gray-400 text-xs">经纬度</span><div className="text-gray-500 text-xs">📍 {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</div></div>
                              )}
                            </div>
                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-1.5 border-t border-gray-200 pt-2 mt-1">
                              <button onClick={() => copyText(r.postalCode, `postal-${r.id}`)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded transition-colors">
                                {copiedField === `postal-${r.id}` ? '✅ 已复制' : '复制邮编'}
                              </button>
                              <button onClick={() => copyText(`${r.city}, ${r.province || r.adminName1 || ''} ${r.postalCode}`.trim(), `city-${r.id}`)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 rounded transition-colors">
                                {copiedField === `city-${r.id}` ? '✅ 已复制' : '复制城市+省+邮编'}
                              </button>
                              {getOfficialLink(r.countryCode) && (
                                <a href={getOfficialLink(r.countryCode)!.lookupUrl || getOfficialLink(r.countryCode)!.officialUrl}
                                  target="_blank" rel="noopener noreferrer"
                                  className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors inline-flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> 官方查询
                                </a>
                              )}
                              <a href={`mailto:support@jueshi.net?subject=邮编数据报告&body=国家: ${r.country}%0A邮编: ${r.postalCode}%0A城市: ${r.city}%0A问题描述: `}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-orange-50 hover:text-orange-700 rounded transition-colors">
                                报告错误
                              </a>
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

                    {/* 加入任务链按钮 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => openTaskChainDialog()}
                        disabled={taskChainCreating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {taskChainCreating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                        <span>{sessionStatus !== 'authenticated' ? '登录后继续' : '加入任务链'}</span>
                      </button>
                      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 text-center">
                        将查询到的地址信息带入任务链工作台，继续安排发货。
                      </p>
                    </div>
                  </>
                )}

                {/* Empty state */}
                {!dbLoading && dbQuery && dbResults.length === 0 && (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-600 mb-1">没有找到完全匹配</p>
                    <div className="text-sm text-gray-400 mb-4 space-y-1">
                      <p>可以尝试：</p>
                      <ul className="text-left inline-block">
                        <li>• 输入城市英文名（如 Tokyo、Seoul）</li>
                        <li>• 输入邮编前缀</li>
                        <li>• 切换其他国家</li>
                      </ul>
                    </div>
                    {getCoverageStatus(selectedCountryCode).status === 'none' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 mx-4">
                        <p className="text-sm text-amber-700 font-medium">⚫ 当前数据源暂未覆盖 {country.name}</p>
                        <p className="text-xs text-amber-600 mt-1">后续将根据优先级补充数据。请先使用官方邮政网站查询。</p>
                      </div>
                    )}
                    {getCoverageStatus(selectedCountryCode).status === 'minimal' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 mx-4">
                        <p className="text-sm text-red-700 font-medium">🔴 {country.name} 数据极少，可能无法查到结果</p>
                        <p className="text-xs text-red-600 mt-1">建议使用官方邮政网站获取更完整的信息。</p>
                      </div>
                    )}
                    {selectedCountryCode === 'TW' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mx-4">
                        <p className="text-sm text-blue-700 font-medium">🟡 中国台湾 — 区级 3 码邮递区号参考</p>
                        <p className="text-xs text-blue-600 mt-1">当前数据为区级（乡镇市区级）3 码前缀，共 331 条。如需完整 3+3 码投递信息，请使用下方中华邮政官方查询。</p>
                      </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-2">
                      {getOfficialLink(selectedCountryCode) && (
                        <a href={getOfficialLink(selectedCountryCode)!.lookupUrl || getOfficialLink(selectedCountryCode)!.officialUrl}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                          <ExternalLink className="w-4 h-4" /> 打开 {getOfficialLink(selectedCountryCode)!.nameEn} 官方查询
                        </a>
                      )}
                      <a href={`mailto:support@jueshi.net?subject=邮编数据缺失报告&body=国家: ${country.name} (${selectedCountryCode})%0A查询: ${dbQuery}%0A问题: 查不到结果`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                        报告缺失数据
                      </a>
                    </div>
                  </div>
                )}

                {/* Initial empty state — hidden when results exist */}
                {!dbLoading && !dbQuery && dbResults.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">输入邮编或城市名，查询具体地址信息</p>
                  </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">跨境电商</h3>
                    <p className="text-xs text-gray-500 mt-1">买家地址完整性检查、地址格式参考。适用于 Amazon / Shopify / eBay 等平台卖家。</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">国际物流</h3>
                    <p className="text-xs text-gray-500 mt-1">邮编有效性验证、地址格式确认。DHL / FedEx / USPS 等物流商均依赖准确邮编。</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">留学 / 海外生活</h3>
                    <p className="text-xs text-gray-500 mt-1">学校、租房、银行地址填写参考。确保地址格式符合当地标准。</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">海外华人生活</h3>
                    <p className="text-xs text-gray-500 mt-1">网购、寄件、回国寄件地址格式参考。集运收货地址核对。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1/3): States + Official Links + Address Format + Ad Placeholder */}
          <div className="space-y-6">
            {/* Google Ads Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">广告</div>
              <div className="text-sm text-gray-500">Google Ads Placeholder</div>
              <div className="text-xs text-gray-400 mt-1">300×250 / 300×600</div>
            </div>
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
            <div id="official-links" className={cardStyles.base}>
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
                  {country.officialLookupUrl && (
                    <a href={country.officialLookupUrl} target="_blank" rel="noopener noreferrer"
                      className={`${buttonVariants.primary} w-full justify-center`}>
                      <ExternalLink className="w-4 h-4" /> 查询邮编 — {country.officialName}
                    </a>
                  )}
                  {country.officialUrl && (
                    <a href={country.officialUrl} target="_blank" rel="noopener noreferrer"
                      className={`${buttonVariants.secondary} w-full justify-center`}>
                      <ExternalLink className="w-4 h-4" /> 前往 {country.officialName} 首页
                    </a>
                  )}
                  {!country.officialLookupUrl && !country.officialUrl && (
                    <p className="text-sm text-gray-400 text-center py-2">暂无官方查询链接</p>
                  )}
                </div>

                {/* Quick links to all countries */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-400 mb-2">各国官方邮编查询</p>
                  <div className="space-y-2">
                    {allCountryData.filter(c => c.code !== country.code && c.officialLookupUrl).map(c => (
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

        {/* ===== AD SLOT + COUNTRY INFO ===== */}
        <AdSlot placement="tool-postal-code-mid" country={country.name} className="mt-8 mb-8" />

        <CountryInfoSection countryCode={selectedCountryCode} countryName={country.name} className="mb-8" />

        {/* ===== LOCAL TIME + EMBASSY + EXCHANGE RATE ===== */}
        <div className={cardStyles.base}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <Info className="w-4 h-4 text-violet-600" />
              {country.name}实用信息
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Local Time */}
            <div className="flex items-center justify-between bg-violet-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <div>
                  <div className="text-xs text-gray-500">当地时间</div>
                  <div className="text-sm font-mono font-semibold text-gray-900">
                    {localTime || '—'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {timezone ? timezone.replace('_', ' ') : '—'}
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Embassy Link */}
              {embassy ? (
                <a
                  href={embassy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-all text-center"
                >
                  <span className="text-xl">🏛️</span>
                  <span className="text-xs font-medium">{embassy.name}</span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 bg-gray-50 rounded-lg p-4 border border-gray-200 text-center text-gray-400">
                  <span className="text-xl">🏛️</span>
                  <span className="text-xs">暂无使馆链接</span>
                </div>
              )}

              {/* Exchange Rate */}
              <Link
                href="/tools/exchange-rate"
                className="flex flex-col items-center justify-center gap-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg p-4 border border-gray-200 hover:border-emerald-200 transition-all text-center"
              >
                <span className="text-xl">💱</span>
                <span className="text-xs font-medium">汇率查询</span>
              </Link>
            </div>
          </div>
        </div>

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
          {
            question: "邮编和 ZIP Code 是一回事吗？",
            answer: "本质上都是邮政编码，只是叫法不同。美国叫 ZIP Code，加拿大/英国/澳洲等叫 Postal Code。功能相同，都是帮助邮政系统分拣和投递邮件。",
          },
          {
            question: "邮编错误会影响派送吗？",
            answer: "会。邮编错误可能导致包裹分拣到错误区域，延误投递甚至退回。填写快递面单时务必核对邮编，尤其是集运仓地址。",
          },
        ]} />

        {/* Recent Queries */}
        {recentQueries.length > 0 && (
          <div className={cardStyles.base + " mt-8"}>
            <div className="p-4 border-b border-gray-100">
              <h2 className={cardStyles.header}>
                <Search className="w-4 h-4 text-gray-500" />
                最近查询
              </h2>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {recentQueries.map((rq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputCode(rq.query);
                      setSelectedCountryCode(rq.country);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg text-sm text-gray-600 transition-colors border border-gray-200"
                  >
                    <span className="font-mono text-teal-600">{rq.query}</span>
                    <span className="text-xs text-gray-400">({rq.country})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Tools */}
        <div className={cardStyles.base + " mt-8"}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={cardStyles.header}>
              <Truck className="w-4 h-4 text-blue-600" />
              下一步推荐工具
            </h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/tools/address-formatter"
              onClick={() => trackEvent.custom('postal-code', 'click_related_address-formatter')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">地址格式化</p>
                <p className="text-xs text-gray-500">生成规范英文地址</p>
              </div>
            </Link>
            <Link href="/tools/shipping-calculator"
              onClick={() => trackEvent.custom('postal-code', 'click_related_shipping-calculator')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">运费计算</p>
                <p className="text-xs text-gray-500">估算集运/快递费用</p>
              </div>
            </Link>
            <Link href="/tools/exchange-rate"
              onClick={() => trackEvent.custom('postal-code', 'click_related_exchange-rate')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all">
              <span className="text-2xl">💱</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">汇率换算</p>
                <p className="text-xs text-gray-500">实时货币换算</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related Checklist */}
        <RelatedChecklistSection
          toolSlug="postal-code"
          sourcePath="postal-code"
        />

        {/* Task Chain Next Step */}
        <div className="mt-8">
          <TaskChainNextStep
            sourceTool="postal-code"
            steps={TASK_CHAIN_STEPS['postal-code']}
          />
        </div>

        {/* Smart Contextual Interlinking */}
        <div className="mt-8">
          <SmartRelatedLinks
            country={selectedCountryCode}
            tags={["邮编", selectedCountryCode]}
            tool="postal-code"
            type="tool"
            layout="bottom"
          />
        </div>

        {/* Tool-specific ads */}
        <AdSlot placement="tool-postal-code-bottom" className="mt-8 mb-8" />

        {/* Footer attribution */}
        <div className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 mt-8">
          部分邮编地理数据参考公开数据源整理，实际投递以当地邮政官方为准。
        </div>
      </div>

      {/* Task Chain Select Dialog */}
      <TaskChainSelectDialog
        isOpen={showTaskChainDialog}
        onClose={() => {
          setShowTaskChainDialog(false);
          setSelectedAddress(null);
        }}
        onSelect={handleSelectTaskChain}
        onCreateNew={handleCreateNewTaskChain}
        sourceTool="postal-code"
      />
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
