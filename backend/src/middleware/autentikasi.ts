import type { NextFunction, Request, Response } from "express";
import pool from "../db/pool.js";
import { KesalahanAuth } from "../utils/kesalahan.js";
import { bacaToken, type IsiToken } from "../utils/token.js";

interface BarisSesi {
    dicabut_pada: Date | null;
    kedaluwarsa_pada: Date;
}

// Pasang di rute yang hanya boleh diakses admin yang sudah login.
// Client harus mengirim header: Authorization: Bearer <token>
//
// Selain memverifikasi tanda tangan JWT, middleware ini juga mengecek baris
// sesi di database. Itulah yang membuat logout benar-benar mencabut token:
// tanda tangan JWT masih sah, tapi sesinya sudah ditandai dicabut.
export async function wajibLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const header = req.get("authorization");
        if (!header) {
            throw new KesalahanAuth("Header Authorization belum dikirim");
        }

        const [skema, token] = header.split(" ");
        if (skema?.toLowerCase() !== "bearer" || !token) {
            throw new KesalahanAuth("Format header harus: Authorization: Bearer <token>");
        }

        const isi = bacaToken(token);

        const hasil = await pool.query<BarisSesi>(
            "SELECT dicabut_pada, kedaluwarsa_pada FROM sesi_admin WHERE jti = $1",
            [isi.jti]
        );
        const sesi = hasil.rows[0];

        if (!sesi) {
            throw new KesalahanAuth("Sesi tidak dikenal, silakan login ulang");
        }
        if (sesi.dicabut_pada !== null) {
            throw new KesalahanAuth("Sesi ini sudah dilogout, silakan login ulang");
        }
        if (sesi.kedaluwarsa_pada.getTime() <= Date.now()) {
            throw new KesalahanAuth("Sesi sudah kedaluwarsa, silakan login ulang");
        }

        // Catat aktivitas terakhir supaya daftar sesi di UI informatif.
        // Tidak di-await agar tidak menambah waktu tunggu request.
        void pool
            .query("UPDATE sesi_admin SET dipakai_terakhir = NOW() WHERE jti = $1", [isi.jti])
            .catch((err: unknown) => console.error("Gagal memperbarui dipakai_terakhir:", err));

        req.admin = isi;
        next();
    } catch (err) {
        next(err);
    }
}

// Dipakai di dalam handler yang sudah dilindungi wajibLogin.
// Kalau req.admin kosong berarti middleware-nya lupa dipasang, itu bug server bukan salah client.
export function adminSaatIni(req: Request): IsiToken {
    if (!req.admin) {
        throw new Error("Rute ini membaca admin tanpa memasang middleware wajibLogin");
    }
    return req.admin;
}
