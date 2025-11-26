/**
 * Custom Hook: useCase1Retry
 * 
 * Case 1: Update to FAIL → RETRY
 */

import { useState } from 'react';
import { updateReportedStatToFail } from '../../services/api/updateReportedStatToFail.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase1Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase1 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE1] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Update to FAIL
      console.log('[CASE1] Step 1: Updating to FAIL...');
      const updateResult = await updateReportedStatToFail(contractId);
      console.log('[CASE1] Update result:', { rowsUpdated: updateResult.rowsUpdated });

      // Step 2: Retry contract
      console.log('[CASE1] Step 2: Retrying contract...');
      const retryResult = await retryEwContract(contractId);
      console.log('[CASE1] Retry result:', { success: retryResult.success });

      console.log('[CASE1] Complete:', { success: retryResult.success });
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
      console.error('[CASE1] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });

      return {
        success: false,
        retryAttempted: false,
        contractId,
        message: 'Error during Case 1 retry',
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase1, state, reset };
};

export default useCase1Retry;
