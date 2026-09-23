import cors from "cors";
import helmet from "helmet";

// Header keamanan dan aturan CORS. Dikumpulkan di sini, bukan berserakan di
// server.ts, supaya aturannya bisa dibaca sekaligus dan diuji terpisah.

// Header keamanan untuk balasan Express.
//
// Perlu diingat: yang dilindungi hanya balasan dari Express, yaitu JSON dan
// gambar /upload. Halaman situsnya sendiri dilayani Vite dari tempat lain,
// jadi perlindungan clickjacking untuk halaman /admin harus diatur di tempat
// frontend dihosting, bukan di sini.
export const headerKeamanan = helmet({
    // WAJIB dilonggarkan. Gambar /upload disajikan dari port backend sementara
    // situsnya berjalan di port lain, dan bawaan helmet (same-origin) akan
    // membuat semua gambar berhenti tampil.
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // CSP bawaan helmet dirancang untuk halaman HTML. Express di sini hanya
    // mengirim JSON dan gambar, jadi dikunci rapat saja: tidak ada skrip atau
    // gaya apa pun yang perlu dimuat dari balasannya.
    contentSecurityPolicy: {
        useDefaults: false,
        directives: {
            defaultSrc: ["'none'"],
            frameAncestors: ["'none'"],
        },
    },
});

// Beberapa alamat pengembangan dimuat sekaligus: 5173 untuk "npm run dev",
// 4173 untuk "npm run preview", beserta padanan 127.0.0.1 karena browser
// memperlakukan localhost dan 127.0.0.1 sebagai asal yang berbeda.
const ASAL_BAWAAN = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
];

export const ASAL_DIIZINKAN = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((a) => a.trim()).filter((a) => a !== "")
    : ASAL_BAWAAN;

// Dipisah dari konfigurasi cors() supaya bisa diuji tanpa menyalakan server.
export function asalDiizinkan(asal: string | undefined): boolean {
    // asal kosong berarti permintaannya bukan dari browser: curl, Postman,
    // health check. CORS memang tidak mengatur yang seperti itu, jadi
    // menolaknya tidak menambah keamanan sedikit pun.
    if (!asal || ASAL_DIIZINKAN.includes(asal)) {
        return true;
    }
    // Tanpa catatan ini, penolakan CORS tidak meninggalkan jejak apa pun di
    // sisi server dan hanya terlihat di console browser. Ditulis supaya salah
    // setelan langsung ketahuan, bukan jadi tebak-tebakan.
    console.warn(
        `CORS menolak asal "${asal}". Kalau itu memang situs Anda, tambahkan ke CORS_ORIGIN di backend/.env`
    );
    return false;
}

export const korsTerbatas = cors({
    origin: (asal, lanjut) => lanjut(null, asalDiizinkan(asal)),
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // hasil preflight disimpan sehari, mengurangi OPTIONS bolak-balik
});
