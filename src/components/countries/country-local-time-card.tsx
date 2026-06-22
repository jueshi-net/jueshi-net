"use client";

/**
 * CountryLocalTimeCard
 *
 * Displays the current local time for a given IANA timezone, updating every
 * 30 seconds. Avoids hydration mismatches by rendering a placeholder until
 * the client mounts.
 */

import { useEffect, useState } from "react";

interface ExtraTimezone {
  tz: string;
  city: string;
}

interface CountryLocalTimeCardProps {
  timezone: string;
  referenceCity: string;
  extraTimezones?: ExtraTimezone[];
}

interface TimeDisplay {
  time: string; // HH:mm
  weekday: string; // 星期X
  date: string; // YYYY年M月D日
  tzName: string; // timezone long name
}

const WEEKDAYS = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];

function formatTime(timezone: string): TimeDisplay | null {
  try {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      weekday: "short",
    });
    const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const tzNameFormatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      timeZoneName: "long",
    });

    // weekday via Intl may give "周一" style; fall back to local weekday index
    // computed from the timezone-adjusted date to ensure Chinese full names.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(now);
    const weekdayPart = parts.find((p) => p.type === "weekday");
    const weekdayMap: Record<string, string> = {
      Sun: "星期日",
      Mon: "星期一",
      Tue: "星期二",
      Wed: "星期三",
      Thu: "星期四",
      Fri: "星期五",
      Sat: "星期六",
    };
    const weekday =
      (weekdayPart && weekdayMap[weekdayPart.value]) ||
      WEEKDAYS[now.getDay()] ||
      weekdayFormatter.format(now);

    // Extract the timezone long name from the last part of tzNameFormatter
    const tzParts = tzNameFormatter.formatToParts(now);
    const tzNamePart = tzParts.find((p) => p.type === "timeZoneName");
    const tzName = tzNamePart ? tzNamePart.value : timezone;

    return {
      time: timeFormatter.format(now),
      weekday,
      date: dateFormatter.format(now),
      tzName,
    };
  } catch {
    // Invalid timezone (RangeError from Intl.DateTimeFormat)
    return null;
  }
}

export function CountryLocalTimeCard({
  timezone,
  referenceCity,
  extraTimezones,
}: CountryLocalTimeCardProps) {
  // null = not yet mounted (placeholder), TimeDisplay | null = formatted result
  const [mounted, setMounted] = useState(false);
  const [mainDisplay, setMainDisplay] = useState<TimeDisplay | null>(null);
  const [mainValid, setMainValid] = useState(true);
  const [extraDisplays, setExtraDisplays] = useState<
    { display: TimeDisplay | null; valid: boolean }[]
  >([]);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      const main = formatTime(timezone);
      setMainDisplay(main);
      setMainValid(main !== null);

      if (extraTimezones && extraTimezones.length > 0) {
        setExtraDisplays(
          extraTimezones.map((et) => {
            const d = formatTime(et.tz);
            return { display: d, valid: d !== null };
          }),
        );
      }
    };

    update();
    const interval = setInterval(update, 30_000);

    return () => clearInterval(interval);
  }, [timezone, extraTimezones]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      {/* Reference city / main timezone */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-xs font-medium">
            {referenceCity}
          </span>
          <span className="text-white/50 text-[10px]">当地时间</span>
        </div>
        {!mounted ? (
          <div className="text-white text-3xl font-bold mt-1">加载中…</div>
        ) : !mainValid || !mainDisplay ? (
          <div className="text-white/60 text-sm mt-1">时区信息不可用</div>
        ) : (
          <>
            <div className="text-white text-3xl font-bold tabular-nums mt-1">
              {mainDisplay.time}
            </div>
            <div className="text-white/70 text-xs mt-1">
              {mainDisplay.weekday} · {mainDisplay.date}
            </div>
            <div className="text-white/50 text-[11px] mt-0.5">
              {mainDisplay.tzName}
            </div>
          </>
        )}
      </div>

      {/* Extra timezones */}
      {extraTimezones && extraTimezones.length > 0 && mounted && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          {extraTimezones.map((et, idx) => {
            const info = extraDisplays[idx];
            return (
              <div
                key={et.tz}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-white/70">{et.city}</span>
                {!info || !info.valid || !info.display ? (
                  <span className="text-white/40">—</span>
                ) : (
                  <span className="text-white/80 tabular-nums">
                    {info.display.time}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CountryLocalTimeCard;
