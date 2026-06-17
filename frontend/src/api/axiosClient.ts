import axios, { AxiosError } from 'axios';

interface ApiErrorBody {
  status?: number;
  message?: string;
  timestamp?: string;
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const apiMessage = error.response?.data?.message;
    if (apiMessage) {
      error.message = apiMessage;
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
