import { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import PointsClient from "./points-client";

export const metadata: Metadata = {
  title: buildTitle("积分与会员中心"),
  description: "查看积分获取方式、兑换选项和会员权益对比。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard/points") },
  openGraph: {
    title: buildTitle("积分与会员中心"),
    description: "查看积分获取方式、兑换选项和会员权益对比。",
    url: buildCanonical("/dashboard/points"),
  },
};

export default function PointsPage() {
  return <PointsClient />;
}
