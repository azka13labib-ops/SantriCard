import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  // SEC-05: URL dikontrol oleh environment variable, bukan hard-coded.
  // Set NEXT_PUBLIC_API_URL=https://api.domain.com/api di production.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // P2-B / P3-F: Timeout global 15 detik — mencegah UI stuck di loading
  // saat koneksi lambat (kondisi pondok pesantren daerah pelosok).
  timeout: 15000,
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

// P2-B: Response interceptor — handle 401 (token expired / invalid) secara global.
// Hapus cookies dan redirect ke /login agar user tidak stuck di halaman dengan data kosong.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Token expired atau tidak valid — paksa logout
        Cookies.remove('token');
        Cookies.remove('user_role');
        Cookies.remove('perlu_setup_akun');

        // Redirect ke login hanya jika bukan sudah di halaman login
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }

      // P3-F: Handle timeout — beri pesan yang jelas ke user
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new Error('Koneksi terlalu lambat atau server tidak merespons. Silakan coba lagi.')
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
