"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function JueshiV4PublicShell({ children }: Props) {
  const pathname = usePathname();
  
  // 不在这些路径上显示公共头部和底部
  const hidePublicLayout = pathname.startsWith("/workspace") || 
                          pathname.startsWith("/admin") ||
                          pathname.includes("/login") ||
                          pathname.includes("/signup");

  if (hidePublicLayout) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
