import { Metadata } from "next";
import AdCreativesClient from "./ad-creatives-client";

export const metadata: Metadata = {
  title: "广告素材管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdCreativesPage() {
  return <AdCreativesClient />;
}
