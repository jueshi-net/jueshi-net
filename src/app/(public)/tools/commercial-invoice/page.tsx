import CommercialInvoiceClient from "./commercial-invoice-client";
import { PublicLandingPageFrame } from "@/components/templates/public/PublicLandingPageFrame";

export default async function CommercialInvoicePage({ searchParams }: { searchParams: Promise<{ draftId?: string }> }) {
  const params = await searchParams;
  return (
    <PublicLandingPageFrame
      title="外贸发票生成器"
      subtitle="快速生成商业发票，支持PDF导出与打印"
    >
      <CommercialInvoiceClient draftId={params.draftId || null} />
    </PublicLandingPageFrame>
  );
}
