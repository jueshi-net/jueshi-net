/**
 * Postal Code Coverage Status Configuration
 * 基于 v1.20.42.6.84 审计结果
 */

export type CoverageStatus = 'full' | 'partial' | 'minimal' | 'none';

export interface CountryCoverage {
  code: string;
  status: CoverageStatus;
  recordCount?: number;
  notes?: string;
  missingFields?: string[];
}

/**
 * 国家覆盖状态映射
 * 基于数据库审计结果
 */
export const COVERAGE_STATUS: Record<string, CountryCoverage> = {
  // Grade A - Full coverage (1000+ records, all fields)
  CA: { code: 'CA', status: 'full', recordCount: 901432, notes: 'Static + DB' },
  US: { code: 'US', status: 'full', recordCount: 41488, notes: 'Static + DB' },
  GB: { code: 'GB', status: 'full', recordCount: 1820770, notes: 'Largest dataset' },
  AU: { code: 'AU', status: 'full', recordCount: 3171, notes: 'Static + DB' },
  NZ: { code: 'NZ', status: 'full', recordCount: 1737, notes: 'Static + DB' },
  JP: { code: 'JP', status: 'full', recordCount: 142577 },
  KR: { code: 'KR', status: 'full', recordCount: 34249 },
  MY: { code: 'MY', status: 'full', recordCount: 2757, notes: 'Province fixed in v1.20.42.6.83' },
  CN: { code: 'CN', status: 'full', recordCount: 2349 },
  IN: { code: 'IN', status: 'full', recordCount: 19238 },
  PH: { code: 'PH', status: 'full', recordCount: 2190 },
  TH: { code: 'TH', status: 'full', recordCount: 771 },
  DE: { code: 'DE', status: 'full', recordCount: 10813 },
  FR: { code: 'FR', status: 'full', recordCount: 20418 },
  IT: { code: 'IT', status: 'full', recordCount: 4735 },
  ES: { code: 'ES', status: 'full', recordCount: 11150 },
  NL: { code: 'NL', status: 'full', recordCount: 4086 },
  BE: { code: 'BE', status: 'full', recordCount: 1146 },
  AT: { code: 'AT', status: 'full', recordCount: 2217 },
  CH: { code: 'CH', status: 'full', recordCount: 3362 },
  SE: { code: 'SE', status: 'full', recordCount: 18870 },
  NO: { code: 'NO', status: 'full', recordCount: 5132 },
  DK: { code: 'DK', status: 'full', recordCount: 1159 },
  FI: { code: 'FI', status: 'full', recordCount: 3576 },
  PL: { code: 'PL', status: 'full', recordCount: 20299 },
  CZ: { code: 'CZ', status: 'full', recordCount: 2694 },
  PT: { code: 'PT', status: 'full', recordCount: 197772 },
  RO: { code: 'RO', status: 'full', recordCount: 37914 },
  HU: { code: 'HU', status: 'full', recordCount: 3046 },
  RU: { code: 'RU', status: 'full', recordCount: 43538 },
  UA: { code: 'UA', status: 'full', recordCount: 26579 },
  TR: { code: 'TR', status: 'full', recordCount: 2953 },
  BR: { code: 'BR', status: 'full', recordCount: 5525 },
  AR: { code: 'AR', status: 'full', recordCount: 1976 },
  CO: { code: 'CO', status: 'full', recordCount: 3681 },
  MX: { code: 'MX', status: 'full', recordCount: 32448 },
  
  // Grade A but with field issues
  SG: { code: 'SG', status: 'full', recordCount: 121135, notes: 'City-state, no provinces needed' },
  AE: { code: 'AE', status: 'partial', recordCount: 178171, notes: 'No province in GeoNames', missingFields: ['province'] },
  ID: { code: 'ID', status: 'partial', recordCount: 8266, notes: 'No province in GeoNames', missingFields: ['province'] },
  
  // Grade B - Usable but limited
  IE: { code: 'IE', status: 'partial', recordCount: 139, notes: 'Very few records' },
  CL: { code: 'CL', status: 'partial', recordCount: 346, notes: 'Limited coverage' },
  KE: { code: 'KE', status: 'partial', recordCount: 877, notes: 'Limited coverage' },
  
  // Grade D - Almost unusable
  HK: { code: 'HK', status: 'minimal', recordCount: 1, notes: 'Only 1 record, needs fix' },
  
  // Missing - No data
  VN: { code: 'VN', status: 'none', notes: 'Data gap - user requested' },
  TW: { code: 'TW', status: 'none', notes: 'Data gap - China Taiwan' },
  SA: { code: 'SA', status: 'none', notes: 'Data gap' },
  GR: { code: 'GR', status: 'none', notes: 'Data gap' },
  IL: { code: 'IL', status: 'none', notes: 'Data gap' },
  ZA: { code: 'ZA', status: 'none', notes: 'Data gap' },
  EG: { code: 'EG', status: 'none', notes: 'Data gap' },
  NG: { code: 'NG', status: 'none', notes: 'Data gap' },
};

/**
 * 获取国家覆盖状态
 */
export function getCoverageStatus(countryCode: string): CountryCoverage {
  return COVERAGE_STATUS[countryCode] || { 
    code: countryCode, 
    status: 'none', 
    notes: 'Unknown coverage status' 
  };
}

/**
 * 获取覆盖状态图标
 */
export function getCoverageIcon(status: CoverageStatus): string {
  switch (status) {
    case 'full': return '🟢';
    case 'partial': return '🟡';
    case 'minimal': return '🔴';
    case 'none': return '⚫';
    default: return '⚪';
  }
}

/**
 * 获取覆盖状态中文描述
 */
export function getCoverageLabel(status: CoverageStatus): string {
  switch (status) {
    case 'full': return '已覆盖';
    case 'partial': return '部分覆盖';
    case 'minimal': return '极少数据';
    case 'none': return '暂未覆盖';
    default: return '未知';
  }
}

/**
 * 获取覆盖状态完整显示文本
 */
export function getCoverageDisplay(countryCode: string): string {
  const coverage = getCoverageStatus(countryCode);
  const icon = getCoverageIcon(coverage.status);
  const label = getCoverageLabel(coverage.status);
  return `${icon} ${label}`;
}
