'use client';

import { createContext, useContext, useState } from 'react';

interface IntlContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const IntlContext = createContext<IntlContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (key: string) => key
});

export function useIntl() {
  return useContext(IntlContext);
}

// Pre-loaded messages
const messagesMap: Record<string, any> = {};

// Register messages at build time
function registerMessages(locale: string, messages: any) {
  messagesMap[locale] = messages;
}

// Helper to get nested value
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export default function IntlProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [locale, setLocaleState] = useState('zh');

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
  };

  const t = (key: string): string => {
    const messages = messagesMap[locale];
    if (!messages) return key;
    return getNestedValue(messages, key);
  };

  return (
    <IntlContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </IntlContext.Provider>
  );
}
