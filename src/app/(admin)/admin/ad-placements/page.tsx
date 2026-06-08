import { Metadata } from "next";
import AdPlacementsClient from "./ad-placements-client";

export const metadata: Metadata = {
  title: "广告位管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdPlacementsPage() {
  return <AdPlacementsClient />;
}
