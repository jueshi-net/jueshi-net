/**
 * Address → Shipping Calculator Transfer
 * Lightweight data transfer for destination reference
 * Does NOT override Container → Shipping transfer
 */

export interface AddressToShippingPayload {
  country: string;
  province: string;
  city: string;
  postalCode: string;
  addressSummary: string;
}

export interface AddressToShippingData {
  source: 'address-formatter';
  version: 1;
  createdAt: string;
  expiresAt: string;
  consumed: boolean;
  payload: AddressToShippingPayload;
}

const STORAGE_KEY = 'jueshi.addressToShipping.v1';
const EXPIRE_MINUTES = 30;

/**
 * Save address data for Shipping Calculator
 */
export function saveAddressToShipping(payload: AddressToShippingPayload): boolean {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXPIRE_MINUTES * 60 * 1000);
    
    const data: AddressToShippingData = {
      source: 'address-formatter',
      version: 1,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      consumed: false,
      payload,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save address to shipping data:', error);
    return false;
  }
}

/**
 * Load address data from localStorage
 * Returns null if expired or consumed
 */
export function loadAddressFromShipping(): AddressToShippingData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const data: AddressToShippingData = JSON.parse(raw);
    
    // Check version
    if (data.version !== 1) {
      clearAddressFromShipping();
      return null;
    }
    
    // Check if consumed
    if (data.consumed) {
      clearAddressFromShipping();
      return null;
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);
    if (now >= expiresAt) {
      clearAddressFromShipping();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load address from shipping data:', error);
    clearAddressFromShipping();
    return null;
  }
}

/**
 * Mark address data as consumed
 */
export function markAddressFromShippingConsumed(): void {
  try {
    const data = loadAddressFromShipping();
    if (data) {
      data.consumed = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to mark address from shipping data as consumed:', error);
  }
}

/**
 * Clear address transfer data
 */
export function clearAddressFromShipping(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear address from shipping data:', error);
  }
}

/**
 * Check if valid address transfer data exists
 */
export function hasValidAddressFromShipping(): boolean {
  return loadAddressFromShipping() !== null;
}
