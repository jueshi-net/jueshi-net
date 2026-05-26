import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: buildTitle("会员与权益"),
  description: "高级会员权益、配额管理与特权解锁 — 海外百宝箱个人工作台。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard") },
  openGraph: {
    title: buildTitle("会员与权益"),
    description: "高级会员权益、配额管理与特权解锁 — 海外百宝箱个人工作台。",
    url: buildCanonical("/dashboard"),
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
