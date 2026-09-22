import { Router } from "express";
import pool from "../db/pool.js";
import { wajibLogin } from "../middleware/autentikasi.js";
import type { Penduduk } from "../types.js";
import { ambilBody, ambilId, bulatTakNegatif } from "../utils/validasi.js";

const router = Router();

// Kolom total tidak pernah dikirim ke database, PostgreSQL menghitungnya sendiri
// lewat GENERATED ALWAYS AS (laki_laki + perempuan) STORED

// GET /api/penduduk
router.get("/", async (req, res) => {
    const hasil = await pool.query<Penduduk>("SELECT * FROM penduduk ORDER BY id DESC");
    res.json(hasil.rows);
});

// GET /api/penduduk/terbaru  -> dipakai di beranda
// Harus didaftarkan sebelum /:id supaya "terbaru" tidak dianggap sebagai id
router.get("/terbaru", async (req, res) => {
    const hasil = await pool.query<Penduduk>(
        "SELECT * FROM penduduk ORDER BY id DESC LIMIT 1"
    );

    const penduduk = hasil.rows[0];
    if (!penduduk) {
        res.status(404).json({ pesan: "Data penduduk belum diisi" });
        return;
    }
    res.json(penduduk);
});

// GET /api/penduduk/:id
router.get("/:id", async (req, res) => {
    const id = ambilId(req.params.id);
    const hasil = await pool.query<Penduduk>("SELECT * FROM penduduk WHERE id = $1", [id]);

    const penduduk = hasil.rows[0];
    if (!penduduk) {
        res.status(404).json({ pesan: `Data penduduk dengan id ${id} tidak ditemukan` });
        return;
    }
    res.json(penduduk);
});

// POST /api/penduduk
router.post("/", wajibLogin, async (req, res) => {
    const body = ambilBody(req.body);
    const laki_laki = bulatTakNegatif(body.laki_laki, "laki_laki");
    const perempuan = bulatTakNegatif(body.perempuan, "perempuan");

    const hasil = await pool.query<Penduduk>(
        `INSERT INTO penduduk (laki_laki, perempuan)
         VALUES ($1, $2)
         RETURNING *`,
        [laki_laki, perempuan]
    );
    res.status(201).json(hasil.rows[0]);
});

// PUT /api/penduduk/:id
router.put("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);
    const body = ambilBody(req.body);
    const laki_laki = bulatTakNegatif(body.laki_laki, "laki_laki");
    const perempuan = bulatTakNegatif(body.perempuan, "perempuan");

    const hasil = await pool.query<Penduduk>(
        `UPDATE penduduk
         SET laki_laki = $1, perempuan = $2
         WHERE id = $3
         RETURNING *`,
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
