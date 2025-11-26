/**
 * Get Warranty Status API
 * Fetches current warranty status description for a contract
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface WarrantyStatus {
  status_typ_desc_txt: string;
}

export const getWarrantyStatus = async (contractId: string): Promise<WarrantyStatus> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/get-warranty-status/${contractId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
