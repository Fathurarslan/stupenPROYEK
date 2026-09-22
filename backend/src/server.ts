import express from "express";
import cors from "cors";
import pool from "./db/pool.js";
import { penangananError, rute404 } from "./middleware/penangananError.js";
import { FOLDER_UNGGAH } from "./middleware/unggah.js";
import authRouter from "./routes/auth.js";
import kabarRouter from "./routes/kabar.js";
import unggahRouter from "./routes/unggah.js";
import pendudukRouter from "./routes/penduduk.js";
import strukturJabatanRouter from "./routes/strukturJabatan.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend stupen sedang berjalan!");
});

// Cek apakah backend benar-benar tersambung ke database kelurahan_sidoharjo
app.get("/api/health", async (req, res) => {
    const hasil = await pool.query<{ waktu: Date; nama_db: string }>(
        "SELECT NOW() AS waktu, current_database() AS nama_db"
    );
    res.json({
        status: "ok",
        database: hasil.rows[0]?.nama_db,
        waktu: hasil.rows[0]?.waktu,
    });
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
