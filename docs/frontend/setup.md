# Setup Frontend — Next.js + Tailwind CSS

---

## 1. Buat Project Next.js

Kita akan menggunakan framework Next.js dengan App Router, disertai Tailwind CSS untuk styling.

```bash
pnpm create next-app@latest santricard-web
```

Saat muncul pertanyaan instalasi (prompts), pilih konfigurasi berikut:
- Would you like to use TypeScript? **Yes/No** (Sesuai preferensi tim)
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? (recommended) **Yes**
- Would you like to customize the default import alias? **No**

## 2. Install Dependencies Tambahan

Masuk ke folder project, lalu install `axios` untuk mempermudah komunikasi dengan API Backend (Laravel).

```bash
cd santricard-web
pnpm add axios
```

## 3. Jalankan Server Development

```bash
pnpm dev
```

Project Frontend Anda sekarang berjalan di `http://localhost:3000`.

---

## 4. Konfigurasi Axios Interceptors (Opsional tapi Penting)

Nantinya, buat file khusus (misal `src/lib/axios.js` atau `src/utils/api.js`) untuk mengatur *base URL* dan otomatis menyisipkan Bearer Token dari localStorage/cookies di setiap request.

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Sisipkan token di setiap request jika user sudah login
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```
