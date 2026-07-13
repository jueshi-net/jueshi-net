import type { Metadata } from "next";
import JueshiV4Shell from "@/components/ui-lab/jueshi-v4/JueshiV4Shell";

export const metadata: Metadata = {
  title: "绝世百宝箱 UI V4 预览 - 浅色 SaaS 工具平台",
  description: "绝世百宝箱 UI V4 设计预览，现代浅色 SaaS 工具平台风格，适合海外华人实用工具站",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JueshiV4PreviewPage() {
  return <JueshiV4Shell />;
}
