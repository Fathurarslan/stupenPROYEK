import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { KesalahanAuth } from "./kesalahan.js";

export interface IsiToken {
    id: number;
    email: string;
    jti: string; // id sesi, dipakai untuk mencabut token saat logout
}

// Dibaca saat dipakai, bukan saat modul diimpor, supaya pesan error jelas
function rahasia(): string {
    const nilai = process.env.JWT_SECRET;
    if (!nilai || nilai.length < 32) {
        throw new Error("JWT_SECRET di backend/.env belum diisi atau kurang dari 32 karakter");
    }
    return nilai;
}

function masaBerlaku(): number {
    const detik = Number(process.env.JWT_EXPIRES_SECONDS);
    return Number.isInteger(detik) && detik > 0 ? detik : 28800; // bawaan 8 jam
}

export interface TokenBaru {
    token: string;
    jti: string;
    kedaluwarsa_detik: number;
    kedaluwarsa_pada: Date;
}

export function buatToken(admin: { id: number; email: string }): TokenBaru {
    const kedaluwarsa_detik = masaBerlaku();
    const jti = randomUUID();
    const token = jwt.sign({ email: admin.email }, rahasia(), {
        subject: String(admin.id),
        jwtid: jti,
        expiresIn: kedaluwarsa_detik,
    });
    return {
        token,
        jti,
        kedaluwarsa_detik,
        kedaluwarsa_pada: new Date(Date.now() + kedaluwarsa_detik * 1000),
    };
}

export function bacaToken(token: string): IsiToken {
    let isi: string | jwt.JwtPayload;
    try {
        isi = jwt.verify(token, rahasia());
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new KesalahanAuth("Token sudah kedaluwarsa, silakan login ulang");
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new KesalahanAuth("Token tidak valid");
        }
        throw err; // JWT_SECRET belum diisi, itu salah konfigurasi server bukan salah client
    }

    if (typeof isi === "string" || typeof isi.email !== "string" || typeof isi.jti !== "string") {
        throw new KesalahanAuth("Isi token tidak lengkap");
    }
    const id = Number(isi.sub);
    if (!Number.isInteger(id) || id < 1) {
        throw new KesalahanAuth("Isi token tidak lengkap");
    }
    return { id, email: isi.email, jti: isi.jti };
}
