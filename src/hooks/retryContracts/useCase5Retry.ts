/**
 * Custom Hook: useCase5Retry
 * 
 * Case 5: CLOSED_TENDER → Cancel Asurion → Update to SUCCESS → RETRY
 */

import { useState } from 'react';
import { getClosedTenderInfo } from '../../services/api/getClosedTenderInfo.api';
import { asurionEnrollmentCancel } from '../../services/api/asurionEnrollmentCancel.api';
import { updateReportedStatToSuccess } from '../../services/api/updateReportedStatToSuccess.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase5Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase5 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE5] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Get contract info
      console.log('[CASE5] Step 1: Getting contract info...');
      const contractInfo = await getClosedTenderInfo(contractId);
      console.log('[CASE5] Contract info:', { 
        vendor: contractInfo?.wrnty_vendor_cd, 
        subscriptionId: contractInfo?.subscription_id 
      });
      
      if (!contractInfo) {
        console.log('[CASE5] Skip: Not in CLOSED_TENDER status');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          retryAttempted: false,
          contractId,
          message: 'Contract not in CLOSED_TENDER status (may have been already processed)'
        };
      }

      // Step 2: Check vendor - Skip if Apple
      console.log('[CASE5] Step 2: Checking vendor...');
      console.log('[CASE5] Vendor details:', { 
        vendor: contractInfo.wrnty_vendor_cd,
        serviceCode: contractInfo.wrnty_srvc_cd,
        subscriptionId: contractInfo.subscription_id
      });
      
      // Skip Apple contracts immediately
      if (contractInfo.wrnty_vendor_cd === 'APL') {
        console.log('[CASE5] Skip: Vendor is Apple (APL)');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          retryAttempted: false,
          contractId,
          message: 'Skipped - Warranty vendor is Apple (APL), only Asurion contracts are processed in Case 5'
        };
      }
      
      let asurionStatus = 'skipped';
      let asurionMessage = '';
      
      // Process Asurion contracts
      if (contractInfo.wrnty_vendor_cd === 'ASUR' && contractInfo.subscription_id) {
        const serviceCode = contractInfo.wrnty_srvc_cd || '';
        
        console.log('[CASE5] Cancelling Asurion enrollment...');
        try {
          const cancelResult = await asurionEnrollmentCancel(
            contractInfo.subscription_id,
            serviceCode // Backend determines partnerId from serviceCode
          );
            console.log('[CASE5] Asurion cancel result:', { 
              httpStatus: cancelResult.httpStatus,
              errorCode: cancelResult.response?.error?.code
            });
            
            const status = cancelResult.httpStatus;
            const errorCode = cancelResult.response?.error?.code;
            
            // Allow only HTTP 200, 400, 409
            const shouldContinue = status === 200 || status === 400 || status === 409;
            
            if (!shouldContinue) {
              console.error('[CASE5] Asurion cancellation failed:', { status });
              setState({ isProcessing: false, error: 'Asurion cancellation failed' });
              return {
                success: false,
                retryAttempted: false,
                contractId,
                message: 'Asurion cancellation failed',
                details: `HTTP ${status}: ${cancelResult.message}`
              };
            }
            
            // Determine status based on response
            if (status === 200 && !errorCode) {
              asurionStatus = 'cancelled';
              asurionMessage = 'Asurion enrollment cancelled successfully';
            } else if (errorCode === 'invalid_enrollment_id') {
              asurionStatus = 'invalid_enrollment_id';
              asurionMessage = 'Invalid enrollment ID';
            } else if (errorCode === 'enrollment_already_cancelled') {
              asurionStatus = 'enrollment_already_cancelled';
              asurionMessage = 'Enrollment already cancelled';
            } else {
              asurionStatus = `http_${status}`;
              asurionMessage = `HTTP ${status} response from Asurion`;
            }
            
            console.log('[CASE5] Asurion status:', { asurionStatus, asurionMessage });
        } catch (error) {
          console.error('[CASE5] Asurion cancellation error:', error);
          setState({ isProcessing: false, error: 'Asurion cancellation error' });
          return {
            success: false,
            retryAttempted: false,
            contractId,
            message: 'Asurion cancellation error',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      } else {
        console.log('[CASE5] Vendor is not ASUR or no subscription ID');
        asurionMessage = 'Not an Asurion contract or missing subscription ID';
      }

      // Step 3: Update to SUCCESS (always)
      console.log('[CASE5] Step 3: Updating to SUCCESS...');
      const updateResult = await updateReportedStatToSuccess(contractId);
      console.log('[CASE5] Update result:', { rowsUpdated: updateResult.rowsUpdated });

      // Step 4: Retry contract (always)
      console.log('[CASE5] Step 4: Retrying contract...');
      const retryResult = await retryEwContract(contractId);
      console.log('[CASE5] Retry result:', { success: retryResult.success });

      console.log('[CASE5] Complete:', { success: retryResult.success, asurionStatus });

      setState({ isProcessing: false, error: null });

      // Build detailed message
      let finalMessage = '';
      if (retryResult.success) {
        if (asurionStatus === 'cancelled') {
          finalMessage = 'Retry completed - Asurion enrollment cancelled successfully';
        } else if (asurionStatus === 'invalid_enrollment_id') {
          finalMessage = 'Retry completed - Asurion reported invalid enrollment ID';
        } else if (asurionStatus === 'enrollment_already_cancelled') {
          finalMessage = 'Retry completed - Asurion enrollment was already cancelled';
        } else {
          finalMessage = `Retry completed (Asurion: ${asurionStatus})`;
        }
      } else {
        finalMessage = 'Retry failed';
      }

      return {
        success: retryResult.success,
        retryAttempted: true,
        contractId,
        message: finalMessage,
        details: asurionMessage || retryResult.details
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CASE5] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });

      return {
        success: false,
        retryAttempted: false,
        contractId,
        message: 'Error during Case 5 retry',
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase5, state, reset };
};

export default useCase5Retry;
