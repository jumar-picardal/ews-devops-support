/**
 * WLS Product Inventory Management Phone Number List Info API Service
 * Handles API calls to retrieve product status by BAN
 */

import axios from 'axios';
import type { WlsProdInvMgmtProduct } from '../../../types/wlsProductInvMgmt.types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get product status by BAN
 */
export const getPhoneNumListInfo = async (ban: string): Promise<WlsProdInvMgmtProduct[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/wlsprod-phonenumlist-info/${ban}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error ?? error.message);
    }
    throw error;
  }
};
