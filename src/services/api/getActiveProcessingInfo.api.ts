/**
 * Get Active Processing Information API
 * Frontend service for retrieving ACTIVE_PROCESSING contract information
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ActiveProcessingInfo {
  extnd_wrnty_contract_id: string;
  billing_account_num: string;
  cust_phone_num: string;
  soc_cd: string;
}

interface GetActiveProcessingInfoResponse {
  success: boolean;
  data: ActiveProcessingInfo;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Get active processing information for a contract
 */
export const getActiveProcessingInfo = async (contractId: string): Promise<ActiveProcessingInfo> => {
  try {
    const response = await axios.get<GetActiveProcessingInfoResponse>(
      `${BASE_URL}/api/get_active_processing_info/${contractId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ErrorResponse;
      throw new Error(errorData?.error || error.message);
    }
    throw error;
  }
};
