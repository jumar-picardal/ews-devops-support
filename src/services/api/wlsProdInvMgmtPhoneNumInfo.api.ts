/**
 * WLS Product Inventory Management API Service
 * Handles API calls to retrieve product status by BAN and/or phone number
 */

import axios from 'axios';
import type { WlsProdInvMgmtProduct, ProductQueryParams } from '../../../types/wlsProductInvMgmt.types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get product status by BAN and/or phone number
 */
export const getPhoneNumStatus = async (params: ProductQueryParams): Promise<WlsProdInvMgmtProduct[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.ban) {
      queryParams.append('ban', params.ban);
    }
    
    if (params.phoneNumber) {
      queryParams.append('phoneNumber', params.phoneNumber);
    }

    const response = await axios.get(
      `${BASE_URL}/api/wlsprod-phonenum-info?${queryParams.toString()}`
    );
    
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error ?? error.message);
    }
    throw error;
  }
};
