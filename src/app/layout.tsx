import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CommandPalette from "@/components/command-palette";
import PWARegister from "@/components/PWARegister";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
    { media: "(prefers-color-scheme: dark)", color: "#1E40AF" },
  ],
};

export const metadata: Metadata = {
  title: "海外百宝箱 | 海外华人的常用工具与资源平台",
  description: "海外华人的常用工具与资源平台 - 导航、查询、工具、CMS",
  keywords: ["海外生活", "跨境寄送", "跨境经营", "海外工具", "邮编查询"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "喜熊",
  },
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
      <body className={cn(inter.className, "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased flex flex-col")}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CommandPalette />
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
