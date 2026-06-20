import { Metadata } from "next";
import AdEntitlementsClient from "./ad-entitlements-client";

export const metadata: Metadata = {
  title: "广告权益审核 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdEntitlementsPage() {
  return <AdEntitlementsClient />;
}
