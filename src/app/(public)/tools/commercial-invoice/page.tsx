import CommercialInvoiceClient from "./commercial-invoice-client";
import ToolWorkspaceShell from "@/components/tools/ToolWorkspaceShell";

export default async function CommercialInvoicePage({ searchParams }: { searchParams: Promise<{ draftId?: string }> }) {
  const params = await searchParams;
  return (
    <ToolWorkspaceShell
      title="外贸发票生成器"
      subtitle="快速生成商业发票，支持PDF导出与打印"
    >
      <CommercialInvoiceClient draftId={params.draftId || null} />
    </ToolWorkspaceShell>
  );
}
