/**
 * Update Reported Transaction Status to FAIL API
 * Frontend service for updating transaction status from REPORTED to FAIL
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface UpdateReportedStatToFailResponse {
  success: boolean;
  message: string;
  contractId: string;
  rowsUpdated: number;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Update transaction status from REPORTED to FAIL for a contract
 */
export const updateReportedStatToFail = async (contractId: string): Promise<UpdateReportedStatToFailResponse> => {
  try {
    const response = await axios.post<UpdateReportedStatToFailResponse>(
      `${BASE_URL}/api/fail-reported-txn`,
      { contractId }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ErrorResponse;
      throw new Error(errorData?.error || error.message);
    }
    throw error;
  }
};
