"use client";

/**
 * CountryHeroIntelligence
 *
 * Country page hero section: gradient background, country title + CTAs on the
 * left, and an info card (local time + key facts) on the right.
 *
 * This is a client component because it renders <CountryLocalTimeCard /> which
 * depends on the browser clock.
 */

import Link from "next/link";
import type { AllCountryConfig } from "@/lib/all-countries";
import { CountryLocalTimeCard } from "./country-local-time-card";

interface CountryHeroIntelligenceProps {
  config: AllCountryConfig;
}

const POSTAL_STATUS_LABEL: Record<string, string> = {
  full: "🟢 完整覆盖",
  partial: "🟡 部分覆盖",
  reference_only: "ℹ️ 仅供参考",
  none: "⚫ 暂未覆盖",
};

export function CountryHeroIntelligence({
  config,
}: CountryHeroIntelligenceProps) {
  const cc = config.countryCode;

  const infoRows: { label: string; value: string }[] = [
    { label: "货币", value: `${config.currencyCode} · ${config.currencyName}` },
    { label: "电话区号", value: config.dialingCode },
    { label: "邮编叫法", value: config.postalCodeName },
    { label: "邮编格式", value: config.postalCodeFormat },
    {
      label: "邮编数据状态",
      value:
        POSTAL_STATUS_LABEL[config.postalDataStatus] ?? config.postalDataStatus,
    },
  ];

  // Build extra timezones for the local-time card (excluding the default tz).
  const extraTimezones = config.timezones
    .filter((tz) => tz !== config.defaultTimezone)
    .slice(0, 3)
    .map((tz) => {
      const cityGuess = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
      return { tz, city: cityGuess };
    });

  return (
    <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left: hero text + CTAs (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center gap-3 flex-wrap">
              <span className="text-4xl sm:text-5xl" aria-hidden="true">
                {config.flagEmoji}
              </span>
              <span>{config.nameZh}</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
              {config.heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href={`/tools/postal-code?country=${cc}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-teal-800 font-semibold text-sm hover:bg-teal-50 transition-colors"
              >
                🔍 查询邮编
              </Link>
              <Link
                href={`/tools/address-formatter?country=${cc}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-teal-500/90 text-white font-semibold text-sm hover:bg-teal-500 transition-colors border border-white/20"
              >
                📝 查看地址格式
              </Link>
              <Link
                href="/workspace/task-chains/shipping/new"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-teal-600/70 text-white font-semibold text-sm hover:bg-teal-600 transition-colors border border-white/20"
              >
                🚚 开始任务链
              </Link>
              <Link
                href="/bbs"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                💬 社区讨论
              </Link>
            </div>

            {/* Hot searches */}
            {config.hotSearches.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-white/60 text-xs">热门搜索：</span>
                {config.hotSearches.map((s) => (
                  <Link
                    key={s}
                    href={`/tools/postal-code?country=${cc}&q=${encodeURIComponent(s)}`}
                    className="text-white/80 text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: info card (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-5 border border-white/10 shadow-lg">
              {/* Local time */}
              <CountryLocalTimeCard
                timezone={config.defaultTimezone}
                referenceCity={config.capital}
                extraTimezones={extraTimezones}
              />

              <div className="my-4 h-px bg-white/10" />

              {/* Key facts grid */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <dt className="text-white/50 text-[11px]">{row.label}</dt>
                    <dd className="text-white/90 text-sm font-medium">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Major cities */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-white/50 text-[11px] mb-1.5">主要城市</div>
                <div className="flex flex-wrap gap-1.5">
                  {config.majorCities.slice(0, 3).map((city) => (
                    <span
                      key={city}
                      className="text-white/80 text-xs px-2 py-0.5 rounded bg-white/10"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              {/* Official postal link */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-white/50 text-[11px] mb-1.5">
                  官方邮政入口
                </div>
                <a
                  href={config.officialPostalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 hover:text-teal-200 text-sm font-medium underline-offset-2 hover:underline break-all"
                >
                  {config.officialPostalUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CountryHeroIntelligence;
