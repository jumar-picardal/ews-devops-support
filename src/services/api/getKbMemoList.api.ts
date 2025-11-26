/**
 * Get KB Memo List API
 * Retrieves consolidated MEMO records for multiple memo types
 */

import axios from 'axios';
import type { KbMemoRow } from '../../../types/kb_memo.types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getKbMemoList = async (ban: string): Promise<KbMemoRow[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/kb-memo-list/${ban}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
