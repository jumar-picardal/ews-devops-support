import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getEwCustomerInfo = async (contractId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/get-ewcc-info/${contractId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
