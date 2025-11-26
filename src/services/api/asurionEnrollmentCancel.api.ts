/**
 * Asurion Enrollment Cancel API Service
 * Handles Asurion enrollment cancellation API calls to the backend
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface AsurionError {
  code: string;
  message: string;
}

interface AsurionResponse {
  enrollment_id?: string;
  transaction_id?: string;
  error?: AsurionError;
}

interface EnrollmentCancelResponse {
  success: boolean;
  message: string;
  httpStatus?: number;
  subscriptionId?: string;
  cancelDate?: string;
  response?: AsurionResponse;
  error?: string;
  details?: string;
}

/**
 * Cancel Asurion warranty enrollment
 */
export const asurionEnrollmentCancel = async (
  subscriptionId: string,
  serviceCode: string // Changed from partnerId - backend determines partnerId
): Promise<EnrollmentCancelResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/cancel-asurion-enrollment`, {
      subscriptionId,
      serviceCode // Send serviceCode instead of partnerId
    });
    return {
      ...response.data,
      httpStatus: response.status
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.error || error.message,
        details: error.response?.data?.details,
        httpStatus: error.response?.status
      };
    }
    throw error;
  }
};
