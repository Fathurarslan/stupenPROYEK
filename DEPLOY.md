# Panduan Deploy

Langkah memasang Sistem Informasi Kelurahan ke server sungguhan. Ikuti berurutan —
beberapa langkah bergantung pada langkah sebelumnya.

Untuk menjalankan di komputer sendiri, lihat [README.md](README.md). Panduan ini
khusus untuk server yang bisa diakses publik.

---

## Ringkasan: yang wajib diisi

Kalau salah satu dari ini terlewat, akibatnya langsung terasa:

| Hal | Kalau terlewat |
|---|---|
| HTTPS | Token admin bisa dicuri siapa pun yang satu jaringan |
| `VITE_API_URL` diset **sebelum** build | Situs terbuka tapi seluruh datanya kosong |
| `CORS_ORIGIN` di backend | Situs terbuka tapi seluruh datanya kosong |
| `TRUST_PROXY=true` kalau ada proxy | Pembatas percobaan login lumpuh |
| Pengguna database non-superuser | Satu bug kecil bisa berakibat ke seluruh server database |
| `uploads/` di disk permanen | Semua foto hilang setiap kali deploy ulang |

---

## 1. Siapkan database

### Buat database dan pengguna khusus

Jangan pakai pengguna `postgres` untuk aplikasi. Pengguna itu superuser: setiap
query aplikasi berjalan dengan hak penuh, termasuk menghapus tabel dan membaca
database lain di server yang sama. Selama tidak ada celah injeksi hal itu tidak
terpakai, tapi kalau suatu saat ada satu bug, selisihnya adalah antara "satu
tabel bocor" dan "seluruh server database dikuasai".

Masuk sebagai `postgres`, lalu:

```sql
CREATE DATABASE kelurahan_sidoharjo;
CREATE USER kelurahan_app WITH PASSWORD 'ganti-dengan-password-panjang-dan-acak';

\c kelurahan_sidoharjo

-- Aplikasi tidak perlu membuat atau menghapus tabel; itu urusan migrasi
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO kelurahan_app;
```

### Jalankan skema awal

`src/db/SCHEMA.sql` adalah catatan bentuk awal database dan **tidak dijalankan
otomatis**. Jalankan sekali sebagai `postgres`:

```bash
psql -U postgres -d kelurahan_sidoharjo -f backend/src/db/SCHEMA.sql
```

### Beri hak ke pengguna aplikasi

Setelah tabelnya ada:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kelurahan_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kelurahan_app;

-- Berlaku juga untuk tabel yang dibuat migrasi berikutnya
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kelurahan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO kelurahan_app;
```

> **Catatan:** `npm run db:migrate` membuat dan mengubah tabel, jadi ia butuh hak
> lebih tinggi daripada aplikasi. Jalankan migrasi dengan kredensial `postgres`
> (`.env` sementara atau variabel lingkungan), lalu kembalikan `.env` ke
> `kelurahan_app` sebelum menyalakan servernya.

---

## 2. Isi `backend/.env`

Salin dari `backend/.env.example`, lalu isi:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=kelurahan_app
DB_PASSWORD=password-yang-tadi-dibuat
DB_NAME=kelurahan_sidoharjo

PORT=5000

# true HANYA kalau backend berada di belakang Nginx, Railway, Render, Cloudflare
TRUST_PROXY=true

# Alamat situs yang boleh memanggil API, pisahkan koma. WAJIB diisi.
CORS_ORIGIN=https://kelurahan-sidoharjo.example.id

# Kunci penanda tangan token. WAJIB berbeda dari yang dipakai saat mengembangkan.
JWT_SECRET=
JWT_EXPIRES_SECONDS=28800

# Dipakai sekali oleh "npm run db:seed" untuk membuat admin pertama
ADMIN_EMAIL=admin@kelurahan-sidoharjo.example.id
ADMIN_PASSWORD=
```

Buat `JWT_SECRET` baru khusus server ini:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Kenapa `TRUST_PROXY` tidak boleh asal diisi

Salah setelan membuka celah di dua arah:

- **Diisi `true` padahal tanpa proxy** — siapa pun bisa mengirim header
  `X-Forwarded-For` palsu yang berganti-ganti dan menembus pembatas login.
- **Dibiarkan `false` padahal ada proxy** — semua pengunjung terbaca sebagai
  satu IP, jadi satu orang yang salah password mengunci semua orang.

Isi `true` kalau ada Nginx, Caddy, Cloudflare, atau Anda memakai Railway/Render.
Isi `false` kalau Node langsung menerima permintaan dari internet.

---

## 3. Migrasi dan admin pertama

```bash
cd backend
npm ci                # jangan pakai --omit=dev, lihat peringatan di bawah
npm run db:migrate    # pakai kredensial postgres, lihat catatan di langkah 1
npm run db:seed       # membuat admin dari ADMIN_EMAIL & ADMIN_PASSWORD
```

> **Jangan pasang dengan `npm ci --omit=dev`.** Itu naluri yang wajar di server
> produksi, tapi di sini merusak tiga perintah sekaligus.
>
> `db:migrate`, `db:seed`, dan `berkas:sapu` dijalankan langsung dari berkas
> TypeScript memakai `tsx`, dan `tsx` ada di `devDependencies`. Tanpanya,
> ketiganya gagal dengan pesan "command not found" yang tidak menjelaskan
> apa-apa.
>
> Berkas migrasi `.sql` juga **tidak ikut disalin** ke `dist/` oleh `tsc`, jadi
> menjalankan migrasi dari hasil build pun tidak akan menemukan satu pun
> migrasi — dan diam-diam melaporkan "Tidak ada migrasi baru" seolah semuanya
> beres.
>
> Aplikasinya sendiri (`npm run start`) tetap berjalan dari `dist/` tanpa `tsx`.
> Yang butuh dependensi lengkap hanya perintah perawatan di atas.

`db:seed` menolak password di bawah 8 karakter atau di atas 72 byte. Kalau
ditolak, perbaiki `.env` lalu ulangi.

> **Sebelum lanjut:** simpan `ADMIN_PASSWORD` di tempat aman. Satu-satunya cara
> menyetel ulang password admin adalah mengubah `.env` lalu menjalankan
> `db:seed` lagi — yang berarti butuh akses ke server. Tidak ada fitur "lupa
> password".

---

## 4. Build frontend

**Baca ini sebelum menjalankan build.** `VITE_API_URL` **dibakar ke dalam berkas
hasil build**, bukan dibaca saat situs berjalan. Kalau di-build dengan nilai
bawaan, situs produksi akan selamanya memanggil `http://localhost:5000` — dan di
situs HTTPS, browser memblokirnya sebagai *mixed content*. Gejalanya: halaman
terbuka normal, semua datanya kosong, penyebabnya hanya terlihat di console
browser.

Isi `frontend/.env` **sebelum** build:

```bash
VITE_API_URL=https://api.kelurahan-sidoharjo.example.id
```

Lalu:

```bash
cd frontend
npm ci
npm run build
```

Hasilnya ada di `frontend/dist/`. **Setiap kali alamat backend berubah, build
harus diulang.**

---

## 5. Jalankan backend

```bash
cd backend
npm run build
NODE_ENV=production npm run start
```

Pakai process manager supaya hidup lagi setelah server restart — misalnya
systemd atau pm2.

Contoh unit systemd:

```ini
[Unit]
Description=Backend Kelurahan Sidoharjo
After=network.target postgresql.service

[Service]
WorkingDirectory=/var/www/kelurahan/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

---

## 6. HTTPS dan Nginx

**Ini bagian terpenting dari seluruh panduan.**

Token admin dikirim sebagai `Authorization: Bearer <token>` di setiap
permintaan. Tanpa TLS, token itu melintas sebagai teks polos — siapa pun yang
satu jaringan dengan admin (WiFi kantor, hotspot) bisa membacanya dan langsung
memakainya sebagai admin. Pembatas percobaan login tidak menolong sama sekali,
karena penyerang tidak perlu menebak apa pun.

```nginx
server {
    listen 443 ssl http2;
    server_name kelurahan-sidoharjo.example.id;

    ssl_certificate     /etc/letsencrypt/live/kelurahan-sidoharjo.example.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kelurahan-sidoharjo.example.id/privkey.pem;

    # Halaman situs: hasil build frontend
    root /var/www/kelurahan/frontend/dist;
    index index.html;

    # Routing ditangani React Router, jadi semua path dilempar ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Helmet di backend TIDAK memasang header untuk halaman ini, karena
    # halaman ini tidak keluar dari Express. Perlindungan clickjacking untuk
    # /admin harus dipasang di sini.
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

server {
    listen 443 ssl http2;
    server_name api.kelurahan-sidoharjo.example.id;

    ssl_certificate     /etc/letsencrypt/live/api.kelurahan-sidoharjo.example.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kelurahan-sidoharjo.example.id/privkey.pem;

    # Batas ukuran unggahan: 5 MB per gambar, 5 gambar sekaligus, plus kelonggaran
    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Semua HTTP dialihkan ke HTTPS
server {
    listen 80;
    server_name kelurahan-sidoharjo.example.id api.kelurahan-sidoharjo.example.id;
    return 301 https://$host$request_uri;
}
```

Sertifikat gratis dengan certbot:

```bash
sudo certbot --nginx -d kelurahan-sidoharjo.example.id -d api.kelurahan-sidoharjo.example.id
```

> `proxy_set_header X-Forwarded-For` di atas berpasangan dengan `TRUST_PROXY=true`
> di `.env`. Keduanya harus ada, atau pembatas login membaca IP yang salah.

---

## 7. Folder `uploads/`

Foto berita dan foto pejabat disimpan sebagai berkas di `backend/uploads/`,
hanya path-nya yang masuk database.

**Kalau memakai Railway, Render, atau Vercel di paket gratis: seluruh isi folder
ini terhapus setiap kali deploy ulang.** Barisnya masih ada di database, tapi
gambarnya hilang — yang muncul kotak kosong. Pada platform seperti itu, gambar
harus dipindah ke penyimpanan objek (S3, Cloudflare R2, Supabase Storage).

Di VPS dengan disk sungguhan, folder ini aman. Yang perlu diperhatikan:

- Pastikan pengguna yang menjalankan Node punya hak tulis ke folder itu
- Ikutkan folder ini dalam backup, karena isinya tidak ada di database
- Jalankan penyapu berkas sesekali (lihat Perawatan)

---

## 8. Backup

Dua hal yang harus ikut dicadangkan — database saja tidak cukup:

```bash
# Database
pg_dump -U postgres kelurahan_sidoharjo | gzip > backup-$(date +%F).sql.gz

# Gambar unggahan
tar czf uploads-$(date +%F).tar.gz backend/uploads/
```

Pasang sebagai cron harian, dan **sesekali coba pulihkan ke database kosong.**
Backup yang tidak pernah diuji sering ternyata tidak bisa dipakai.

---

## Perawatan berkala

### Membersihkan berkas yatim

Sejak rute hapus dan ubah ikut membuang berkasnya sendiri, seharusnya tidak ada
berkas yatim baru. Tetap periksa sesekali:

```bash
cd backend
npm run berkas:sapu              # hanya melaporkan, tidak menghapus apa pun
npm run berkas:sapu -- --hapus   # benar-benar menghapus
```

Berkas yang berumur di bawah 24 jam sengaja dilewati, karena gambar yang baru
diunggah tapi beritanya belum disimpan akan terlihat yatim padahal admin masih
mengetik di formulir.

### Memperbarui aplikasi

```bash
git pull
cd backend  && npm ci && npm run db:migrate && npm run build
cd ../frontend && npm ci && npm run build      # pastikan VITE_API_URL sudah benar
sudo systemctl restart kelurahan-backend
```

---

## Kalau ada masalah

| Gejala | Penyebab yang paling sering |
|---|---|
| Situs terbuka, semua data kosong | `CORS_ORIGIN` belum diisi, atau `VITE_API_URL` salah saat build. **Periksa log backend** — ada pesan `CORS menolak asal "..."` yang menyebutkan alamat yang perlu didaftarkan |
| Data kosong, console browser menyebut *mixed content* | Frontend di-build dengan `VITE_API_URL` berawalan `http://` padahal situsnya HTTPS. Perbaiki lalu **build ulang** |
| Login berhasil tapi tiap aksi dibalas 401 | Token lama dari sebelum `issuer`/`audience` dipasang. Logout lalu login lagi |
| Satu orang salah password, semua ikut terkunci | `TRUST_PROXY` masih `false` padahal ada proxy |
| Pembatas login gampang ditembus | `TRUST_PROXY=true` padahal tidak ada proxy, jadi header IP bisa dipalsukan |
| Gambar tidak muncul setelah deploy ulang | Filesystem platformnya sementara, lihat langkah 7 |
| Unggahan gagal untuk berkas besar | `client_max_body_size` di Nginx terlalu kecil |
| `npm run db:migrate` bilang "Tidak ada migrasi baru" padahal tabelnya belum ada | Dipasang dengan `npm ci --omit=dev`, atau dijalankan dari `dist/`. Lihat peringatan di langkah 3 |
| `tsx: command not found` | Sama seperti di atas: pasang ulang dengan `npm ci` penuh |

---

## Yang sudah dijaga aplikasi

Supaya tidak dikerjakan dua kali — ini sudah berjalan tanpa perlu setelan tambahan:

- Pembatas percobaan login (5 kali gagal per 15 menit per IP) dan pembatas umum untuk `/api`
- Header keamanan lewat helmet pada semua balasan backend
- Batas ukuran body JSON, panjang deskripsi, jumlah gambar, dan `?limit` pada paginasi
- Aturan integritas di database: tidak boleh teks kosong, angka penduduk tidak boleh negatif, maksimal 5 gambar per kabar
- Sesi bisa dicabut dari sisi server, jadi "keluar dari semua perangkat" benar-benar mematikan token
- Unggahan diperiksa isinya (magic bytes), bukan hanya tipe yang diakui pengirim
- Berkas ikut terhapus saat berita atau jabatan dihapus

Yang **tidak** dijaga aplikasi dan harus datang dari server: HTTPS, hak akses
database, backup, dan header keamanan untuk halaman frontend.
