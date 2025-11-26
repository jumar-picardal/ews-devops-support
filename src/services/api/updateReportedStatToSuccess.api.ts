/**
 * Update Transaction Status to SUCCESS API
 * Frontend service for updating transaction status from FAIL/REPORTED/SKIP to SUCCESS
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface UpdateReportedStatToSuccessResponse {
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
 * Update transaction status from FAIL/REPORTED/SKIP to SUCCESS for a contract
 */
export const updateReportedStatToSuccess = async (contractId: string): Promise<UpdateReportedStatToSuccessResponse> => {
  try {
    const response = await axios.post<UpdateReportedStatToSuccessResponse>(
      `${BASE_URL}/api/success-reported-txn`,
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
