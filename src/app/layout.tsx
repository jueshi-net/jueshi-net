import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import CommandPalette, { CommandMenuProvider } from "@/components/command-palette";
import PWARegister from "@/components/PWARegister";
import CookieConsent from "@/components/common/cookie-consent";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0F766E" },
  ],
};

export const metadata: Metadata = {
  title: "海外百宝箱 — 工具 · AI · 资源",
  description: "全域出国基础设施平台，覆盖跨境电商、SOHO、留学生、数字游民与海外华人。",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-[#f8fafc] antialiased")}>
        <Providers>
          <CommandMenuProvider>
            {children}
            <CommandPalette />
          </CommandMenuProvider>
          <PWARegister />
          <CookieConsent />
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </Providers>
      </body>
    </html>
  );
}
