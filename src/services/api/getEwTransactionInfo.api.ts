/**
 * Get EW Transaction Info API
 * Fetches transaction details for a warranty contract
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface EwTransactionInfo {
  extnd_wrnty_txn_typ_cd: string;
  extnd_wrnty_txn_stat_cd: string;
  extnd_wrnty_txn_err_cd: string | null;
  extnd_wrnty_txn_err_txt: string | null;
}

export const getEwTransactionInfo = async (contractId: string): Promise<EwTransactionInfo[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/ew-txn-info/${contractId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
