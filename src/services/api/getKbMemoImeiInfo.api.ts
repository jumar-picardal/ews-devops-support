/**
 * Get KB Memo IMEI Info API
 * Retrieves MEMO records by BAN and IMEI search
 */

import axios from 'axios';
import type { KbMemoRow } from '../../../types/kb_memo.types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getKbMemoImeiInfo = async (ban: string, imei: string): Promise<KbMemoRow[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/kb-memo-imeiinfo/${ban}/${imei}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
