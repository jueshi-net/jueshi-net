import { Metadata } from "next";
import LandingPagesClient from "./landing-pages-client";

export const metadata: Metadata = {
  title: "落地页管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminLandingPagesPage() {
  return <LandingPagesClient />;
}
