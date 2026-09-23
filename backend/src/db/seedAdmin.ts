import bcrypt from "bcrypt";
import { KesalahanInput } from "../utils/kesalahan.js";
import { ambilEmail, ambilPassword } from "../utils/validasi.js";
import pool from "./pool.js";

// .env sudah dimuat oleh pool.ts saat modulnya diimpor di atas

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error("Isi dulu ADMIN_EMAIL dan ADMIN_PASSWORD di backend/.env");
    process.exit(1);
}

// Password admin yang pertama justru yang paling penting, jadi diperiksa
// dengan aturan yang sama seperti saat admin mengganti passwordnya sendiri.
// Sebelumnya berkas ini melewati semua pemeriksaan: password empat huruf pun
// diterima tanpa sepatah kata.
let email: string;
let password: string;
try {
    email = ambilEmail(process.env.ADMIN_EMAIL);
    password = ambilPassword(process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD");
} catch (err) {
    console.error(err instanceof KesalahanInput ? err.message : err);
    process.exit(1);
}

// Hanya ada satu admin, jadi kalau email-nya sudah ada cukup timpa password-nya
const password_hash = await bcrypt.hash(password, 10);

const hasil = await pool.query<{ id: number; email: string }>(
    `INSERT INTO admin (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
     RETURNING id, email`,
    [email, password_hash]
);

console.log("Admin siap dipakai login:", hasil.rows[0]);

await pool.end();
