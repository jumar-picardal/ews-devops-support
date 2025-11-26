/**
 * Custom Hook: useCase3Retry
 * 
 * Case 3: CLOSED_UNREGISTER → Check statuses → Retry if needed
 */

import { useState } from 'react';
import { getClosedUnregisterInfo } from '../../services/api/getClosedUnregisterInfo.api';
import { getBanStatus } from '../../services/api/getKbBanStatus.api';
import { getPhoneNumStatus } from '../../services/api/wlsProdInvMgmtPhoneNumInfo.api';
import { updateReportedStatToSuccess } from '../../services/api/updateReportedStatToSuccess.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase3Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase3 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE3] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Get contract info from PostgreSQL (CLOSED_UNREGISTER status only)
      console.log('[CASE3] Step 1: Getting contract info...');
      const contractInfo = await getClosedUnregisterInfo(contractId);
      
      if (!contractInfo) {
        console.log('[CASE3] Skip: Not in CLOSED_UNREGISTER status');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          contractId,
          message: 'Skip: Not in CLOSED_UNREGISTER status',
          retryAttempted: false
        };
      }

      const { billing_account_num, cust_phone_num } = contractInfo;
      console.log('[CASE3] Contract found:', { ban: billing_account_num, phone: cust_phone_num });

      // Step 2: Check BAN status (Oracle KB) and phone status (WLS API) in parallel
      console.log('[CASE3] Step 2: Checking BAN and phone status...');
      const [banStatusInfo, wlsProducts] = await Promise.all([
        getBanStatus(billing_account_num),
        getPhoneNumStatus({ ban: billing_account_num, phoneNumber: cust_phone_num })
      ]);

      const banStatus = banStatusInfo?.BAN_STATUS;
      const phoneStatus = wlsProducts?.[0]?.status;
      
      console.log('[CASE3] Status check:', { banStatus, phoneStatus });

      // Step 3: Process if BAN not Open OR phone not active
      if (banStatus !== 'O' || phoneStatus !== 'active') {
        console.log('[CASE3] Step 3: Processing (BAN not Open OR Phone not active)');
        
        // Step 4: Update transaction status to SUCCESS in PostgreSQL
        console.log('[CASE3] Step 4: Updating to SUCCESS...');
        await updateReportedStatToSuccess(contractId);
        
        // Step 5: Retry contract via EWSMA API
        console.log('[CASE3] Step 5: Retrying contract...');
        await retryEwContract(contractId);
        
        console.log('[CASE3] Complete: Success');
        setState({ isProcessing: false, error: null });
        return {
          success: true,
          contractId,
          message: `Processed: BAN=${banStatus}, Phone=${phoneStatus}`,
          retryAttempted: true
        };
      }

      console.log('[CASE3] Skip: BAN is Open AND Phone is active');
      setState({ isProcessing: false, error: null });
      return {
        success: false,
        contractId,
        message: 'Skip: BAN is Open AND Phone is active',
        retryAttempted: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CASE3] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });
      return {
        success: false,
        contractId,
        message: 'Error during Case 3 retry',
        retryAttempted: false,
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase3, state, reset };
};

export default useCase3Retry;
