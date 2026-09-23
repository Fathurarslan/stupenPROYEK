import { Router } from "express";
import { wajibLogin } from "../middleware/autentikasi.js";
import {
    hapusBerkas,
    MAKS_BERKAS_SEKALIGUS,
    pastikanGambarAsli,
    pastikanNamaBerkasAman,
    UKURAN_MAKS_MB,
    unggah,
} from "../middleware/unggah.js";
import { berkasSedangDipakai } from "../utils/berkas.js";
import { KesalahanInput } from "../utils/kesalahan.js";

const router = Router();

// Semua endpoint di sini wajib login: unggahan hanya untuk admin
router.use(wajibLogin);

interface HasilUnggah {
    url: string;
    nama_berkas: string;
    ukuran: number;
    tipe: string;
}

function keHasil(berkas: Express.Multer.File): HasilUnggah {
    return {
        // Path relatif, bukan URL penuh, supaya tetap benar kalau domainnya pindah
        url: `/upload/${berkas.filename}`,
        nama_berkas: berkas.filename,
        ukuran: berkas.size,
        tipe: berkas.mimetype,
    };
}

// POST /api/unggah  (field: gambar)
// Balasannya dipakai sebagai nilai gambar_utama saat membuat kabar
router.post("/", unggah.single("gambar"), async (req, res) => {
    if (!req.file) {
        throw new KesalahanInput("Tidak ada berkas terkirim. Pakai field bernama 'gambar'.");
    }

    await pastikanGambarAsli(req.file);
    res.status(201).json(keHasil(req.file));
});

// POST /api/unggah/banyak  (field: gambar, maksimal 5 berkas)
router.post("/banyak", unggah.array("gambar", MAKS_BERKAS_SEKALIGUS), async (req, res) => {
    const berkas = Array.isArray(req.files) ? req.files : [];
    if (berkas.length === 0) {
        throw new KesalahanInput("Tidak ada berkas terkirim. Pakai field bernama 'gambar'.");
    }

    try {
        for (const satu of berkas) {
            await pastikanGambarAsli(satu);
        }
    } catch (err) {
        // Kalau satu berkas ditolak, yang lain ikut dibersihkan supaya tidak
        // ada berkas nyangkut tanpa pemilik
        await Promise.all(berkas.map((satu) => hapusBerkas(satu.filename)));
        throw err;
    }

    res.status(201).json({ berkas: berkas.map(keHasil) });
});

// DELETE /api/unggah/:namaBerkas
// Dipakai saat admin mengganti gambar sebelum menyimpan, supaya berkas yang
// batal dipakai tidak menumpuk di disk.
router.delete("/:namaBerkas", async (req, res) => {
    const nama = pastikanNamaBerkasAman(req.params.namaBerkas);

    // Dulu rute ini menghapus apa saja yang namanya cocok, tanpa peduli berkas
    // itu sedang terpasang di berita atau foto pejabat yang sudah tayang.
    // Satu salah pencet cukup untuk mengosongkan gambar di halaman publik,
    // dan barisnya tetap menunjuk ke berkas yang sudah tidak ada.
    if (await berkasSedangDipakai(`/upload/${nama}`)) {
        res.status(409).json({
            pesan: "Berkas ini sedang dipakai berita atau struktur jabatan. Hapus dulu data yang memakainya.",
        });
        return;
    }

    await hapusBerkas(nama);
    res.status(204).send();
});

// GET /api/unggah/batas -> dipakai frontend untuk menampilkan aturan sebelum memilih berkas
router.get("/batas", (req, res) => {
    res.json({
        ukuran_maks_mb: UKURAN_MAKS_MB,
        maks_berkas_sekaligus: MAKS_BERKAS_SEKALIGUS,
        tipe_didukung: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
});

export default router;
