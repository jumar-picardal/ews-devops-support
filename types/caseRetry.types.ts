/**
 * Shared types for retry case hooks
 * Used by all useCase#Retry hooks
 */

export interface CaseRetryResult {
  success: boolean;
  contractId: string;
  message: string;
  retryAttempted: boolean;
  details?: string;
}

export interface CaseRetryState {
  isProcessing: boolean;
  error: string | null;
}
