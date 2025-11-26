/**
 * Custom Hook: useCase6Retry
 * 
 * Case 6: ACTIVE_PROCESSING → Add SOC if BAN Open & Phone Active → Retry
 */

import { useState } from 'react';
import { getActiveProcessingInfo } from '../../services/api/getActiveProcessingInfo.api';
import { getBanStatus } from '../../services/api/getKbBanStatus.api';
import { getPhoneNumStatus } from '../../services/api/wlsProdInvMgmtPhoneNumInfo.api';
import { manageSoc } from '../../services/api/wlsCustOffrngInstMgmt.api';
import { updateReportedStatToFail } from '../../services/api/updateReportedStatToFail.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase6Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase6 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE6] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Get contract info from PostgreSQL (ACTIVE_PROCESSING status only)
      console.log('[CASE6] Step 1: Getting contract info...');
      const contractInfo = await getActiveProcessingInfo(contractId);
      
      if (!contractInfo) {
        console.log('[CASE6] Skip: Not in ACTIVE_PROCESSING status');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          contractId,
          message: 'Skip: Not in ACTIVE_PROCESSING status',
          retryAttempted: false
        };
      }

      const { billing_account_num, cust_phone_num, soc_cd } = contractInfo;
      console.log('[CASE6] Contract found:', { 
        ban: billing_account_num, 
        phone: cust_phone_num,
        socCode: soc_cd
      });

      // Step 2: Check BAN status (Oracle KB) and phone status (WLS API) in parallel
      console.log('[CASE6] Step 2: Checking BAN and phone status...');
      const [banStatusInfo, wlsProducts] = await Promise.all([
        getBanStatus(billing_account_num),
        getPhoneNumStatus({ ban: billing_account_num, phoneNumber: cust_phone_num })
      ]);

      const banStatus = banStatusInfo?.BAN_STATUS;
      const phoneStatus = wlsProducts?.[0]?.status;
      
      console.log('[CASE6] Status check:', { banStatus, phoneStatus });

      // Step 3: Process ONLY if BAN is Open AND phone is active
      if (banStatus === 'O' && phoneStatus === 'active') {
        console.log('[CASE6] Step 3: Processing (BAN is Open AND Phone is active)');
        
        // Step 4: Add SOC to phone
        console.log('[CASE6] Step 4: Adding SOC...');
        const addSocResult = await manageSoc({
          ban: billing_account_num,
          phoneNumber: cust_phone_num,
          socCode: soc_cd,
          transactionType: 'ADD'
        });
        
        if (!addSocResult.success) {
          throw new Error(`Failed to add SOC: ${addSocResult.details}`);
        }
        
        console.log('[CASE6] SOC added successfully');
        
        // Step 5: Update transaction status to FAIL in PostgreSQL
        console.log('[CASE6] Step 5: Updating to FAIL...');
        await updateReportedStatToFail(contractId);
        
        // Step 6: Retry contract via EWSMA API
        console.log('[CASE6] Step 6: Retrying contract...');
        await retryEwContract(contractId);
        
        console.log('[CASE6] Complete: Success');
        setState({ isProcessing: false, error: null });
        return {
          success: true,
          contractId,
          message: `Processed: SOC added (${soc_cd}), BAN=${banStatus}, Phone=${phoneStatus}`,
          retryAttempted: true
        };
      }

      console.log('[CASE6] Skip: BAN not Open OR Phone not active');
      setState({ isProcessing: false, error: null });
      return {
        success: false,
        contractId,
        message: `Skip: BAN=${banStatus}, Phone=${phoneStatus}`,
        retryAttempted: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CASE6] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });
      return {
        success: false,
        contractId,
        message: 'Error during Case 6 retry',
        retryAttempted: false,
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase6, state, reset };
};

export default useCase6Retry;
