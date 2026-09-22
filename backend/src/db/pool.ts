import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

// Ambil variabel dari .env, langsung berhenti kalau ada yang belum diisi
function wajib(nama: string): string {
    const nilai = process.env[nama];
    if (!nilai) {
        throw new Error(`Variabel ${nama} belum diisi di file backend/.env`);
    }
    return nilai;
}

const pool = new Pool({
    host: wajib("DB_HOST"),
    port: Number(wajib("DB_PORT")),
    user: wajib("DB_USER"),
    password: wajib("DB_PASSWORD"),
    database: wajib("DB_NAME"),
});

pool.on("error", (err) => {
    console.error("Koneksi database bermasalah:", err.message);
});

export default pool;
