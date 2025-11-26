import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getDccEnrollmentRequest = async (contractId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/get-dcc-enrollment-request/${contractId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
