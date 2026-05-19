import { Metadata } from "next";
import ShippingLabelClient from "./shipping-label-client";

export const metadata: Metadata = {
  title: "唛头标签打印 — Shipping Label | 海外百宝箱",
  description: "在线生成唛头/物流标签，支持纸张尺寸、公司名、单号、渠道、品名、打印数量、分页打印。",
};

export default async function ShippingLabelPage({ searchParams }: { searchParams: Promise<{ draftId?: string }> }) {
  const params = await searchParams;
  return <ShippingLabelClient draftId={params.draftId || null} />;
}
