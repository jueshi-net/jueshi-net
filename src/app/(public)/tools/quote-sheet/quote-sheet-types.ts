/**
 * Quote Sheet Types & Engine Configuration
 *
 * Defines the data structure and serialization logic for the Quote Sheet tool.
 * Used by useDocumentToolEngine to manage state and API interaction.
 */

import { CompanyProfile } from "@/components/document-tools/company-profile-picker";

/** A single line item in the quote */
export interface QuoteSheetLine {
  id: string;
  description: string;
  weight: string;
  qty: number;
  pricePerUnit: number;
  channel: string;
  notes: string;
}

/** Full form data structure */
export interface QuoteSheetData {
  companyName: string;
  companyContact: string;
  companyEmail: string;
  clientName: string;
  clientContact: string;
  quoteDate: string;
  validUntil: string;
  lines: QuoteSheetLine[];
}

/** Default initial state */
export const defaultQuoteSheetData: QuoteSheetData = {
  companyName: "",
  companyContact: "",
  companyEmail: "",
  clientName: "",
  clientContact: "",
  quoteDate: new Date().toISOString().split("T")[0],
  validUntil: "",
  lines: [{ id: "1", description: "", weight: "", qty: 1, pricePerUnit: 0, channel: "", notes: "" }],
};

/**
 * Serialize form data to API payload format.
 * Recalculate totals to ensure accuracy on save.
 */
export function serialize(data: QuoteSheetData): Record<string, unknown> {
  return {
    companyName: data.companyName,
    companyContact: data.companyContact,
    companyEmail: data.companyEmail,
    clientName: data.clientName,
    clientContact: data.clientContact,
    quoteDate: data.quoteDate,
    validUntil: data.validUntil,
    lines: data.lines,
  };
}

/**
 * Deserialize API response to form state.
 * Handles missing fields gracefully for backward compatibility with old drafts.
 *
 * Old draft fields supported:
 * - companyName, companyContact, companyEmail
 * - clientName, clientContact
 * - quoteDate, validUntil
 * - lines (with description, weight, qty, pricePerUnit, channel, notes)
 */
export function deserialize(json: Record<string, unknown>): Partial<QuoteSheetData> {
  const rawLines = json.lines as QuoteSheetLine[] | undefined;
  const lines: QuoteSheetLine[] = (rawLines && rawLines.length > 0)
    ? rawLines.map((l) => ({
        id: l.id || `${Date.now()}`,
        description: (l.description as string) || "",
        weight: (l.weight as string) || "",
        qty: (l.qty as number) || 1,
        pricePerUnit: (l.pricePerUnit as number) || 0,
        channel: (l.channel as string) || "",
        notes: (l.notes as string) || "",
      }))
    : [{ id: "1", description: "", weight: "", qty: 1, pricePerUnit: 0, channel: "", notes: "" }];

  return {
    companyName: (json.companyName as string) || "",
    companyContact: (json.companyContact as string) || "",
    companyEmail: (json.companyEmail as string) || "",
    clientName: (json.clientName as string) || "",
    clientContact: (json.clientContact as string) || "",
    quoteDate: (json.quoteDate as string) || new Date().toISOString().split("T")[0],
    validUntil: (json.validUntil as string) || "",
    lines,
  };
}

/**
 * Map Company Profile to Quote Sheet fields.
 * Preserves existing user input if profile field is empty.
 */
export function mapCompanyProfile(profile: CompanyProfile | null, currentData: QuoteSheetData): QuoteSheetData {
  if (!profile) return currentData;

  return {
    ...currentData,
    ...(profile.companyName && { companyName: profile.companyName, clientName: currentData.clientName || profile.companyName }),
    ...(profile.contactName && { companyContact: profile.contactName }),
    ...(profile.email && { companyEmail: profile.email }),
  };
}

/** Calculate total from lines */
export function calculateTotals(lines: QuoteSheetLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty * l.pricePerUnit, 0);
}
