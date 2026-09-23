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

// body-parser (di balik express.json) menandai kesalahannya lewat properti
// "type", bukan "code". Tanpa dikenali, body yang melebihi batas dan JSON
// yang rusak sama-sama jatuh ke penanganan terakhir dan dibalas 500, padahal
// yang keliru justru kiriman client.
function tipeBodyParser(err: unknown): string | undefined {
    if (typeof err === "object" && err !== null && "type" in err) {
        const tipe = (err as { type?: unknown }).type;
        return typeof tipe === "string" ? tipe : undefined;
    }
    return undefined;
}

// Baca kolom "code" milik error dari driver pg tanpa memakai any
function kodePostgres(err: unknown): string | undefined {
    if (typeof err === "object" && err !== null && "code" in err) {
        const kode = (err as { code?: unknown }).code;
        return typeof kode === "string" ? kode : undefined;
    }
    return undefined;
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

    switch (tipeBodyParser(err)) {
        case "entity.too.large":
            res.status(413).json({ pesan: "Data yang dikirim terlalu besar" });
            return;
        case "entity.parse.failed":
            res.status(400).json({ pesan: "Body bukan JSON yang sah" });
            return;
        case "encoding.unsupported":
            res.status(415).json({ pesan: "Encoding body tidak didukung" });
            return;
        default:
            break;
    }

    switch (kodePostgres(err)) {
        // RAISE EXCEPTION dari trigger. Sejak migrasi 003 tidak ada trigger
        // yang memakainya lagi (batas 5 gambar kini dijaga constraint), jadi
        // cabang ini praktis tak tersentuh -- dibiarkan sebagai penjaga untuk
        // trigger yang mungkin ditambahkan nanti.
        //
        // Pesannya sengaja TIDAK diteruskan ke client. Teks yang ditulis di
        // dalam database tidak dirancang untuk dibaca pengunjung, dan sekali
        // jalurnya terbuka ia ikut terbit tanpa ada yang meninjau. Aslinya
        // dicatat di log supaya tetap bisa dilacak.
        case "P0001":
            console.error("Trigger database menolak data:", err);
            res.status(400).json({ pesan: "Data ditolak oleh aturan database" });
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
        // angka di luar jangkauan kolomnya, contohnya INTEGER di atas 2.147.483.647.
        // Validasi di utils/validasi.ts sudah mencegatnya lebih dulu; ini jaring
        // pengaman supaya salah kirim tetap dibalas 400, bukan 500.
        case "22003":
            res.status(400).json({ pesan: "Angka yang dikirim di luar jangkauan yang diizinkan" });
            return;
        // teks yang tidak bisa dibaca sebagai tipe kolomnya, contohnya UUID salah bentuk
        case "22P02":
            res.status(400).json({ pesan: "Format nilai yang dikirim tidak sesuai" });
            return;
        default:
            break;
    }

    console.error("Kesalahan tak terduga:", err);
    res.status(500).json({ pesan: "Terjadi kesalahan di server" });
}
