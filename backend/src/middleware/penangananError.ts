import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { KesalahanAuth, KesalahanInput } from "../utils/kesalahan.js";

// Pesan bawaan multer berbahasa Inggris dan singkat, diterjemahkan supaya
// admin tahu persis apa yang salah dengan berkas yang dipilihnya
function pesanMulter(err: MulterError): string {
    switch (err.code) {
        case "LIMIT_FILE_SIZE":
            return "Ukuran gambar melebihi batas 5 MB";
        case "LIMIT_FILE_COUNT":
            return "Jumlah gambar melebihi batas sekali unggah";
        case "LIMIT_UNEXPECTED_FILE":
            return `Field berkas '${err.field}' tidak dikenal, pakai field bernama 'gambar'`;
        default:
            return `Unggahan ditolak (${err.code})`;
    }
}

// Baca kolom "code" milik error dari driver pg tanpa memakai any
function kodePostgres(err: unknown): string | undefined {
    if (typeof err === "object" && err !== null && "code" in err) {
        const kode = (err as { code?: unknown }).code;
        return typeof kode === "string" ? kode : undefined;
    }
    return undefined;
}

function pesanPostgres(err: unknown): string {
    if (err instanceof Error && err.message) {
        return err.message;
    }
    return "Data ditolak oleh database";
}

export function rute404(req: Request, res: Response) {
    res.status(404).json({ pesan: `Rute ${req.method} ${req.originalUrl} tidak tersedia` });
}

// Express 5 otomatis meneruskan error dari handler async ke sini,
// jadi tiap rute tidak perlu try/catch sendiri
export function penangananError(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof KesalahanInput) {
        res.status(400).json({ pesan: err.message });
        return;
    }

    if (err instanceof MulterError) {
        res.status(400).json({ pesan: pesanMulter(err) });
        return;
    }

    if (err instanceof KesalahanAuth) {
        // WWW-Authenticate memberi tahu client bahwa yang diminta adalah token Bearer
        res.status(401).set("WWW-Authenticate", "Bearer").json({ pesan: err.message });
        return;
    }

    switch (kodePostgres(err)) {
        // RAISE EXCEPTION dari trigger, contohnya batas 5 gambar per kabar
        case "P0001":
            res.status(400).json({ pesan: pesanPostgres(err) });
            return;
        // email admin sudah dipakai
        case "23505":
            res.status(409).json({ pesan: "Data dengan nilai unik tersebut sudah ada" });
            return;
        // admin_id / kabar_id menunjuk ke baris yang tidak ada
        case "23503":
            res.status(400).json({ pesan: "Data yang direferensikan tidak ditemukan" });
            return;
        // pelanggaran CHECK, contohnya jenis selain berita/pengumuman
        case "23514":
            res.status(400).json({ pesan: "Nilai yang dikirim tidak sesuai aturan database" });
            return;
        // kolom NOT NULL dikirim kosong
        case "23502":
            res.status(400).json({ pesan: "Ada kolom wajib yang belum diisi" });
            return;
        default:
            break;
    }

    console.error("Kesalahan tak terduga:", err);
    res.status(500).json({ pesan: "Terjadi kesalahan di server" });
}
