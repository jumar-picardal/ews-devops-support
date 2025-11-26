/**
 * WLS Customer Offering Instance Management - Remove SOC API
 * Frontend service for removing SOC from customer's phone number
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface WlsRemoveSocParams {
  ban: string;
  phoneNumber: string;
  socCode?: string;
}

export interface WlsRemoveSocResult {
  success: boolean;
  message: string;
  data?: unknown;
  httpStatus?: number;
  details?: string;
}

/**
 * Remove SOC from customer's phone number
 */
export const removeSoc = async (params: WlsRemoveSocParams): Promise<WlsRemoveSocResult> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/remove-soc`, params);
    
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
        'Failed to remove SOC'
      );
    }
    throw error;
  }
};
