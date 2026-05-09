import { NextResponse } from 'next/server';

const TARGET_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'NZD', 'JPY', 'HKD'];
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Node.js 进程内缓存（单实例有效）
let cache: {
  rates: Record<string, number>;
  base: string;
  date: string;
  updatedAt: string;
  cachedAt: number;
} | null = null;

/**
 * 调用 ExchangeRate-API v4 免费端点获取汇率。
 * 注意：v4 端点返回 { result: "success", ... } 格式。
 * 生产环境如需更稳定数据，可升级到 v6 端点：
 *   https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/CNY
 *   v6 需要 API Key，注册见 https://www.exchangerate-api.com/
 */
async function fetchFromProvider() {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY', {
    next: { revalidate: 1800 }, // Next.js 数据缓存 30 分钟
  });

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}`);
  }

  const data = await response.json();

  // 仅提取本站需要的 8 种目标货币 + CNY
  const rates: Record<string, number> = { CNY: 1.0 };
  for (const code of TARGET_CURRENCIES) {
    if (data.rates && typeof data.rates[code] === 'number') {
      rates[code] = data.rates[code];
    }
  }

  // v4 返回 time_last_updated (Unix 秒)
  const apiDate = data.time_last_updated
    ? new Date(data.time_last_updated * 1000).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return {
    rates,
    base: 'CNY',
    date: apiDate,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const now = Date.now();
  const isFresh = cache && (now - cache.cachedAt < CACHE_DURATION_MS);

  // 缓存有效，直接返回
  if (isFresh) {
    return NextResponse.json({
      source: 'ExchangeRate-API v4',
      base: cache!.base,
      date: cache!.date,
      updatedAt: cache!.updatedAt,
      rates: cache!.rates,
      isStale: false,
    });
  }

  // 尝试获取新数据
  try {
    const fresh = await fetchFromProvider();
    cache = { ...fresh, cachedAt: now };

    return NextResponse.json({
      source: 'ExchangeRate-API v4',
      base: fresh.base,
      date: fresh.date,
      updatedAt: fresh.updatedAt,
      rates: fresh.rates,
      isStale: false,
    });
  } catch (error) {
    console.error('[exchange-rate] Fetch error:', error);

    // 有新缓存但已过期，返回过时数据并标记 stale
    if (cache) {
      return NextResponse.json({
        source: 'ExchangeRate-API v4',
        base: cache.base,
        date: cache.date,
        updatedAt: cache.updatedAt,
        rates: cache.rates,
        isStale: true,
      });
    }

    // 无任何可用数据
    return NextResponse.json(
      { error: '无法获取汇率数据，请稍后重试' },
      { status: 503 }
    );
  }
}
