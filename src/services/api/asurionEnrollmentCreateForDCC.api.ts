import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const asurionEnrollmentCreateForDCC = async (contractId: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/asurion-enrollment-create-dcc/${contractId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};
