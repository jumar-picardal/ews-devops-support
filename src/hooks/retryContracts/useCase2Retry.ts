/**
 * Custom Hook: useCase2Retry
 * 
 * Case 2: Update to SUCCESS → RETRY
 */

import { useState } from 'react';
import { updateReportedStatToSuccess } from '../../services/api/updateReportedStatToSuccess.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase2Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase2 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE2] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Update to SUCCESS (continue even if it fails)
      console.log('[CASE2] Step 1: Updating to SUCCESS...');
      try {
        const updateResult = await updateReportedStatToSuccess(contractId);
        console.log('[CASE2] Update result:', { rowsUpdated: updateResult.rowsUpdated });
      } catch (updateError) {
        console.warn('[CASE2] Update to SUCCESS failed, continuing to retry:', updateError);
      }

      // Step 2: Retry contract (always execute)
      console.log('[CASE2] Step 2: Retrying contract...');
      const retryResult = await retryEwContract(contractId);
      console.log('[CASE2] Retry result:', { success: retryResult.success });

      console.log('[CASE2] Complete:', { success: retryResult.success });
      setState({ isProcessing: false, error: null });

      return {
        success: retryResult.success,
        retryAttempted: true,
        contractId,
        message: retryResult.success ? 'Retry completed' : 'Retry failed',
        details: retryResult.details
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CASE2] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });

      return {
        success: false,
        retryAttempted: false,
        contractId,
        message: 'Error during Case 2 retry',
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase2, state, reset };
};

export default useCase2Retry;
