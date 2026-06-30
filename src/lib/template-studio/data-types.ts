/** Additional data types for template rendering */

export interface CompanyProfile {
  id: string;
  name: string;
  nameEn?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string;
  isDefault?: boolean;
}

export interface ProductItem {
  id?: string;
  name: string;
  nameEn?: string;
  hsCode?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  weight?: number;
  volume?: number;
  currency?: string;
  origin?: string;
}

export interface DocumentData {
  number?: string;
  date?: string;
  dueDate?: string;
  type?: string;
  currency?: string;
}
