/**
 * Get Closed Tender Information API
 * Frontend service for retrieving CLOSED_TENDER contract information
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ClosedTenderInfo {
  extnd_wrnty_contract_id: string;
  wrnty_vendor_cd: string;
  wrnty_srvc_cd: string;
  subscription_id: string;
}

interface GetClosedTenderInfoResponse {
  success: boolean;
  data: ClosedTenderInfo;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Get closed tender information for a contract
 */
export const getClosedTenderInfo = async (contractId: string): Promise<ClosedTenderInfo> => {
  try {
    const response = await axios.get<GetClosedTenderInfoResponse>(
      `${BASE_URL}/api/get_closed_tender_info/${contractId}`
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
