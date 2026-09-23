import pool from "../db/pool.js";
import { hapusBerkas, namaBerkasDariUrl } from "../middleware/unggah.js";

// Pembersih berkas unggahan.
//
// Sebelum ada berkas ini, menghapus berita atau mengganti foto pejabat hanya
// mengubah barisnya di database; gambarnya tetap tinggal di disk selamanya.
// Lama-lama disk penuh, dan saat itu terjadi PostgreSQL berhenti menulis dan
// seluruh situs ikut mati, bukan cuma unggahannya.

// Query yang sama dipakai untuk "masih dipakai?" dan untuk penyapuan berkala,
// jadi definisi "sedang dipakai" cuma ada di satu tempat. Kalau nanti ada tabel
// baru yang menyimpan gambar, cukup tambahkan satu UNION di sini.
const URL_TERPAKAI = `
    SELECT gambar_utama AS url FROM kabar
    UNION SELECT gambar_url FROM kabar_gambar
    UNION SELECT foto FROM struktur_jabatan WHERE foto IS NOT NULL
`;

/** Semua URL gambar yang sedang dirujuk baris mana pun di database. */
export async function urlYangTerpakai(): Promise<Set<string>> {
    const hasil = await pool.query<{ url: string }>(URL_TERPAKAI);
    return new Set(hasil.rows.map((r) => r.url));
}

/** Apakah satu URL masih dirujuk baris mana pun. */
export async function berkasSedangDipakai(url: string): Promise<boolean> {
    const hasil = await pool.query(`SELECT 1 FROM (${URL_TERPAKAI}) t WHERE t.url = $1 LIMIT 1`, [
        url,
    ]);
    return hasil.rowCount !== 0;
}

/**
 * Hapus berkas dari daftar URL, tapi lewati yang ternyata masih dirujuk baris
 * lain. Pemeriksaannya ke database, bukan diandaikan: satu gambar yang
 * kebetulan dipakai di dua tempat tidak boleh ikut terhapus saat salah satunya
 * dibuang.
 *
 * Selalu dipanggil SETELAH transaksinya commit. Kalau dipanggil di dalam
 * transaksi lalu transaksinya batal, berkasnya sudah telanjur hilang sementara
 * barisnya masih ada di database.
 */
export async function hapusBerkasTakTerpakai(urls: (string | null | undefined)[]): Promise<number> {
    const unik = [...new Set(urls.filter((u): u is string => typeof u === "string" && u !== ""))];
    if (unik.length === 0) {
        return 0;
    }

    const masihAda = await pool.query<{ url: string }>(
        `SELECT t.url FROM (${URL_TERPAKAI}) t WHERE t.url = ANY($1)`,
        [unik]
    );
    const terpakai = new Set(masihAda.rows.map((r) => r.url));

    const nama = unik
        .filter((u) => !terpakai.has(u))
        .map(namaBerkasDariUrl)
        .filter((n): n is string => n !== null);

    await Promise.all(nama.map(hapusBerkas));
    return nama.length;
}
