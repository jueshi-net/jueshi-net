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
  title: "绝世百宝箱 - 海外华人的实用工具箱",
  description: "绝世百宝箱提供集运、物流、外贸单据、跨境电商、留学生活等实用工具，支持在线生成、保存草稿和工作台管理。",
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
