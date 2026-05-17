import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: buildTitle("我的工作台"),
  description: "海外百宝箱个人工作台：管理常用网址、积分、签到和 AI 工具使用记录。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard") },
  openGraph: {
    title: buildTitle("我的工作台"),
    description: "海外百宝箱个人工作台：管理常用网址、积分、签到和 AI 工具使用记录。",
    url: buildCanonical("/dashboard"),
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
