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
    { media: "(prefers-color-scheme: light)", color: "#0F3D5E" },
    { media: "(prefers-color-scheme: dark)", color: "#0A2E47" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jueshi.net"),
  title: "绝世百宝箱 - 海外华人的实用工具箱",
  description: "绝世百宝箱提供集运、物流、外贸单据、跨境电商、留学生活等实用工具，支持在线生成、保存草稿和工作台管理。",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://jueshi.net",
    siteName: "绝世百宝箱",
    title: "绝世百宝箱 - 海外华人的实用工具箱",
    description: "全域出国基础设施平台，覆盖跨境电商、SOHO、留学生与数字游民。",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://jueshi.net"}/og/default-og.png`,
        width: 1200,
        height: 630,
        alt: "绝世百宝箱",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "绝世百宝箱 - 海外华人的实用工具箱",
    description: "全域出国基础设施平台，覆盖跨境电商、SOHO、留学生与数字游民。",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "https://jueshi.net"}/og/default-og.png`],
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
