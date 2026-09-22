import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pool from "./pool.js";

// Penjalan migrasi sederhana: setiap file .sql di folder migrations dijalankan
// sekali saja, urut nama file, dan dicatat di tabel migrasi.
// SCHEMA.sql tidak disentuh sama sekali, itu tetap jadi catatan bentuk awal.

const FOLDER = join(dirname(fileURLToPath(import.meta.url)), "migrations");

await pool.query(`
    CREATE TABLE IF NOT EXISTS migrasi (
        nama VARCHAR(255) PRIMARY KEY,
        dijalankan_pada TIMESTAMP NOT NULL DEFAULT NOW()
    )
`);

const sudah = await pool.query<{ nama: string }>("SELECT nama FROM migrasi");
const daftarSudah = new Set(sudah.rows.map((r) => r.nama));

const berkas = (await readdir(FOLDER)).filter((n) => n.endsWith(".sql")).sort();

let dijalankan = 0;
for (const nama of berkas) {
    if (daftarSudah.has(nama)) {
        console.log(`  lewat   ${nama} (sudah pernah dijalankan)`);
        continue;
    }

    const sql = await readFile(join(FOLDER, nama), "utf8");
    const client = await pool.connect();
    try {
        // Satu migrasi = satu transaksi, kalau gagal di tengah tidak ada yang tersisa
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO migrasi (nama) VALUES ($1)", [nama]);
        await client.query("COMMIT");
        console.log(`  jalan   ${nama}`);
        dijalankan++;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  GAGAL   ${nama}`);
        throw err;
    } finally {
        client.release();
    }
}

console.log(dijalankan === 0 ? "Tidak ada migrasi baru." : `${dijalankan} migrasi dijalankan.`);
await pool.end();
