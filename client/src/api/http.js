import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('pansarAuth') || 'null')?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pansarAuth');
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';
