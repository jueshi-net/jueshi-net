import { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: buildTitle("登录"),
  description: "登录海外百宝箱，使用工作台、收藏、积分会员和 AI 工具额度。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/login") },
  openGraph: {
    title: buildTitle("登录"),
    description: "登录海外百宝箱，使用工作台、收藏、积分会员和 AI 工具额度。",
    url: buildCanonical("/login"),
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
