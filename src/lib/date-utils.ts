// Timezone-aware date utilities for daily operations.
// All "today" references use America/Vancouver (Pacific Time).
// This ensures consistency across check-ins, daily caps, and point ledgers.
// See: docs/member-points-timezone.md

const TZ = "America/Vancouver";

/**
 * Returns a date key string for "today" in the configured timezone.
 * Format: YYYY-MM-DD (e.g. "2026-05-15")
 * Used for DailyCheckIn.dateKey and all daily identity operations.
 */
export function getTodayDateKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Returns a date key for a specific date offset from today.
 * offset: 0 = today, -1 = yesterday, +1 = tomorrow
 */
export function getDateKey(offset: number): string {
  const d = new Date();
  // Get the current date in TZ, then apply offset
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const year = parseInt(parts.find(p => p.type === "year")!.value);
  const month = parseInt(parts.find(p => p.type === "month")!.value);
  const day = parseInt(parts.find(p => p.type === "day")!.value);

  const target = new Date(Date.UTC(year, month - 1, day + offset));
  return target.toISOString().slice(0, 10);
}

/**
 * Returns [start, end) Date range for "today" in the configured timezone.
 * Used for PointLedger daily aggregation queries.
 */
export function getTodayRange(): { start: Date; end: Date } {
  // Parse today's date in TZ and convert to UTC for DB queries
  const dateKey = getTodayDateKey(); // YYYY-MM-DD
  const start = new Date(`${dateKey}T00:00:00.000${getTZOffsetString(TZ)}`);
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { start, end: tomorrow };
}

/**
 * Returns [start, end) Date range for a specific dateKey.
 */
export function getDateRange(dateKey: string): { start: Date; end: Date } {
  const start = new Date(`${dateKey}T00:00:00.000${getTZOffsetString(TZ)}`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/**
 * Get the UTC offset string for a given timezone at the current moment.
 * e.g. "-08:00" for PST, "-07:00" for PDT
 */
function getTZOffsetString(timeZone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find(p => p.type === "timeZoneName");
  if (!offsetPart) return "+00:00";

  // Parse the offset string like "GMT-7" or "GMT-8"
  const match = offsetPart.value.match(/GMT([+-]?\d+)/);
  if (!match) return "+00:00";

  const hours = parseInt(match[1]);
  const sign = hours < 0 ? "-" : "+";
  const absHours = Math.abs(hours);
  return `${sign}${absHours.toString().padStart(2, "0")}:00`;
}

/**
 * Returns [start, end) Date range for the current week (Sunday-Saturday) in the configured timezone.
 */
export function getVancouverWeekRange(): { start: Date; end: Date } {
  const today = getTodayVancouverDate();
  const dayOfWeek = today.getDay(); // 0=Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start: utcDate(start), end: utcDate(end) };
}

/**
 * Returns [start, end) Date range for the current month in the configured timezone.
 */
export function getVancouverMonthRange(): { start: Date; end: Date } {
  const today = getTodayVancouverDate();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return { start: utcDate(start), end: utcDate(end) };
}

/**
 * Alias for getTodayRange (backward compatible).
 */
export function getVancouverDateRange(): { start: Date; end: Date } {
  return getTodayRange();
}

/**
 * Get today's date as a Date object in Vancouver timezone (midnight local).
 */
function getTodayVancouverDate(): Date {
  const dateKey = getTodayDateKey(); // YYYY-MM-DD
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Convert a local date to a UTC Date for DB comparison.
 */
function utcDate(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
