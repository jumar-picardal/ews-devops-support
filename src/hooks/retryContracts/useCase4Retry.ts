/**
 * Custom Hook: useCase4Retry
 * 
 * Case 4: CLOSED_UNREGISTER → Remove SOC if BAN Open & Phone Active → Retry
 */

import { useState } from 'react';
import { getClosedUnregisterInfo } from '../../services/api/getClosedUnregisterInfo.api';
import { getBanStatus } from '../../services/api/getKbBanStatus.api';
import { getPhoneNumStatus } from '../../services/api/wlsProdInvMgmtPhoneNumInfo.api';
import { manageSoc } from '../../services/api/wlsCustOffrngInstMgmt.api';
import { updateReportedStatToSuccess } from '../../services/api/updateReportedStatToSuccess.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase4Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase4 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE4] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Get contract info from PostgreSQL (CLOSED_UNREGISTER status only)
      console.log('[CASE4] Step 1: Getting contract info...');
      const contractInfo = await getClosedUnregisterInfo(contractId);
      
      if (!contractInfo) {
        console.log('[CASE4] Skip: Not in CLOSED_UNREGISTER status');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          contractId,
          message: 'Skip: Not in CLOSED_UNREGISTER status',
          retryAttempted: false
        };
      }

      const { billing_account_num, cust_phone_num, soc_cd } = contractInfo;
      console.log('[CASE4] Contract found:', { 
        ban: billing_account_num, 
        phone: cust_phone_num,
        socCode: soc_cd
      });

      // Step 2: Check BAN status (Oracle KB) and phone status (WLS API) in parallel
      console.log('[CASE4] Step 2: Checking BAN and phone status...');
      const [banStatusInfo, wlsProducts] = await Promise.all([
        getBanStatus(billing_account_num),
        getPhoneNumStatus({ ban: billing_account_num, phoneNumber: cust_phone_num })
      ]);

      const banStatus = banStatusInfo?.BAN_STATUS;
      const phoneStatus = wlsProducts?.[0]?.status;
      
      console.log('[CASE4] Status check:', { banStatus, phoneStatus });

      // Step 3: Process ONLY if BAN is Open AND phone is active
      if (banStatus === 'O' && phoneStatus === 'active') {
        console.log('[CASE4] Step 3: Processing (BAN is Open AND Phone is active)');
        
        // Step 4: Remove SOC from phone
        console.log('[CASE4] Step 4: Removing SOC...');
        const removeSocResult = await manageSoc({
          ban: billing_account_num,
          phoneNumber: cust_phone_num,
          socCode: soc_cd,
          transactionType: 'REMOVE'
        });
        
        if (!removeSocResult.success) {
          throw new Error(`Failed to remove SOC: ${removeSocResult.details}`);
        }
        
        console.log('[CASE4] SOC removed successfully');
        
        // Step 5: Update transaction status to SUCCESS in PostgreSQL
        console.log('[CASE4] Step 5: Updating to SUCCESS...');
        await updateReportedStatToSuccess(contractId);
        
        // Step 6: Retry contract via EWSMA API
        console.log('[CASE4] Step 6: Retrying contract...');
        await retryEwContract(contractId);
        
        console.log('[CASE4] Complete: Success');
        setState({ isProcessing: false, error: null });
        return {
          success: true,
          contractId,
          message: `Processed: SOC removed (${soc_cd}), BAN=${banStatus}, Phone=${phoneStatus}`,
          retryAttempted: true
        };
      }

      console.log('[CASE4] Skip: BAN not Open OR Phone not active');
      setState({ isProcessing: false, error: null });
      return {
        success: false,
        contractId,
        message: `Skip: BAN=${banStatus}, Phone=${phoneStatus}`,
        retryAttempted: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CASE4] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });
      return {
        success: false,
        contractId,
        message: 'Error during Case 4 retry',
        retryAttempted: false,
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase4, state, reset };
};

export default useCase4Retry;
