# Information System of Gov

Website profil dan informasi resmi untuk kebutuhan publik yang mencakup layanan, struktur organisasi, data wilayah, dan konten berita yang dikelola melalui panel admin.

## Deskripsi Singkat

Sistem Informasi Kelurahan adalah proyek web yang dibuat untuk menghadirkan informasi yang lebih mudah diakses oleh masyarakat, mulai dari profil lembaga, visi misi, kondisi geografis, struktur organisasi, hingga layanan dan berita terbaru. Proyek ini juga dilengkapi dengan fitur admin untuk mengelola konten berita dan data terkait secara lebih praktis.

## Fitur

- Landing page yang informatif dan modern
- Halaman profil organisasi dan visi misi
- Informasi geografis dan wilayah
- Struktur jabatan dan organisasi
- Daftar layanan masyarakat
- Halaman berita/kabar dengan detail artikel
- Panel admin untuk mengelola:
  - berita/kabar
  - struktur organisasi
  - data penduduk
- Routing berbasis React untuk navigasi yang cepat
- API backend sederhana berbasis Express untuk kebutuhan data dan integrasi

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- React Router DOM
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript

## Database
- Soon...

### Tools
- npm
- ESLint
- TypeScript Compiler

## Cara Menjalankan Frontend dan Backend

Pastikan sistem sudah memiliki Node.js dan npm terinstall.

### 1. Clone repository

```bash
git clone https://github.com/your-username/stupenPROYEK.git
cd stupenPROYEK
```

### 2. Install dependency Frontend

```bash
cd frontend
npm install
```

### 3. Jalankan Frontend

```bash
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:5173
```

### 4. Install dependency Backend

```bash
cd ../backend
npm install
```

### 5. Jalankan Backend

```bash
npm run dev
```

Backend akan berjalan di:

```text
http://localhost:5000
```

> Langkah di atas untuk menjalankan di komputer sendiri. Untuk memasang ke server yang bisa diakses publik, ikuti [DEPLOY.md](DEPLOY.md) — ada beberapa setelan yang kalau terlewat membuat situs tidak berfungsi atau terbuka celah keamanan.

## Cara Kontribusi

1. Fork project ini ke akun GitHub Anda.
2. Clone repository hasil fork.
3. Buat branch baru untuk fitur atau perbaikan yang akan dikerjakan.
4. Lakukan perubahan dengan format commit yang jelas.
5. Jalankan aplikasi secara lokal sebelum membuat pull request.
6. Buat pull request dengan menjelaskan perubahan yang dilakukan dan tujuan fitur/bug fix yang ditangani.

Contoh:

```bash
git checkout -b feature/nama-fitur
git add .
git commit -m "feat: menambahkan fitur X"
git push origin feature/nama-fitur
```

## Kontributor

- Julian
- Fathur
- Daffa

## Lisensi

Proyek ini dibuat untuk kebutuhan pengembangan aplikasi website informasi dan administrasi yang bersifat internal/kolaboratif. Silakan sesuaikan lisensi jika proyek ini akan digunakan secara publik.
