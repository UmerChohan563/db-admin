import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 60000,
});

// Request interceptor
publicApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
publicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default publicApi;