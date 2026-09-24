import { Router } from "express";
import pool from "../db/pool.js";
import { wajibLogin } from "../middleware/autentikasi.js";
import type { StrukturJabatan } from "../types.js";
import { hapusBerkasTakTerpakai } from "../utils/berkas.js";
import {
    ambilBody,
    ambilId,
    ambilTingkatJabatan,
    teksOpsional,
    teksWajib,
    urlUnggahanOpsional,
} from "../utils/validasi.js";

const router = Router();

// Urut tingkat dulu, baru id: tingkat 1 (Kepala Kelurahan) selalu di depan,
// lalu tingkat 2, lalu tingkat 3, sesuai urutan kartu di halaman publik.
const URUTAN = "ORDER BY tingkat ASC, id ASC";

// Kolom yang boleh dilihat publik, juga dipakai untuk RETURNING sesudah
// INSERT/UPDATE. Ditulis satu per satu, bukan SELECT * atau RETURNING *,
// supaya kolom yang ditambahkan nanti tidak otomatis ikut terkirim. created_at dan updated_at sengaja tidak masuk: tidak dipakai
// frontend, dan updated_at membocorkan kapan sebuah data diam-diam diubah.
// nip tetap ditampilkan, sesuai kelaziman situs pemerintahan.
const KOLOM_PUBLIK = "id, foto, nama_jabatan, nama_pejabat, nip, tingkat";

type StrukturPublik = Omit<StrukturJabatan, "created_at" | "updated_at">;

// Kode error PostgreSQL untuk pelanggaran unique index. Muncul kalau ada dua
// request menambah tingkat 1 bersamaan dan lolos dari pemeriksaan di bawah.
const KODE_DUPLIKAT = "23505";
const PESAN_TINGKAT_SATU =
    "Tingkat 1 hanya boleh diisi satu jabatan. Hapus atau ubah yang sudah ada terlebih dahulu.";

// Tingkat 1 dibatasi satu baris saja. abaikanId dipakai saat UPDATE supaya
// baris yang sedang diubah tidak dianggap bentrok dengan dirinya sendiri.
async function tingkatSatuSudahTerisi(abaikanId?: number): Promise<boolean> {
    const hasil = await pool.query(
        "SELECT 1 FROM struktur_jabatan WHERE tingkat = 1 AND ($1::int IS NULL OR id <> $1) LIMIT 1",
        [abaikanId ?? null]
    );
    return hasil.rowCount !== 0;
}

// GET /api/struktur-jabatan
router.get("/", async (req, res) => {
    const hasil = await pool.query<StrukturPublik>(
        `SELECT ${KOLOM_PUBLIK} FROM struktur_jabatan ${URUTAN}`
    );
    res.json(hasil.rows);
});

// GET /api/struktur-jabatan/:id
router.get("/:id", async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query<StrukturPublik>(
        `SELECT ${KOLOM_PUBLIK} FROM struktur_jabatan WHERE id = $1`,
        [id]
    );

    const jabatan = hasil.rows[0];
    if (!jabatan) {
        res.status(404).json({ pesan: `Jabatan dengan id ${id} tidak ditemukan` });
        return;
    }
    res.json(jabatan);
});

// POST /api/struktur-jabatan
router.post("/", wajibLogin, async (req, res) => {
    const body = ambilBody(req.body);
    const foto = urlUnggahanOpsional(body.foto, "foto");
    const nama_jabatan = teksWajib(body.nama_jabatan, "nama_jabatan", 100);
    const nama_pejabat = teksWajib(body.nama_pejabat, "nama_pejabat", 100);
    const nip = teksOpsional(body.nip, "nip", 50);
    const tingkat = ambilTingkatJabatan(body.tingkat);

    if (tingkat === 1 && (await tingkatSatuSudahTerisi())) {
        res.status(409).json({ pesan: PESAN_TINGKAT_SATU });
        return;
    }

    try {
        const hasil = await pool.query<StrukturPublik>(
            `INSERT INTO struktur_jabatan (foto, nama_jabatan, nama_pejabat, nip, tingkat)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${KOLOM_PUBLIK}`,
            [foto, nama_jabatan, nama_pejabat, nip, tingkat]
        );
        res.status(201).json(hasil.rows[0]);
    } catch (err) {
        if (err instanceof Error && (err as { code?: string }).code === KODE_DUPLIKAT) {
            res.status(409).json({ pesan: PESAN_TINGKAT_SATU });
            return;
        }
        throw err;
    }
});

// PUT /api/struktur-jabatan/:id
router.put("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const body = ambilBody(req.body);
    const foto = urlUnggahanOpsional(body.foto, "foto");
    const nama_jabatan = teksWajib(body.nama_jabatan, "nama_jabatan", 100);
    const nama_pejabat = teksWajib(body.nama_pejabat, "nama_pejabat", 100);
    const nip = teksOpsional(body.nip, "nip", 50);
    const tingkat = ambilTingkatJabatan(body.tingkat);

    if (tingkat === 1 && (await tingkatSatuSudahTerisi(id))) {
        res.status(409).json({ pesan: PESAN_TINGKAT_SATU });
        return;
    }

    // Dibaca sebelum diubah, bukan lewat RETURNING, karena RETURNING pada
    // UPDATE memberi nilai sesudah penggantian. Kalaupun ada dua permintaan
    // bersamaan dan nilai ini jadi basi, tidak berbahaya: hapusBerkasTakTerpakai
    // memeriksa ulang ke database sebelum benar-benar menghapus.
    const sebelum = await pool.query<{ foto: string | null }>(
        "SELECT foto FROM struktur_jabatan WHERE id = $1",
        [id]
    );
    const fotoLama = sebelum.rows[0]?.foto ?? null;

    let hasil;
    try {
        hasil = await pool.query<StrukturPublik>(
            `UPDATE struktur_jabatan
             SET foto = $1, nama_jabatan = $2, nama_pejabat = $3, nip = $4, tingkat = $5
             WHERE id = $6
             RETURNING ${KOLOM_PUBLIK}`,
            [foto, nama_jabatan, nama_pejabat, nip, tingkat, id]
        );
    } catch (err) {
        if (err instanceof Error && (err as { code?: string }).code === KODE_DUPLIKAT) {
            res.status(409).json({ pesan: PESAN_TINGKAT_SATU });
            return;
        }
        throw err;
    }

    const jabatan = hasil.rows[0];
    if (!jabatan) {
        res.status(404).json({ pesan: `Jabatan dengan id ${id} tidak ditemukan` });
        return;
    }

    res.json(jabatan);

    // Foto pengganti berarti yang lama tidak dirujuk siapa pun lagi
    if (fotoLama && fotoLama !== jabatan.foto) {
        await hapusBerkasTakTerpakai([fotoLama]);
    }
});

// DELETE /api/struktur-jabatan/:id
router.delete("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query<{ foto: string | null }>(
        "DELETE FROM struktur_jabatan WHERE id = $1 RETURNING foto",
        [id]
    );

    if (hasil.rowCount === 0) {
        res.status(404).json({ pesan: `Jabatan dengan id ${id} tidak ditemukan` });
        return;
    }
    res.status(204).send();

    // Barisnya sudah hilang, jadi fotonya tidak akan pernah dirujuk lagi
    await hapusBerkasTakTerpakai([hasil.rows[0]?.foto]);
});

export default router;
