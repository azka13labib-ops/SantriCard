# Setup Backend — Laravel

---

## Prasyarat

- PHP >= 8.1
- Composer
- MySQL 8+
- Node.js (untuk asset)

---

## Langkah Setup

### 1. Buat project Laravel

```bash
composer create-project laravel/laravel santricard-api
cd santricard-api
```

### 2. Setup `.env`

```env
APP_NAME=SantriCard
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=santricard
DB_USERNAME=root
DB_PASSWORD=your_password

# Tambahkan untuk Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### 3. Install dependensi

```bash
# Auth
composer require laravel/sanctum

# QR Code generator
composer require simplesoftwareio/simple-qrcode

# Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 4. Jalankan migration

```bash
php artisan migrate
php artisan db:seed --class=SantriCardSeeder
```

### 5. Jalankan server

```bash
php artisan serve
# Berjalan di http://localhost:8000
```

### 6. Setup scheduler (untuk reset limit harian)

Di production, tambahkan cron job di server:

```bash
# crontab -e
* * * * * cd /path/to/santricard-api && php artisan schedule:run >> /dev/null 2>&1
```

---

## Cek Semua Berjalan

```bash
php artisan route:list   # Cek semua route
php artisan tinker       # Cek koneksi DB
```