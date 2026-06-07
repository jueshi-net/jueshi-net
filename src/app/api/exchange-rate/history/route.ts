import { NextRequest, NextResponse } from "next/server";

// 内存缓存: key = "base-target-days", value = { data, cachedAt }
const cache = new Map<string, { data: any; cachedAt: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "CNY";
  const to = searchParams.get("to") || "CAD";
  const days = parseInt(searchParams.get("days") || "30", 10);

  const cacheKey = `${from.toLowerCase()}-${to.toLowerCase()}-${days}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.cachedAt < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // 计算起止日期
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  try {
    const url = `https://api.frankfurter.app/${startStr}..${endStr}?from=${from.toUpperCase()}&to=${to.toUpperCase()}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Frankfurter API returned ${res.status}`);
    }

    const json = await res.json();

    // 精简返回字段
    const points: { date: string; rate: number }[] = [];
    if (json.rates) {
      for (const [date, rates] of Object.entries(json.rates) as [string, Record<string, number>][]) {
        if (rates && rates[to.toUpperCase()] !== undefined) {
          points.push({ date, rate: Number(rates[to.toUpperCase()].toFixed(4)) });
        }
      }
    }

    const responseData = {
      source: "Frankfurter",
      base: from.toUpperCase(),
      target: to.toUpperCase(),
      days,
      updatedAt: json.end_date || endStr,
      points,
      isStale: false,
    };

    cache.set(cacheKey, { data: responseData, cachedAt: now });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Exchange History Proxy]", error);
    // 失败时返回空数据，不报错
    const fallbackData = {
      source: "Frankfurter",
      base: from.toUpperCase(),
      target: to.toUpperCase(),
      days,
      updatedAt: new Date().toISOString().split("T")[0],
      points: [],
      isStale: true,
    };
    return NextResponse.json(fallbackData);
  }
}
