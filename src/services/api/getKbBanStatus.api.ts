/**
 * Get KB BAN Status API Service
 * Handles API calls to retrieve BAN status from Oracle KB database
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get BAN status information from KB Oracle database
 */
export const getBanStatus = async (ban: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/kb-ban-status/${ban}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
