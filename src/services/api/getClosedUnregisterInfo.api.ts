/**
 * Get Closed Unregister Info API Service
 * Handles API calls to retrieve CLOSED_UNREGISTER contract information
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get closed unregister information for a contract
 */
export const getClosedUnregisterInfo = async (contractId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/get_closed_unregister_info/${contractId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
