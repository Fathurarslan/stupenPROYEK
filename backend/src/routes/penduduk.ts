import { Router } from "express";
import pool from "../db/pool.js";
import { wajibLogin } from "../middleware/autentikasi.js";
import type { Penduduk } from "../types.js";
import { ambilBody, ambilId, bulatTakNegatif } from "../utils/validasi.js";

const router = Router();

// Kolom total tidak pernah dikirim ke database, PostgreSQL menghitungnya sendiri
// lewat GENERATED ALWAYS AS (laki_laki + perempuan) STORED

// Kolom yang boleh dilihat publik, juga dipakai untuk RETURNING sesudah
// INSERT/UPDATE. Ditulis satu per satu, bukan SELECT * atau RETURNING *,
// supaya kolom yang ditambahkan nanti tidak otomatis ikut terpublikasi.
// updated_at tidak dipakai frontend; kalau suatu saat ingin menampilkan
// "data per tanggal sekian" di beranda, kolom ini tinggal dimasukkan lagi.
const KOLOM_PUBLIK = "id, laki_laki, perempuan, total";

type PendudukPublik = Omit<Penduduk, "updated_at">;

// Batas atas per kolom. Satu kelurahan umumnya berpenduduk puluhan ribu, jadi
// sejuta sudah jauh di atas kebutuhan tapi tetap menolak angka mustahil yang
// akan tampil apa adanya di beranda. Batas ini juga membuat kolom total
// (laki_laki + perempuan, INTEGER) mustahil meluap.
// Harus sama dengan CHECK di db/migrations/004_batas_penduduk.sql.
const MAKS_PENDUDUK = 1_000_000;

// Tabel penduduk hanya boleh berisi satu baris (unique index penduduk_hanya_satu
// di migrasi 003), jadi tidak ada daftar atau riwayat yang perlu disajikan.
// Dulu ada GET / dan GET /:id; keduanya dihapus karena hanya mengulang isi
// rute ini dan menambah permukaan API publik tanpa guna.

// GET /api/penduduk/terbaru  -> dipakai di beranda dan halaman admin
router.get("/terbaru", async (req, res) => {
    const hasil = await pool.query<PendudukPublik>(
        `SELECT ${KOLOM_PUBLIK} FROM penduduk ORDER BY id DESC LIMIT 1`
    );

    const penduduk = hasil.rows[0];
    if (!penduduk) {
        res.status(404).json({ pesan: "Data penduduk belum diisi" });
        return;
    }
    res.json(penduduk);
});

function ambilJumlah(body: Record<string, unknown>) {
    return {
        laki_laki: bulatTakNegatif(body.laki_laki, "laki_laki", MAKS_PENDUDUK),
        perempuan: bulatTakNegatif(body.perempuan, "perempuan", MAKS_PENDUDUK),
    };
}

// POST /api/penduduk
router.post("/", wajibLogin, async (req, res) => {
    const { laki_laki, perempuan } = ambilJumlah(ambilBody(req.body));

    const hasil = await pool.query<PendudukPublik>(
        `INSERT INTO penduduk (laki_laki, perempuan)
         VALUES ($1, $2)
         RETURNING ${KOLOM_PUBLIK}`,
        [laki_laki, perempuan]
    );
    res.status(201).json(hasil.rows[0]);
});

// PUT /api/penduduk/:id
router.put("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const { laki_laki, perempuan } = ambilJumlah(ambilBody(req.body));

    const hasil = await pool.query<PendudukPublik>(
        `UPDATE penduduk
         SET laki_laki = $1, perempuan = $2
         WHERE id = $3
         RETURNING ${KOLOM_PUBLIK}`,
        [laki_laki, perempuan, id]
    );

    const penduduk = hasil.rows[0];
    if (!penduduk) {
        res.status(404).json({ pesan: `Data penduduk dengan id ${id} tidak ditemukan` });
        return;
    }
    res.json(penduduk);
});

// DELETE /api/penduduk/:id
router.delete("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query("DELETE FROM penduduk WHERE id = $1", [id]);

    if (hasil.rowCount === 0) {
        res.status(404).json({ pesan: `Data penduduk dengan id ${id} tidak ditemukan` });
        return;
    }
    res.status(204).send();
});

export default router;
