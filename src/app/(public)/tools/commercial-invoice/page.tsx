import { Metadata } from "next";
import CommercialInvoiceClient from "./commercial-invoice-client";

export const metadata: Metadata = {
  title: "外贸发票生成器 — Commercial Invoice | 海外百宝箱",
  description: "在线生成外贸商业发票，支持公司信息、客户信息、商品项目、税费、运费，可打印/PDF 导出。",
};

export default async function CommercialInvoicePage({ searchParams }: { searchParams: Promise<{ draftId?: string }> }) {
  const params = await searchParams;
  return <CommercialInvoiceClient draftId={params.draftId || null} />;
}
