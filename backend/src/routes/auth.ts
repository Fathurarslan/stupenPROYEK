import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { Router } from "express";
import pool from "../db/pool.js";
import { adminSaatIni, wajibLogin } from "../middleware/autentikasi.js";
import { batasLogin, batasSensitif } from "../middleware/batasPermintaan.js";
import { KesalahanAuth } from "../utils/kesalahan.js";
import { buatToken } from "../utils/token.js";
import { ambilBody, ambilEmail, ambilPassword, passwordUntukDicocokkan } from "../utils/validasi.js";

const router = Router();

const PUTARAN_BCRYPT = 10;

// Hash umpan dari password acak, dibuat sekali saat server start.
// Dipakai agar lama proses login untuk email yang tidak ada tetap mirip dengan
// email yang ada, sehingga email admin tidak bisa ditebak dari selisih waktu respons.
const HASH_UMPAN = await bcrypt.hash(randomBytes(24).toString("hex"), PUTARAN_BCRYPT);

interface BarisAdmin {
    id: number;
    email: string;
    password_hash: string;
}

export interface BarisSesiRingkas {
    id: number;
    jti: string;
    user_agent: string | null;
    ip: string | null;
    dibuat_pada: Date;
    dipakai_terakhir: Date;
    kedaluwarsa_pada: Date;
}

// POST /api/auth/login
router.post("/login", batasLogin, async (req, res) => {
    const body = ambilBody(req.body);
    const email = ambilEmail(body.email);
    // null berarti password tidak mungkin benar (kosong atau di atas 72 byte),
    // dijawab dengan 401 yang sama seperti password salah
    const password = passwordUntukDicocokkan(body.password);

    const hasil = await pool.query<BarisAdmin>(
        "SELECT id, email, password_hash FROM admin WHERE email = $1",
        [email]
    );
    const admin = hasil.rows[0];

    // Saat password null, bcrypt dilewati baik untuk email yang ada maupun
    // tidak, jadi selisih waktunya tidak membocorkan email admin
    const cocok =
        password !== null && (await bcrypt.compare(password, admin?.password_hash ?? HASH_UMPAN));

    // Pesan disamakan untuk email salah dan password salah, jangan bocorkan mana yang salah
    if (!admin || !cocok) {
        throw new KesalahanAuth("Email atau password salah");
    }

    const { token, jti, kedaluwarsa_detik, kedaluwarsa_pada } = buatToken({
        id: admin.id,
        email: admin.email,
    });

    await pool.query(
        `INSERT INTO sesi_admin (admin_id, jti, user_agent, ip, kedaluwarsa_pada)
         VALUES ($1, $2, $3, $4, $5)`,
        [
            admin.id,
            jti,
            req.get("user-agent")?.slice(0, 255) ?? null,
            req.ip?.slice(0, 45) ?? null,
            kedaluwarsa_pada,
        ]
    );

    // Bersihkan sesi yang sudah lewat masa berlakunya supaya tabel tidak menumpuk
    void pool
        .query("DELETE FROM sesi_admin WHERE kedaluwarsa_pada < NOW() - INTERVAL '7 days'")
        .catch((err: unknown) => console.error("Gagal membersihkan sesi lama:", err));

    res.json({
        token,
        kedaluwarsa_detik,
        kedaluwarsa_pada,
        admin: { id: admin.id, email: admin.email },
    });
});

// POST /api/auth/logout -> cabut sesi yang sedang dipakai
// Setelah ini token yang sama akan ditolak 401 walau tanda tangannya masih sah
router.post("/logout", wajibLogin, async (req, res) => {
    const { jti } = adminSaatIni(req);

    await pool.query(
        "UPDATE sesi_admin SET dicabut_pada = NOW() WHERE jti = $1 AND dicabut_pada IS NULL",
        [jti]
    );

    res.json({ pesan: "Berhasil logout, token ini sudah tidak berlaku" });
});

// POST /api/auth/logout-semua -> cabut semua sesi milik admin ini, termasuk sesi sekarang
router.post("/logout-semua", wajibLogin, async (req, res) => {
    const { id } = adminSaatIni(req);

    const hasil = await pool.query(
        "UPDATE sesi_admin SET dicabut_pada = NOW() WHERE admin_id = $1 AND dicabut_pada IS NULL",
        [id]
    );

    res.json({
        pesan: "Semua sesi dicabut, semua perangkat harus login ulang",
        jumlah_sesi_dicabut: hasil.rowCount ?? 0,
    });
});

// GET /api/auth/sesi -> daftar sesi yang masih aktif
router.get("/sesi", wajibLogin, async (req, res) => {
    const { id, jti } = adminSaatIni(req);

    const hasil = await pool.query<BarisSesiRingkas>(
        `SELECT id, jti, user_agent, ip, dibuat_pada, dipakai_terakhir, kedaluwarsa_pada
         FROM sesi_admin
         WHERE admin_id = $1 AND dicabut_pada IS NULL AND kedaluwarsa_pada > NOW()
         ORDER BY dipakai_terakhir DESC`,
        [id]
    );

    res.json(
        hasil.rows.map((sesi) => ({
            ...sesi,
            ini_perangkat_sekarang: sesi.jti === jti,
        }))
    );
});

// GET /api/auth/saya -> cek token masih berlaku dan siapa yang login
router.get("/saya", wajibLogin, async (req, res) => {
    const { id } = adminSaatIni(req);

    const hasil = await pool.query<{ id: number; email: string; updated_at: Date }>(
        "SELECT id, email, updated_at FROM admin WHERE id = $1",
        [id]
    );
    const admin = hasil.rows[0];

    // Token valid tapi barisnya sudah tidak ada di database
    if (!admin) {
        throw new KesalahanAuth("Admin pada token ini sudah tidak ada");
    }
    res.json(admin);
});

// PUT /api/auth/password -> ganti password sendiri
// Pembatas dipasang sebelum wajibLogin supaya permintaan berlebih ditolak
// tanpa perlu menanyakan sesinya ke database lebih dulu
router.put("/password", batasSensitif, wajibLogin, async (req, res) => {
    const { id, jti } = adminSaatIni(req);
    const body = ambilBody(req.body);
    const password_lama = passwordUntukDicocokkan(body.password_lama);
    const password_baru = ambilPassword(body.password_baru, "password_baru");

    const hasil = await pool.query<BarisAdmin>(
        "SELECT id, email, password_hash FROM admin WHERE id = $1",
        [id]
    );
    const admin = hasil.rows[0];
    if (!admin) {
        throw new KesalahanAuth("Admin pada token ini sudah tidak ada");
    }

    if (password_lama === null || !(await bcrypt.compare(password_lama, admin.password_hash))) {
        throw new KesalahanAuth("Password lama salah");
    }

    const hashBaru = await bcrypt.hash(password_baru, PUTARAN_BCRYPT);

    const client = await pool.connect();
    let jumlahDicabut = 0;
    try {
        await client.query("BEGIN");
        await client.query("UPDATE admin SET password_hash = $1 WHERE id = $2", [hashBaru, id]);

        // Ganti password harus mengusir perangkat lain. Sesi yang sedang dipakai
        // dibiarkan hidup supaya admin tidak ikut terlempar ke halaman login.
        const dicabut = await client.query(
            `UPDATE sesi_admin SET dicabut_pada = NOW()
             WHERE admin_id = $1 AND jti <> $2 AND dicabut_pada IS NULL`,
            [id, jti]
        );
        jumlahDicabut = dicabut.rowCount ?? 0;
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    res.json({
        pesan: "Password berhasil diganti. Perangkat lain sudah dilogout otomatis.",
        jumlah_sesi_lain_dicabut: jumlahDicabut,
        admin: { id: admin.id, email: admin.email },
    });
});

// PUT /api/auth/email -> ganti email login, wajib konfirmasi password
router.put("/email", batasSensitif, wajibLogin, async (req, res) => {
    const { id } = adminSaatIni(req);
    const body = ambilBody(req.body);
    const email_baru = ambilEmail(body.email_baru);
    const password = passwordUntukDicocokkan(body.password);

    const hasil = await pool.query<BarisAdmin>(
        "SELECT id, email, password_hash FROM admin WHERE id = $1",
        [id]
    );
    const admin = hasil.rows[0];
    if (!admin) {
        throw new KesalahanAuth("Admin pada token ini sudah tidak ada");
    }

    if (password === null || !(await bcrypt.compare(password, admin.password_hash))) {
        throw new KesalahanAuth("Password salah");
    }

    // Email duplikat ditangkap constraint UNIQUE lalu jadi HTTP 409
    const diperbarui = await pool.query<{ id: number; email: string }>(
        `UPDATE admin SET email = $1 WHERE id = $2 RETURNING id, email`,
        [email_baru, id]
    );

    res.json({
        pesan: "Email berhasil diganti. Pakai email baru ini untuk login berikutnya.",
        admin: diperbarui.rows[0],
    });
});

export default router;
