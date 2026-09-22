import bcrypt from "bcrypt";
import pool from "./pool.js";

// .env sudah dimuat oleh pool.ts saat modulnya diimpor di atas

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
    console.error("Isi dulu ADMIN_EMAIL dan ADMIN_PASSWORD di backend/.env");
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
