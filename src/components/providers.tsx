"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ThemeProvider } from "./theme-provider";
import IntlProvider from "./IntlProvider";

/**
 * Providers wraps the entire app.
 *
 * When `session` is passed from the server layout, SessionProvider uses it
 * as the initial state and does NOT fetch /api/auth/session on mount.
 * This eliminates aborted-fetch console errors during server-side redirects
 * (e.g. unauthenticated admin/workspace access).
 *
 * If `session` is undefined (legacy callers), SessionProvider falls back to
 * its default behaviour (client-side fetch).
 */
export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <IntlProvider>
          {children}
        </IntlProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
