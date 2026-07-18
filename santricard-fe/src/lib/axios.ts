import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  // SEC-05: URL dikontrol oleh environment variable, bukan hard-coded.
  // Set NEXT_PUBLIC_API_URL=https://api.domain.com/api di production.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor untuk menyisipkan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
