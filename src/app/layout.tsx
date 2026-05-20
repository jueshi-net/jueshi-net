import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import Header from "@/components/layout/header";
import CommandPalette, { CommandMenuProvider } from "@/components/command-palette";
import PWARegister from "@/components/PWARegister";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, defaultOpenGraph } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0F766E" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME}｜海外华人、留学生、出海商家的工具与资源平台`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: ["海外华人", "跨境物流", "邮编查询", "单据生成", "AI工具", "海外资源", "留学生", "出海商家"],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...defaultOpenGraph,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased flex flex-col overflow-x-hidden")}>
        <Providers>
          <CommandMenuProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <CommandPalette />
          </CommandMenuProvider>
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
