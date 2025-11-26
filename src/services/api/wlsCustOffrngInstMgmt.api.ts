/**
 * WLS Customer Offering Instance Management API
 * Frontend service for managing SOC (add/remove) operations
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface WlsManageSocParams {
  ban: string;
  phoneNumber: string;
  socCode?: string;
  transactionType: 'ADD' | 'REMOVE';
}

export interface WlsManageSocResult {
  success: boolean;
  message: string;
  data?: unknown;
  httpStatus?: number;
  details?: string;
}

/**
 * Manage SOC (add or remove) for customer's phone number
 */
export const manageSoc = async (params: WlsManageSocParams): Promise<WlsManageSocResult> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/manage-soc`, params);
    
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
      httpStatus: response.data.httpStatus
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.details || 
        error.response?.data?.error || 
        'Failed to manage SOC'
      );
    }
    throw error;
  }
};
