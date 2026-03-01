# Pytricity - PPOB Payment System

Sistem Informasi Pembayaran Listrik Pascabayar (PPOB) berbasis web. Proyek ini mengimplementasikan arsitektur _Headless_, memisahkan lapisan antarmuka pengguna dari logika bisnis server.

## Tumpukan Teknologi

Sistem ini dibangun menggunakan kombinasi teknologi modern untuk memastikan skalabilitas dan keamanan data transaksi.

- **Lapisan Frontend:** Next.js (App Router), Tailwind CSS
- **Lapisan Backend:** Laravel 11, RESTful API
- **Autentikasi API:** Laravel Sanctum
- **Sistem Basis Data:** PostgreSQL
- **Gerbang Pembayaran:** Midtrans (Sandbox)

## Struktur Arsitektur

Repositori ini terdiri dari dua sistem independen.

- `/frontend` : Memuat aplikasi klien Next.js. Lapisan ini bertugas merender antarmuka, mengelola status aplikasi, dan mengkonsumsi API internal.
- `/backend` : Memuat aplikasi server Laravel. Lapisan ini menangani validasi logika bisnis, koneksi basis data PostgreSQL, dan bertindak sebagai _Mock Server_ untuk simulasi tagihan PLN.

## Persyaratan Lingkungan Pengembangan

Pastikan mesin lokal Anda memiliki perangkat lunak berikut sebelum menjalankan proyek.

- Node.js (Minimal v18)
- PHP (Minimal v8.2)
- Composer
- Mesin Basis Data PostgreSQL

## Panduan Instalasi Lokal

Ikuti langkah teknis berikut untuk menjalankan kedua server di lingkungan lokal.

### 1. Persiapan Repositori

Klon repositori dan masuk ke dalam direktori proyek.

```bash
git clone [https://github.com/ahmadzkh/Pytricity.git](https://github.com/ahmadzkh/Pytricity.git)
cd Pytricity
```

### 2. Penyetelan Backend (Laravel)

Buka terminal dan jalankan konfigurasi server API.

```bash
cd backend
cp .env.example .env
```

Buka file .env di folder backend dan sesuaikan blok koneksi basis data Anda.

```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pytricity_db
DB_USERNAME=postgres
DB_PASSWORD=
```

Lanjutkan proses instalasi dependensi dan migrasi data.

```bash
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

Server backend akan berjalan di http://localhost:8000.

### 3. Penyetelan Frontend (Next.js)

Buka sesi terminal baru dan jalankan konfigurasi klien.

```bash
cd frontend
npm install
npm run dev
```

Aplikasi klien akan berjalan di http://localhost:3000. Akses URL ini melalui peramban web Anda.
