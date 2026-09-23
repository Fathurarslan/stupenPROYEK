import express from "express";
import pool from "./db/pool.js";
import { batasUmum } from "./middleware/batasPermintaan.js";
import { headerKeamanan, korsTerbatas } from "./middleware/keamanan.js";
import { penangananError, rute404 } from "./middleware/penangananError.js";
import { FOLDER_UNGGAH } from "./middleware/unggah.js";
import authRouter from "./routes/auth.js";
import kabarRouter from "./routes/kabar.js";
import unggahRouter from "./routes/unggah.js";
import pendudukRouter from "./routes/penduduk.js";
import strukturJabatanRouter from "./routes/strukturJabatan.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Diatur lewat .env karena salah setelan justru membuka celah. Dipasang
// padahal tidak di belakang proxy: header X-Forwarded-For bisa dipalsukan
// untuk menembus rate limit. Tidak dipasang padahal ada proxy: semua
// pengunjung terbaca sebagai satu IP dan ikut terkunci bersama-sama.
if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

app.use(headerKeamanan);
app.use(korsTerbatas);

// Batasnya sama dengan bawaan body-parser, ditulis eksplisit supaya terbaca
// dan tidak ikut berubah kalau bawaan pustakanya suatu saat berganti.
// Unggahan gambar tidak lewat sini, itu ditangani multer dengan batas 5 MB.
app.use(express.json({ limit: "100kb" }));

// Dipasang sebelum rute mana pun supaya permintaan berlebih ditolak sebelum
// menyentuh database. /upload tidak ikut dibatasi, jadi halaman dengan banyak
// gambar tidak menghabiskan jatah pengunjungnya.
app.use("/api", batasUmum);

app.get("/", (req, res) => {
    res.send("Backend stupen sedang berjalan!");
});

// Membuktikan backend masih tersambung ke database. Rute ini terbuka untuk
// umum supaya bisa dipakai pemantau uptime, jadi nama databasenya sengaja
// tidak disebut -- itu petunjuk gratis bagi penyerang dan tidak dibutuhkan
// siapa pun selain saat mengembangkan di mesin sendiri.
app.get("/api/health", async (req, res) => {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
});

// Gambar hasil unggahan disajikan langsung dari disk.
// nosniff + Content-Disposition: inline mencegah browser menebak-nebak tipe berkas.
// Nama berkas berupa UUID yang tidak pernah dipakai ulang, jadi aman di-cache lama.
app.use(
    "/upload",
    express.static(FOLDER_UNGGAH, {
        index: false,
        dotfiles: "deny",
        setHeaders: (res) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Content-Disposition", "inline");
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
    })
);

app.use("/api/auth", authRouter);
app.use("/api/unggah", unggahRouter);
app.use("/api/kabar", kabarRouter);
app.use("/api/struktur-jabatan", strukturJabatanRouter);
app.use("/api/penduduk", pendudukRouter);

// Dua middleware ini harus paling bawah, setelah semua rute terdaftar
app.use(rute404);
app.use(penangananError);

app.listen(PORT, () => {
    console.log(`Server sedang berjalan di http://localhost:${PORT}`);
});
