/**
 * Debit Note Types & Engine Configuration
 * 
 * Defines the data structure and serialization logic for the Debit Note tool.
 */

import { CompanyProfile } from '@/components/document-tools/company-profile-picker';

/** Data structure for Debit Note form */
export interface DebitItem {
  id: string;
  description: string;
  amount: number;
}

export interface DebitNoteData {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  noteNo: string;
  date: string;
  customerName: string;
  currency: string;
  items: DebitItem[];
  notes: string;
  paymentInfo: string;
  subtotal: number;
}

/** Default initial state */
export const defaultDebitNoteData: DebitNoteData = {
  companyName: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  noteNo: `DN${Date.now().toString().slice(-6)}`,
  date: new Date().toISOString().split('T')[0],
  customerName: '',
  currency: 'USD',
  items: [{ id: '1', description: '', amount: 0 }],
  notes: '',
  paymentInfo: '',
  subtotal: 0,
};

/**
 * Serialize form data to API payload format.
 */
export function serialize(data: DebitNoteData): Record<string, unknown> {
  // Recalculate subtotal to ensure accuracy on save
  const subtotal = data.items.reduce((s, i) => s + i.amount, 0);
  return {
    ...data,
    subtotal,
  };
}

/**
 * Deserialize API response to form state.
 */
export function deserialize(json: Record<string, unknown>): Partial<DebitNoteData> {
  const items = (json.items as DebitItem[]) || [{ id: '1', description: '', amount: 0 }];
  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  return {
    companyName: json.companyName as string || '',
    companyPhone: json.companyPhone as string || '',
    companyEmail: json.companyEmail as string || '',
    companyAddress: json.companyAddress as string || '',
    noteNo: json.noteNo as string || `DN${Date.now().toString().slice(-6)}`,
    date: json.date as string || new Date().toISOString().split('T')[0],
    customerName: json.customerName as string || '',
    currency: json.currency as string || 'USD',
    items: items,
    notes: json.notes as string || '',
    paymentInfo: json.paymentInfo as string || '',
    subtotal: subtotal,
  };
}

/**
 * Map Company Profile to Debit Note fields.
 */
export function mapCompanyProfile(profile: CompanyProfile | null, currentData: DebitNoteData): DebitNoteData {
  if (!profile) return currentData;

  let newPaymentInfo = currentData.paymentInfo;
  
  // Logic from original component: map bank info based on currency
  if (profile.bankUsdInfo) newPaymentInfo = profile.bankUsdInfo;
  if (profile.bankCnyInfo && currentData.currency === 'CNY') newPaymentInfo = profile.bankCnyInfo;

  return {
    ...currentData,
    ...(profile.companyName && { companyName: profile.companyName }),
    ...(profile.phone && { companyPhone: profile.phone }),
    ...(profile.email && { companyEmail: profile.email }),
    ...(profile.address && { companyAddress: profile.address }),
    paymentInfo: newPaymentInfo,
  };
}
