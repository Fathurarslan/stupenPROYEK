import { Router } from "express";
import pool from "../db/pool.js";
import { wajibLogin } from "../middleware/autentikasi.js";
import type { StrukturJabatan } from "../types.js";
import { ambilBody, ambilId, teksOpsional, teksWajib } from "../utils/validasi.js";

const router = Router();

// GET /api/struktur-jabatan
router.get("/", async (req, res) => {
    const hasil = await pool.query<StrukturJabatan>(
        "SELECT * FROM struktur_jabatan ORDER BY id ASC"
    );
    res.json(hasil.rows);
});

// GET /api/struktur-jabatan/:id
router.get("/:id", async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query<StrukturJabatan>(
        "SELECT * FROM struktur_jabatan WHERE id = $1",
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
    const foto = teksOpsional(body.foto, "foto", 255);
    const nama_jabatan = teksWajib(body.nama_jabatan, "nama_jabatan", 100);
    const nama_pejabat = teksWajib(body.nama_pejabat, "nama_pejabat", 100);
    const nip = teksOpsional(body.nip, "nip", 50);

    const hasil = await pool.query<StrukturJabatan>(
        `INSERT INTO struktur_jabatan (foto, nama_jabatan, nama_pejabat, nip)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [foto, nama_jabatan, nama_pejabat, nip]
    );
    res.status(201).json(hasil.rows[0]);
});

// PUT /api/struktur-jabatan/:id
router.put("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const body = ambilBody(req.body);
    const foto = teksOpsional(body.foto, "foto", 255);
    const nama_jabatan = teksWajib(body.nama_jabatan, "nama_jabatan", 100);
    const nama_pejabat = teksWajib(body.nama_pejabat, "nama_pejabat", 100);
    const nip = teksOpsional(body.nip, "nip", 50);

    const hasil = await pool.query<StrukturJabatan>(
        `UPDATE struktur_jabatan
         SET foto = $1, nama_jabatan = $2, nama_pejabat = $3, nip = $4
         WHERE id = $5
         RETURNING *`,
        [foto, nama_jabatan, nama_pejabat, nip, id]
    );

    const jabatan = hasil.rows[0];
    if (!jabatan) {
        res.status(404).json({ pesan: `Jabatan dengan id ${id} tidak ditemukan` });
        return;
    }
    res.json(jabatan);
});

// DELETE /api/struktur-jabatan/:id
router.delete("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query("DELETE FROM struktur_jabatan WHERE id = $1", [id]);

    if (hasil.rowCount === 0) {
        res.status(404).json({ pesan: `Jabatan dengan id ${id} tidak ditemukan` });
        return;
    }
    res.status(204).send();
});

export default router;
