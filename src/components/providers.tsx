"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import IntlProvider from "./IntlProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <IntlProvider>
          {children}
        </IntlProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
