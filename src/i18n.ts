// i18n configuration
export const locales = ['en', 'zh', 'ja', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'zh' as const;

// Get locale from request headers or cookie
export function getLocale(request?: Request): Locale {
  if (!request) return defaultLocale;
  
  // Check cookie first
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/NEXT_LOCALE=([^;]+)/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  
  // Check Accept-Language header
  const acceptLang = request.headers.get('accept-language') || '';
  const browserLocale = acceptLang.split(',')[0]?.split('-')[0];
  if (browserLocale && locales.includes(browserLocale as Locale)) {
    return browserLocale as Locale;
  }
  
  return defaultLocale;
}

// Load messages for a locale
export async function loadMessages(locale: Locale) {
  try {
    const mod = await import(`@/messages/${locale}.json`);
    return mod.default;
  } catch {
    const mod = await import('@/messages/zh.json');
    return mod.default;
  }
}
