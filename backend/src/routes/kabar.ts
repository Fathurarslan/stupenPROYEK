import { Router } from "express";
import pool from "../db/pool.js";
import { adminSaatIni, wajibLogin } from "../middleware/autentikasi.js";
import type { Kabar, KabarGambar, KabarLengkap } from "../types.js";
import { KesalahanInput } from "../utils/kesalahan.js";
import {
    ambilBody,
    ambilId,
    ambilJenisKabar,
    bulatTakNegatif,
    tanggalOpsional,
    teksOpsional,
    teksWajib,
} from "../utils/validasi.js";

const router = Router();

// Dipakai bersama oleh rute daftar dan rute detail
const PILIH_KABAR_LENGKAP = `
    SELECT k.*,
      COALESCE(
        json_agg(
          json_build_object('id', kg.id, 'gambar_url', kg.gambar_url, 'urutan', kg.urutan)
          ORDER BY kg.urutan
        ) FILTER (WHERE kg.id IS NOT NULL),
        '[]'
      ) AS gambar_lain
    FROM kabar k
    LEFT JOIN kabar_gambar kg ON kg.kabar_id = k.id
`;

function daftarGambar(nilai: unknown): string[] {
    if (nilai === undefined || nilai === null) {
        return [];
    }
    if (!Array.isArray(nilai)) {
        throw new KesalahanInput("Kolom gambar_lain harus berupa array berisi URL gambar");
    }
    return nilai.map((url, i) => teksWajib(url, `gambar_lain[${i}]`, 255));
}

// GET /api/kabar?jenis=berita&limit=10&offset=0
router.get("/", async (req, res) => {
    const nilaiParam: unknown[] = [];
    let filter = "";

    if (req.query.jenis !== undefined) {
        nilaiParam.push(ambilJenisKabar(req.query.jenis));
        filter = `WHERE k.jenis = $${nilaiParam.length}`;
    }

    const limit = req.query.limit === undefined ? 50 : bulatTakNegatif(req.query.limit, "limit");
    const offset = req.query.offset === undefined ? 0 : bulatTakNegatif(req.query.offset, "offset");
    nilaiParam.push(limit, offset);

    const hasil = await pool.query<KabarLengkap>(
        `${PILIH_KABAR_LENGKAP}
         ${filter}
         GROUP BY k.id
         ORDER BY k.tanggal_upload DESC
         LIMIT $${nilaiParam.length - 1} OFFSET $${nilaiParam.length}`,
        nilaiParam
    );

    const jumlah = await pool.query<{ total: string }>(
        filter === ""
            ? "SELECT count(*) AS total FROM kabar"
            : "SELECT count(*) AS total FROM kabar k WHERE k.jenis = $1",
        filter === "" ? [] : [nilaiParam[0]]
    );

    res.json({
        data: hasil.rows,
        total: Number(jumlah.rows[0]?.total ?? 0),
        limit,
        offset,
    });
});

// GET /api/kabar/:id
router.get("/:id", async (req, res) => {
    const id = ambilId(req.params.id);

    const hasil = await pool.query<KabarLengkap>(
        `${PILIH_KABAR_LENGKAP} WHERE k.id = $1 GROUP BY k.id`,
        [id]
    );

    const kabar = hasil.rows[0];
    if (!kabar) {
        res.status(404).json({ pesan: `Kabar dengan id ${id} tidak ditemukan` });
        return;
    }
    res.json(kabar);
});

// POST /api/kabar
router.post("/", wajibLogin, async (req, res) => {
    const body = ambilBody(req.body);
    const jenis = ambilJenisKabar(body.jenis);
    const judul = teksWajib(body.judul, "judul", 200);
    const gambar_utama = teksWajib(body.gambar_utama, "gambar_utama", 255);
    const ringkasan = teksOpsional(body.ringkasan, "ringkasan", 500);
    const deskripsi_lengkap = teksWajib(body.deskripsi_lengkap, "deskripsi_lengkap");
    const gambar_lain = daftarGambar(body.gambar_lain);
    const tanggal_upload = tanggalOpsional(body.tanggal_upload, "tanggal_upload");

    // Penulis diambil dari token, bukan dari body, supaya tidak bisa dipalsukan client
    const admin_id = adminSaatIni(req).id;

    // Kabar dan gambar tambahannya harus masuk bersama-sama, jadi dibungkus transaksi
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const hasil = await client.query<Kabar>(
            `INSERT INTO kabar (jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, admin_id, tanggal_upload)
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamp, NOW()))
             RETURNING *`,
            [jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, admin_id, tanggal_upload]
        );

        const kabar = hasil.rows[0];
        if (!kabar) {
            throw new Error("INSERT kabar tidak mengembalikan baris");
        }

        const gambarTersimpan: KabarGambar[] = [];
        for (const [urutan, gambar_url] of gambar_lain.entries()) {
            const tambahan = await client.query<KabarGambar>(
                `INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [kabar.id, gambar_url, urutan]
            );
            if (tambahan.rows[0]) {
                gambarTersimpan.push(tambahan.rows[0]);
            }
        }

        await client.query("COMMIT");
        res.status(201).json({ ...kabar, gambar_lain: gambarTersimpan });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

// PUT /api/kabar/:id
// Kalau body memuat gambar_lain, seluruh galeri diganti dengan daftar itu.
// Kalau gambar_lain tidak dikirim sama sekali, galeri dibiarkan apa adanya.
router.put("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const body = ambilBody(req.body);
    const jenis = ambilJenisKabar(body.jenis);
    const judul = teksWajib(body.judul, "judul", 200);
    const gambar_utama = teksWajib(body.gambar_utama, "gambar_utama", 255);
    const ringkasan = teksOpsional(body.ringkasan, "ringkasan", 500);
    const deskripsi_lengkap = teksWajib(body.deskripsi_lengkap, "deskripsi_lengkap");
    const tanggal_upload = tanggalOpsional(body.tanggal_upload, "tanggal_upload");
    const gantiGaleri = body.gambar_lain !== undefined;
    const gambar_lain = gantiGaleri ? daftarGambar(body.gambar_lain) : [];

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const hasil = await client.query<Kabar>(
            `UPDATE kabar
             SET jenis = $1, judul = $2, gambar_utama = $3, ringkasan = $4,
                 deskripsi_lengkap = $5, tanggal_upload = COALESCE($6::timestamp, tanggal_upload)
             WHERE id = $7
             RETURNING *`,
            [jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, tanggal_upload, id]
        );

        const kabar = hasil.rows[0];
        if (!kabar) {
            await client.query("ROLLBACK");
            res.status(404).json({ pesan: `Kabar dengan id ${id} tidak ditemukan` });
            return;
        }

        const gambarTersimpan: KabarGambar[] = [];
        if (gantiGaleri) {
            // Dikosongkan dulu supaya trigger batas 5 menghitung dari nol,
            // bukan dari jumlah gambar lama ditambah yang baru
            await client.query("DELETE FROM kabar_gambar WHERE kabar_id = $1", [id]);

            for (const [urutan, gambar_url] of gambar_lain.entries()) {
                const tambahan = await client.query<KabarGambar>(
                    `INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
                     VALUES ($1, $2, $3)
                     RETURNING *`,
                    [id, gambar_url, urutan]
                );
                if (tambahan.rows[0]) {
                    gambarTersimpan.push(tambahan.rows[0]);
                }
            }
        }

        await client.query("COMMIT");
        res.json(gantiGaleri ? { ...kabar, gambar_lain: gambarTersimpan } : kabar);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

// DELETE /api/kabar/:id  (gambar tambahan ikut terhapus lewat ON DELETE CASCADE)
router.delete("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query("DELETE FROM kabar WHERE id = $1", [id]);

    if (hasil.rowCount === 0) {
        res.status(404).json({ pesan: `Kabar dengan id ${id} tidak ditemukan` });
        return;
    }
    res.status(204).send();
});

// POST /api/kabar/:id/gambar  -> tambah satu gambar tambahan
// Trigger trg_maksimal_gambar akan menolak kalau sudah ada 5 gambar
router.post("/:id/gambar", wajibLogin, async (req, res) => {
    const kabar_id = ambilId(req.params.id);
    const body = ambilBody(req.body);
    const gambar_url = teksWajib(body.gambar_url, "gambar_url", 255);
    const urutan = body.urutan === undefined ? 0 : bulatTakNegatif(body.urutan, "urutan");

    const hasil = await pool.query<KabarGambar>(
        `INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [kabar_id, gambar_url, urutan]
    );
    res.status(201).json(hasil.rows[0]);
});

// DELETE /api/kabar/gambar/:idGambar  -> hapus satu gambar tambahan saja
router.delete("/gambar/:idGambar", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.idGambar, "idGambar");
    const hasil = await pool.query("DELETE FROM kabar_gambar WHERE id = $1", [id]);

    if (hasil.rowCount === 0) {
        res.status(404).json({ pesan: `Gambar dengan id ${id} tidak ditemukan` });
        return;
    }
    res.status(204).send();
});

export default router;
