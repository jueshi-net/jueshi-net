/**
 * Handover Note Types & Engine Configuration
 * 
 * Defines the data structure and serialization logic for the Handover Note tool.
 * Used by useDocumentToolEngine to manage state and API interaction.
 */

import { CompanyProfile } from '@/components/document-tools/company-profile-picker';

/** Data structure for Handover Note form */
export interface HandoverNoteData {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  handoverNo: string;
  date: string;
  fromParty: string;
  toParty: string;
  contact: string;
  packages: number;
  cargoDescription: string;
  notes: string;
}

/** Default initial state */
export const defaultHandoverNoteData: HandoverNoteData = {
  companyName: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  handoverNo: `HN${Date.now().toString().slice(-6)}`,
  date: new Date().toISOString().split('T')[0],
  fromParty: '',
  toParty: '',
  contact: '',
  packages: 1,
  cargoDescription: '',
  notes: '',
};

/**
 * Serialize form data to API payload format.
 * Matches the structure expected by /api/me/tool-documents.
 */
export function serialize(data: HandoverNoteData): Record<string, unknown> {
  return {
    companyName: data.companyName,
    companyPhone: data.companyPhone,
    companyEmail: data.companyEmail,
    companyAddress: data.companyAddress,
    handoverNo: data.handoverNo,
    date: data.date,
    fromParty: data.fromParty,
    toParty: data.toParty,
    contact: data.contact,
    packages: data.packages,
    cargoDescription: data.cargoDescription,
    notes: data.notes,
  };
}

/**
 * Deserialize API response to form state.
 * Handles missing fields gracefully to ensure backward compatibility with old drafts.
 */
export function deserialize(json: Record<string, unknown>): Partial<HandoverNoteData> {
  return {
    companyName: json.companyName as string || '',
    companyPhone: json.companyPhone as string || '',
    companyEmail: json.companyEmail as string || '',
    companyAddress: json.companyAddress as string || '',
    handoverNo: json.handoverNo as string || `HN${Date.now().toString().slice(-6)}`,
    date: json.date as string || new Date().toISOString().split('T')[0],
    fromParty: json.fromParty as string || '',
    toParty: json.toParty as string || '',
    contact: json.contact as string || '',
    packages: json.packages as number || 1,
    cargoDescription: json.cargoDescription as string || '',
    notes: json.notes as string || '',
  };
}

/**
 * Map Company Profile to Handover Note fields.
 * Preserves existing user input if profile field is empty.
 */
export function mapCompanyProfile(profile: CompanyProfile | null, currentData: HandoverNoteData): HandoverNoteData {
  if (!profile) return currentData;

  return {
    ...currentData,
    // Only overwrite if profile has data
    ...(profile.companyName && { companyName: profile.companyName, fromParty: profile.companyName }),
    ...(profile.phone && { companyPhone: profile.phone }),
    ...(profile.email && { companyEmail: profile.email }),
    ...(profile.address && { companyAddress: profile.address }),
  };
}
