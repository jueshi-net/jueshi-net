'use client';

import { Clock, Phone, Globe, Mail, MapPin, Info } from 'lucide-react';

interface CountryInfoSectionProps {
  countryCode: string;
  countryName: string;
  className?: string;
}

/**
 * Country-specific logistics & practical info section for SEO.
 * Renders timezone, emergency contacts, embassy info, and long-tail keyword-rich content.
 */
export function CountryInfoSection({ countryCode, countryName, className = '' }: CountryInfoSectionProps) {
  // Country-specific data — expandable per country
  const countryData = getCountryInfo(countryCode);

  if (!countryData) return null;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white px-6 py-5">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          {countryData.flag} {countryName} — 物流与实用资讯
        </h2>
        <p className="text-teal-100 text-sm">
          时区、紧急电话、使馆信息、海运物流指南
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Timezone */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-gray-700">时区</span>
            </div>
            <p className="text-sm text-gray-600">{countryData.timezone}</p>
            <p className="text-xs text-gray-400 mt-1">与北京时间差：{countryData.timeDiff}</p>
          </div>

          {/* Emergency Phone */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-700">紧急电话</span>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>报警：{countryData.emergencyPolice}</p>
              <p>急救：{countryData.emergencyAmbulance}</p>
              <p>火警：{countryData.emergencyFire}</p>
            </div>
          </div>

          {/* Chinese Embassy */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">中国使领馆</span>
            </div>
            <p className="text-sm text-gray-600">{countryData.embassyName}</p>
            <p className="text-xs text-gray-400 mt-1">领保电话：{countryData.embassyPhone}</p>
          </div>

          {/* Currency */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-gray-700">货币 / 邮编</span>
            </div>
            <p className="text-sm text-gray-600">{countryData.currency}</p>
            <p className="text-xs text-gray-400 mt-1">邮编格式：{countryData.postalFormat}</p>
          </div>
        </div>

        {/* SEO Content Block */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            📦 {countryData.seoTitle}
          </h3>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-3">
            {countryData.seoContent.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Useful Links */}
        {countryData.usefulLinks && countryData.usefulLinks.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">常用链接</h4>
            <div className="flex flex-wrap gap-2">
              {countryData.usefulLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm hover:bg-teal-100 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Country Data ──────────────────────────────────────────────────────────────

interface CountryInfo {
  flag: string;
  timezone: string;
  timeDiff: string;
  emergencyPolice: string;
  emergencyAmbulance: string;
  emergencyFire: string;
  embassyName: string;
  embassyPhone: string;
  currency: string;
  postalFormat: string;
  seoTitle: string;
  seoContent: string[];
  usefulLinks?: { label: string; url: string }[];
}

function getCountryInfo(code: string): CountryInfo | null {
  const data: Record<string, CountryInfo> = {
    MY: {
      flag: '🇲🇾',
      timezone: 'UTC+8 (马来西亚标准时间 MYT)',
      timeDiff: '无时差（与北京时间相同）',
      emergencyPolice: '999',
      emergencyAmbulance: '999',
      emergencyFire: '999 / 112',
      embassyName: '中国驻马来西亚大使馆（吉隆坡）',
      embassyPhone: '+60-3-2163-6088',
      currency: '马来西亚令吉 (MYR / RM)',
      postalFormat: '5位数字（如 50000、47800）',
      seoTitle: '马来西亚海运双清包税攻略与邮编指南',
      seoContent: [
        '马来西亚（Malaysia）是东南亚重要的物流枢纽，与中国贸易往来频繁。对于在马来西亚生活、工作或从事跨境电商的华人来说，了解当地的邮编系统、物流方式和清关流程至关重要。',
        '马来西亚邮编由5位数字组成，前两位代表州或联邦直辖区。例如：50-59 为吉隆坡（Kuala Lumpur），40-47 为雪兰莪（Selangor），10-13 为槟城（Penang），80-86 为柔佛（Johor）。使用本站的邮编查询工具，可以快速验证收货地址的邮编是否正确。',
        '海运双清包税是马来西亚华人常用的物流方式。从中国（广州、深圳、义乌等地）发货到马来西亚，海运时效约7-12天，空运约3-5天。双清包税服务包含了中国出口报关和马来西亚进口清关，以及关税预付，适合电商卖家和集运用户。',
        '马来西亚主要港口包括巴生港（Port Klang，西马最大港口）、槟城港（Penang Port）和丹戎帕拉帕斯港（Tanjung Pelepas）。东马的沙巴（Sabah）和砂拉越（Sarawak）地区物流时效会比西马慢2-3天。',
        '在马来西亚使用集运服务时，务必确保邮编与州属匹配。吉隆坡、雪兰莪等巴生河谷地区邮编以4或5开头，如果填写错误可能导致包裹延误或投递失败。',
      ],
      usefulLinks: [
        { label: 'Pos Malaysia 官网', url: 'https://www.pos.com.my/' },
        { label: '马来西亚海关', url: 'https://mysst.customs.gov.my/' },
        { label: '中国驻马大使馆', url: 'http://my.china-embassy.gov.cn/' },
      ],
    },
    // Template for adding more countries
    CA: {
      flag: '🇨🇦',
      timezone: 'UTC-3.5 ~ UTC-8（6个时区）',
      timeDiff: '慢 12-15.5 小时',
      emergencyPolice: '911',
      emergencyAmbulance: '911',
      emergencyFire: '911',
      embassyName: '中国驻加拿大大使馆（渥太华）',
      embassyPhone: '+1-613-789-3434',
      currency: '加拿大元 (CAD / $)',
      postalFormat: 'ANA NAN（如 M5V 2T6）',
      seoTitle: '加拿大邮编查询与跨境物流指南',
      seoContent: [
        '加拿大邮编采用字母数字交替格式（ANA NAN），首位字母对应省份。例如：M开头为安大略省（多伦多），V开头为不列颠哥伦比亚省（温哥华），H开头为魁北克省（蒙特利尔）。',
        '中加跨境物流主要有空运和海运两种方式。空运时效约5-8天，适合小件包裹；海运约20-30天，适合大件货物。集运用户可通过第三方物流公司从中国发货到加拿大主要城市。',
      ],
    },
  };

  return data[code] || null;
}
