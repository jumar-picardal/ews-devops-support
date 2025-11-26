/**
 * WLS Product Inventory Management Memo API Service
 * Handles API calls to retrieve memo by BAN and Phone Number
 */

import axios from 'axios';
import type { WlsProdInvMgmtMemo } from '../../../types/wlsProductInvMgmt.types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get memo by BAN and Phone Number
 */
export const getWlsMemo = async (ban: string, phoneNumber: string): Promise<WlsProdInvMgmtMemo[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/wlsprod-memo/${ban}/${phoneNumber}`);
    return response.data.data ?? [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error ?? error.message);
    }
    throw error;
  }
};
