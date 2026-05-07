'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';

const locales = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('zh');

  const switchLang = (code: string) => {
    setCurrent(code);
    setOpen(false);
    // Store preference
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
    // Reload to apply
    window.location.reload();
  };

  const currentLocale = locales.find(l => l.code === current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">{currentLocale?.flag} {currentLocale?.name}</span>
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => switchLang(locale.code)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{locale.flag}</span>
                  <span>{locale.name}</span>
                </span>
                {current === locale.code && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
