import rateLimit from "express-rate-limit";

// Pembatas jumlah permintaan per IP.
//
// Yang dilindungi bukan cuma tebakan password. bcrypt.compare berjalan di
// threadpool libuv yang bawaannya hanya 4 thread, dan threadpool yang sama
// dipakai semua operasi berkas. Tanpa pembatas ini, empat permintaan login
// bersamaan sudah cukup membuat penyajian gambar di /upload ikut tersendat,
// tanpa penyerang perlu menebak password sama sekali.
//
// Hitungannya disimpan di memori, jadi ikut hilang saat server restart dan
// tidak dibagi antar instance. Untuk satu server ini sudah memadai.

const LIMA_BELAS_MENIT = 15 * 60 * 1000;

// Jaring pengaman umum untuk seluruh /api. Sengaja longgar: hanya mencegah
// satu klien membanjiri server, pemakaian normal tidak akan menyentuhnya.
// Gambar di /upload tidak lewat sini, jadi halaman dengan banyak foto tidak
// ikut menghabiskan jatah.
export const batasUmum = rateLimit({
    windowMs: LIMA_BELAS_MENIT,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { pesan: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi." },
});

// Khusus login, jauh lebih ketat. skipSuccessfulRequests membuat login yang
// berhasil tidak ikut dihitung, jadi admin yang sering keluar-masuk tidak
// pernah mengunci dirinya sendiri: yang dibatasi hanya percobaan yang gagal.
//
// Kuncinya per IP saja, bukan per email. Menambah email sebagai kunci memang
// menutup penyerang ber-IP banyak, tapi membuka jalan sebaliknya, yaitu orang
// luar sengaja mengunci akun admin dengan membanjiri login ke email itu.
export const batasLogin = rateLimit({
    windowMs: LIMA_BELAS_MENIT,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { pesan: "Terlalu banyak percobaan login gagal. Coba lagi dalam 15 menit." },
});

// Ganti password dan ganti email sudah di balik wajibLogin, tapi keduanya
// tetap memanggil bcrypt.compare, jadi tetap perlu dibatasi.
export const batasSensitif = rateLimit({
    windowMs: LIMA_BELAS_MENIT,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { pesan: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
});
