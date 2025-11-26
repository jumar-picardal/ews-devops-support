/**
 * Custom Hook: useCase7Retry
 * 
 * Case 7: ACTIVE_PROCESSING with failed CREATE VENDOR ORDER for DCC → RETRY
 * - Process only contracts with ACTIVE_PROCESSING status
 * - If BAN is Open AND Phone number is Active AND vendor is Asurion AND NOT DCCS:
 *   - Create Asurion enrollment
 *   - Mark transaction states from REPORTED to FAIL
 *   - Perform RETRY warranty
 */

import { useState } from 'react';
import { getActiveProcessingInfo } from '../../services/api/getActiveProcessingInfo.api';
import { getBanStatus } from '../../services/api/getKbBanStatus.api';
import { getPhoneNumStatus } from '../../services/api/wlsProdInvMgmtPhoneNumInfo.api';
import { getDccEnrollmentRequest } from '../../services/api/getDccEnrollmentRequest.api';
import { asurionEnrollmentCreateForDCC } from '../../services/api/asurionEnrollmentCreateForDCC.api';
import { updateReportedStatToFail } from '../../services/api/updateReportedStatToFail.api';
import { retryEwContract } from '../../services/api/ewMaintenanceRetry.api';
import type { CaseRetryResult, CaseRetryState } from '../../../types/caseRetry.types';

export const useCase7Retry = () => {
  const [state, setState] = useState<CaseRetryState>({
    isProcessing: false,
    error: null
  });

  const retryCase7 = async (contractId: string): Promise<CaseRetryResult> => {
    console.log('[CASE7] Start:', { contractId });
    setState({ isProcessing: true, error: null });

    try {
      // Step 1: Get contract info (ACTIVE_PROCESSING status only)
      console.log('[CASE7] Step 1: Getting contract info...');
      const contractInfo = await getActiveProcessingInfo(contractId);
      
      if (!contractInfo) {
        console.log('[CASE7] Skip: Not in ACTIVE_PROCESSING status');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          contractId,
          message: 'Skip: Not in ACTIVE_PROCESSING status',
          retryAttempted: false
        };
      }

      const { billing_account_num, cust_phone_num } = contractInfo;
      console.log('[CASE7] Contract found:', { 
        ban: billing_account_num, 
        phone: cust_phone_num
      });

      // Step 2: Get enrollment data
      console.log('[CASE7] Step 2: Getting enrollment data...');
      const enrollmentResponse = await getDccEnrollmentRequest(contractId);
      
      if (!enrollmentResponse?.data) {
        console.log('[CASE7] Skip: No enrollment data found');
        setState({ isProcessing: false, error: null });
        return {
          success: false,
          contractId,
          message: 'Skip: No enrollment data found',
          retryAttempted: false
        };
      }

      const { wrnty_vendor_cd, wrnty_srvc_cd } = enrollmentResponse.data;
      console.log('[CASE7] Enrollment data:', { vendor: wrnty_vendor_cd, serviceCode: wrnty_srvc_cd });

      // Step 3: Check BAN and phone status
      console.log('[CASE7] Step 3: Checking BAN and phone status...');
      const [banStatusInfo, wlsProducts] = await Promise.all([
        getBanStatus(billing_account_num),
        getPhoneNumStatus({ ban: billing_account_num, phoneNumber: cust_phone_num })
      ]);

      const banStatus = banStatusInfo?.BAN_STATUS;
      const phoneStatus = wlsProducts?.[0]?.status;
      
      console.log('[CASE7] Status check:', { 
        banStatus, 
        phoneStatus, 
        productsCount: wlsProducts?.length,
        vendor: wrnty_vendor_cd, 
        serviceCode: wrnty_srvc_cd 
      });

      // Step 4: Process if BAN Open AND Phone Active AND Vendor Asurion AND NOT DCCS
      const isDccs = wrnty_srvc_cd?.includes('DCCS');
      
      if (banStatus === 'O' && phoneStatus === 'active' && wrnty_vendor_cd === 'ASUR' && !isDccs) {
        console.log('[CASE7] Step 4: Processing (conditions met)');
        
        // Step 5: Create Asurion enrollment
        console.log('[CASE7] Step 5: Creating Asurion enrollment...');
        const enrollmentResult = await asurionEnrollmentCreateForDCC(contractId);
        
        if (enrollmentResult.status === 'Error') {
          const httpStatus = enrollmentResult.httpStatus || 'Unknown';
          const errorCode = enrollmentResult.message?.split(': ')[1] || 'unknown_error';
          const errorDetails = enrollmentResult.errorDescription || 'No details available';
          throw new Error(`${httpStatus} Error - ${errorCode}: ${errorDetails}`);
        }
        
        console.log('[CASE7] Asurion enrollment created successfully');
        
        // Step 6: Update transaction to FAIL
        console.log('[CASE7] Step 6: Updating to FAIL...');
        await updateReportedStatToFail(contractId);
        
        // Step 7: Retry contract
        console.log('[CASE7] Step 7: Retrying contract...');
        await retryEwContract(contractId);
        
        console.log('[CASE7] Complete: Success');
        setState({ isProcessing: false, error: null });
        return {
          success: true,
          contractId,
          message: `Processed: Asurion enrollment created, BAN=${banStatus}, Phone=${phoneStatus}`,
          retryAttempted: true
        };
      }

      console.log('[CASE7] Skip: Conditions not met');
      setState({ isProcessing: false, error: null });
      return {
        success: false,
        contractId,
        message: `Skip: BAN=${banStatus}, Phone=${phoneStatus}, Vendor=${wrnty_vendor_cd}, DCCS=${isDccs}`,
        retryAttempted: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CASE7] Error:', { contractId, error: errorMessage });
      setState({ isProcessing: false, error: errorMessage });
      return {
        success: false,
        contractId,
        message: 'Error during Case 7 retry',
        retryAttempted: false,
        details: errorMessage
      };
    }
  };

  const reset = () => {
    setState({ isProcessing: false, error: null });
  };

  return { retryCase7, state, reset };
};

export default useCase7Retry;
