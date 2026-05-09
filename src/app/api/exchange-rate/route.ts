import { NextResponse } from 'next/server';

const TARGET_CURRENCIES = ['CNY', 'USD', 'CAD', 'EUR', 'GBP', 'AUD', 'NZD', 'JPY', 'HKD'];
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

let cachedData: {
  rates: Record<string, number>;
  source: string;
  lastUpdate: string;
  cachedAt: number;
} | null = null;

async function fetchRates() {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY', {
    next: { revalidate: 1800 }, // Next.js cache for 30 min
  });

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}`);
  }

  const data = await response.json();

  // Extract only the target currencies
  const rates: Record<string, number> = {};
  for (const code of TARGET_CURRENCIES) {
    if (data.rates && data.rates[code] !== undefined) {
      rates[code] = data.rates[code];
    }
  }

  // Ensure CNY is always 1.0
  rates['CNY'] = 1.0;

  return {
    rates,
    source: 'ExchangeRate-API',
    lastUpdate: data.time_last_updated
      ? new Date(data.time_last_updated * 1000).toISOString()
      : new Date().toISOString(),
  };
}

export async function GET() {
  // Return cached data if still valid
  if (cachedData && Date.now() - cachedData.cachedAt < CACHE_DURATION_MS) {
    return NextResponse.json({
      success: true,
      rates: cachedData.rates,
      source: cachedData.source,
      lastUpdate: cachedData.lastUpdate,
      cachedAt: new Date(cachedData.cachedAt).toISOString(),
      cacheDurationMin: CACHE_DURATION_MS / 60000,
      fromCache: true,
    });
  }

  try {
    const fresh = await fetchRates();
    cachedData = {
      ...fresh,
      cachedAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      rates: cachedData.rates,
      source: cachedData.source,
      lastUpdate: cachedData.lastUpdate,
      cachedAt: new Date(cachedData.cachedAt).toISOString(),
      cacheDurationMin: CACHE_DURATION_MS / 60000,
      fromCache: false,
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);

    // Return stale cache if available
    if (cachedData) {
      return NextResponse.json({
        success: true,
        rates: cachedData.rates,
        source: cachedData.source,
        lastUpdate: cachedData.lastUpdate,
        cachedAt: new Date(cachedData.cachedAt).toISOString(),
        cacheDurationMin: CACHE_DURATION_MS / 60000,
        fromCache: true,
        stale: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: '无法获取汇率数据，请稍后重试',
      },
      { status: 503 }
    );
  }
}
