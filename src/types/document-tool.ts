/**
 * Document Tool Engine Types
 * 
 * Defines the contract for the Document Tool Engine used by 6 standard document tools.
 * Excludes AI tools like video-script-sop which have different lifecycles.
 */

/** Valid tool keys for standard document tools */
export type DocumentToolKey = 
  | 'commercial-invoice' 
  | 'shipping-label' 
  | 'quote-sheet' 
  | 'inbound-receipt' 
  | 'handover-note' 
  | 'debit-note';

/** Serialization function type: converts UI state to JSON-compatible payload */
export type DocumentToolSerializeFn<T> = (data: T) => Record<string, unknown>;

/** Deserialization function type: converts API JSON payload back to UI state */
export type DocumentToolDeserializeFn<T> = (data: Record<string, unknown>) => Partial<T>;

/** Validation function type: checks if form data is ready for submission */
export interface DocumentToolValidationResult {
  valid: boolean;
  error?: string;
}

export type DocumentToolValidateFn<T> = (data: T) => DocumentToolValidationResult;

/** Options passed to useDocumentToolEngine hook */
export interface DocumentToolEngineOptions<T> {
  /** Unique identifier for the tool type (e.g., 'commercial_invoice') */
  toolKey: DocumentToolKey;
  
  /** Initial state for the form data */
  defaultData: T;
  
  /** Function to serialize state for API payload */
  serialize: DocumentToolSerializeFn<T>;
  
  /** Function to deserialize API response to state */
  deserialize: DocumentToolDeserializeFn<T>;
  
  /** Optional validation before save */
  validate?: DocumentToolValidateFn<T>;
  
  /** Callback after successful save */
  onAfterSave?: (docId: string) => void;
  
  /** Callback after restoring draft */
  onAfterRestore?: () => void;
}

/** Return type of useDocumentToolEngine hook */
export interface DocumentToolEngineResult<T> {
  /** Current form data state */
  data: T;
  
  /** Setter for form data */
  setData: React.Dispatch<React.SetStateAction<T>>;
  
  /** Loading state from useDraftLoader */
  loadingDraft: boolean;
  
  /** Error state from useDraftLoader or validation */
  error: string | null;
  
  /** Setter for error state */
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  
  /** Save loading state */
  saving: boolean;
  
  /** Save success state */
  saved: boolean;
  
  /** Success message */
  saveMsg: string | null;
  
  /** Current document ID (null if new draft) */
  currentDocId: string | null;
  
  /** Save current draft */
  handleSave: () => Promise<void>;
  
  /** Restore data from history panel */
  handleRestore: (dataJson: string) => void;
  
  /** Reset form to default state */
  handleReset: () => void;
  
  /** Helper for print window */
  openPrintWindow: (title: string, contentHtml: string, styles: string) => void;
}

/** Options for print window helper */
export interface DocumentToolPrintOptions {
  /** Window title */
  title: string;
  /** HTML content to print */
  contentHtml: string;
  /** CSS styles to inject */
  styles: string;
}
