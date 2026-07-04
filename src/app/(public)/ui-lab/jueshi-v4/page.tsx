import type { Metadata } from "next";
import JueshiV4Shell from "@/components/ui-lab/jueshi-v4/JueshiV4Shell";

export const metadata: Metadata = {
  title: "绝世百宝箱 UI V4 预览 - 红色赛博小螃蟹",
  description: "绝世百宝箱 UI V4 设计预览，参考 Unity Gaming Platform 布局，使用红色赛博小螃蟹品牌元素",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JueshiV4PreviewPage() {
  return <JueshiV4Shell />;
}
