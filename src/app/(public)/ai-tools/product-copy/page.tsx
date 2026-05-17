import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import ProductCopyClient from "./product-copy-client";

export const metadata: Metadata = {
  title: buildTitle("AI 商品文案生成器"),
  description: "为跨境电商和出海商家生成商品标题、五点描述、短视频脚本和 SEO 关键词，适合 Amazon、Shopify、独立站等场景。",
  alternates: { canonical: buildCanonical("/ai-tools/product-copy") },
  openGraph: {
    title: buildTitle("AI 商品文案生成器"),
    description: "为跨境电商和出海商家生成商品标题、五点描述、短视频脚本和 SEO 关键词，适合 Amazon、Shopify、独立站等场景。",
    url: buildCanonical("/ai-tools/product-copy"),
  },
};

export default function ProductCopyPage() {
  return <ProductCopyClient />;
}
