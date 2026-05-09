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
  sourceLabel: string;
} | null = null;

/**
 * 调用 ExchangeRate-API 获取汇率。
 * 优先级：
 * 1. v6 端点（需 EXCHANGE_RATE_API_KEY 环境变量）— 更稳定、更高 QPS
 * 2. v4 免费端点（无需 API Key）— 开发和轻量使用
 *
 * v6 升级路径：
 * - 注册地址: https://www.exchangerate-api.com/
 * - 设置环境变量: EXCHANGE_RATE_API_KEY=your_key_here
 */
async function fetchFromProvider() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/CNY`
    : 'https://api.exchangerate-api.com/v4/latest/CNY';

  const response = await fetch(url, {
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

  // v4 返回 time_last_updated (Unix 秒), v6 返回 time_last_update_utc (ISO string)
  let apiDate: string;
  if (data.time_last_updated) {
    apiDate = new Date(data.time_last_updated * 1000).toISOString().split('T')[0];
  } else if (data.time_last_update_utc) {
    apiDate = new Date(data.time_last_update_utc).toISOString().split('T')[0];
  } else {
    apiDate = new Date().toISOString().split('T')[0];
  }

  const sourceLabel = apiKey ? 'ExchangeRate-API v6' : 'ExchangeRate-API v4';

  return {
    rates,
    base: 'CNY',
    date: apiDate,
    updatedAt: new Date().toISOString(),
    sourceLabel,
  };
}

export async function GET() {
  const now = Date.now();
  const isFresh = cache && (now - cache.cachedAt < CACHE_DURATION_MS);

  // 缓存有效，直接返回
  if (isFresh) {
    return NextResponse.json({
      source: cache!.sourceLabel,
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
      source: fresh.sourceLabel,
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
        source: cache.sourceLabel,
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
