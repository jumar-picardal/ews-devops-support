/**
 * Get KB SOC Info API
 * Retrieves WARRANTY-RELATED SOC records from SERVICE_AGREEMENT
 */

import axios from 'axios';
import type { KbServiceAgreementRow } from '../../../types/kb_service_agreement.types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getKbMemoSocInfo = async (ban: string): Promise<KbServiceAgreementRow[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/kb-memo-socinfo/${ban}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
