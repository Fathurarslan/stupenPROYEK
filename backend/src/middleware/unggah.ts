import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { readFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { KesalahanInput } from "../utils/kesalahan.js";

// Folder ini ada di backend/uploads, baik saat dijalankan lewat tsx (src/)
// maupun setelah di-build (dist/), karena dua-duanya satu tingkat di bawah root.
export const FOLDER_UNGGAH = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "uploads");

mkdirSync(FOLDER_UNGGAH, { recursive: true });

export const UKURAN_MAKS_MB = 5;
export const MAKS_BERKAS_SEKALIGUS = 5;

// Ekstensi ditentukan dari mimetype, bukan dari nama berkas kiriman client.
// Nama asli tidak pernah dipakai supaya tidak ada "foto.php.jpg" atau path traversal.
const TIPE_DIIZINKAN: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

const penyimpanan = multer.diskStorage({
    destination: (req, berkas, lanjut) => lanjut(null, FOLDER_UNGGAH),
    filename: (req, berkas, lanjut) => {
        const ekstensi = TIPE_DIIZINKAN[berkas.mimetype] ?? "";
        lanjut(null, `${randomUUID()}${ekstensi}`);
    },
});

export const unggah = multer({
    storage: penyimpanan,
    limits: {
        fileSize: UKURAN_MAKS_MB * 1024 * 1024,
        files: MAKS_BERKAS_SEKALIGUS,
    },
    fileFilter: (req, berkas, lanjut) => {
        if (!(berkas.mimetype in TIPE_DIIZINKAN)) {
            lanjut(new KesalahanInput(
                `Tipe berkas ${berkas.mimetype} tidak didukung. Pakai JPG, PNG, WEBP, atau GIF.`
            ));
            return;
        }
        lanjut(null, true);
    },
});

// Header Content-Type dari client gampang dipalsukan, jadi isi berkasnya
// diperiksa ulang lewat magic bytes. Tanpa ini sebuah file HTML bisa diunggah
// dengan mimetype image/png lalu disajikan dari origin kita sendiri (risiko XSS).
function cocokMagicBytes(awal: Buffer, mimetype: string): boolean {
    switch (mimetype) {
        case "image/jpeg":
            return awal[0] === 0xff && awal[1] === 0xd8 && awal[2] === 0xff;
        case "image/png":
            return (
                awal[0] === 0x89 && awal[1] === 0x50 && awal[2] === 0x4e && awal[3] === 0x47 &&
                awal[4] === 0x0d && awal[5] === 0x0a && awal[6] === 0x1a && awal[7] === 0x0a
            );
        case "image/gif":
            return awal.subarray(0, 4).toString("latin1") === "GIF8";
        case "image/webp":
            return (
                awal.subarray(0, 4).toString("latin1") === "RIFF" &&
                awal.subarray(8, 12).toString("latin1") === "WEBP"
            );
        default:
            return false;
    }
}

export async function hapusBerkas(namaBerkas: string) {
    await unlink(join(FOLDER_UNGGAH, namaBerkas)).catch(() => {
        // berkas sudah tidak ada, tidak masalah
    });
}

// Dipanggil setelah multer menyimpan berkas. Kalau isinya bukan gambar sungguhan,
// berkasnya langsung dihapus lagi dari disk.
export async function pastikanGambarAsli(berkas: Express.Multer.File) {
    const isi = await readFile(berkas.path);
    if (!cocokMagicBytes(isi.subarray(0, 12), berkas.mimetype)) {
        await hapusBerkas(berkas.filename);
        throw new KesalahanInput(
            `Berkas ${berkas.originalname} bukan gambar yang sah walau tipenya mengaku ${berkas.mimetype}`
        );
    }
}

// Nama berkas selalu UUID + ekstensi. Pola ketat ini yang mencegah
// permintaan seperti DELETE /api/unggah/..%2F..%2F.env
const POLA_NAMA = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/;

export function pastikanNamaBerkasAman(nama: unknown): string {
    if (typeof nama !== "string" || !POLA_NAMA.test(nama)) {
        throw new KesalahanInput("Nama berkas tidak valid");
    }
    return nama;
}

// Ambil nama berkas dari URL yang tersimpan di database (/upload/xxx.jpg).
// Mengembalikan null kalau URL-nya bukan milik kita, misalnya tautan ke situs
// lain atau data lama berbentuk lain. Dengan begitu tidak pernah ada percobaan
// menghapus berkas yang bukan urusan aplikasi ini.
export function namaBerkasDariUrl(url: string | null | undefined): string | null {
    if (typeof url !== "string" || !url.startsWith("/upload/")) {
        return null;
    }
    const nama = url.slice("/upload/".length);
    return POLA_NAMA.test(nama) ? nama : null;
}
