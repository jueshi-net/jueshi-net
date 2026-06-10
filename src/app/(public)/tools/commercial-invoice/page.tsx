import CommercialInvoiceClient from "./commercial-invoice-client";

export default async function CommercialInvoicePage({ searchParams }: { searchParams: Promise<{ draftId?: string }> }) {
  const params = await searchParams;
  return <CommercialInvoiceClient draftId={params.draftId || null} />;
}
