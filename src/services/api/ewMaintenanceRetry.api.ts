/**
 * Retry API Service
 * Handles all retry-related API calls to the backend
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface RetryResponse {
  success: boolean;
  status: string;
  message: string;
  details?: string;
  httpStatus?: number;
  response?: unknown;
}

/**
 * Retry a single EW contract
 */
export const retryEwContract = async (contractId: string): Promise<RetryResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/retry/warranty`, {
      contractId
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: 'Error',
        message: error.response?.data?.error || error.message,
        details: error.response?.data?.details
      };
    }
    throw error;
  }
};
