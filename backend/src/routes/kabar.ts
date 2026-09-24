import { Router } from "express";
import pool from "../db/pool.js";
import { adminSaatIni, wajibLogin } from "../middleware/autentikasi.js";
import type { Kabar, KabarGambar } from "../types.js";
import { hapusBerkasTakTerpakai } from "../utils/berkas.js";
import { KesalahanInput } from "../utils/kesalahan.js";
import {
    ambilBody,
    ambilId,
    ambilJenisKabar,
    bulatTakNegatif,
    tanggalOpsional,
    teksOpsional,
    teksWajib,
    urlUnggahanWajib,
} from "../utils/validasi.js";

const router = Router();

// Batas tertinggi yang boleh diminta lewat ?limit, bukan ukuran halaman.
// Tanpa batas, siapa pun bisa memanggil /api/kabar?limit=999999999 dan
// memaksa seluruh isi tabel dirangkai jadi satu JSON, padahal rute ini publik
// tanpa login. Frontend (lib/konten.ts) memuat per 100 lalu lanjut ke
// halaman berikutnya, jadi angka ini harus sama dengan PER_PERMINTAAN di sana.
const MAKS_LIMIT = 100;

// Harus sama dengan constraint kabar_gambar_urutan_check (urutan 0..4) di
// db/migrations/003_integritas_data.sql dan
// MAKS_GAMBAR_LAIN di frontend/src/pages/admin/TambahBerita.tsx
const MAKS_GAMBAR_LAIN = 5;

// Sekitar 7 halaman A4, jauh di atas kebutuhan artikel kelurahan. Kolomnya
// TEXT di database, jadi tanpa batas ini satu-satunya rem adalah ukuran body
// JSON.
const MAKS_DESKRIPSI = 20000;

// Kolom untuk rute daftar: hanya yang dipakai kartu dan carousel di beranda.
// deskripsi_lengkap dan galeri sengaja tidak ikut. Dulu keduanya terkirim
// untuk setiap kabar di daftar, jadi tiap kunjungan beranda ikut mengunduh
// isi lengkap semua artikel yang tidak pernah ditampilkan di sana. Isi
// lengkap hanya dikirim GET /api/kabar/:id, saat satu kabar dibuka.
const KOLOM_RINGKAS = "k.id, k.jenis, k.judul, k.tanggal_upload, k.gambar_utama, k.ringkasan";

// Urutan daftar. k.id sebagai pengurut kedua itu wajib, bukan hiasan: tanggal
// dari form admin hanya sampai hari, jadi banyak kabar berbagi tanggal_upload
// yang persis sama. Tanpa pengurut kedua, PostgreSQL bebas menyusun kabar
// bertanggal sama secara berbeda di tiap query, sehingga saat daftar dimuat
// per halaman satu kabar bisa muncul dua kali dan kabar lain hilang.
const URUTAN_DAFTAR = "ORDER BY k.tanggal_upload DESC, k.id DESC";

// Dipakai rute detail.
//
// Kolomnya ditulis satu per satu, bukan k.*, supaya kolom yang ditambahkan
// nanti tidak otomatis ikut terkirim ke halaman publik. Yang sengaja tidak
// ikut: admin_id (pipa internal, tidak ada urusannya dengan pengunjung),
// created_at, dan updated_at (membocorkan kapan sebuah kabar diam-diam diubah).
const PILIH_KABAR_LENGKAP = `
    SELECT k.id, k.jenis, k.judul, k.tanggal_upload, k.gambar_utama,
           k.ringkasan, k.deskripsi_lengkap,
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

// Kolom yang dikembalikan sesudah INSERT/UPDATE, bukan RETURNING *. Isinya
// disamakan dengan PILIH_KABAR_LENGKAP supaya balasan tulis dan balasan baca
// berbentuk sama, dan kolom yang ditambahkan nanti tidak ikut terkirim
// sebelum ada yang sengaja memasukkannya ke sini.
const KOLOM_KABAR = "id, jenis, judul, tanggal_upload, gambar_utama, ringkasan, deskripsi_lengkap";
const KOLOM_GAMBAR = "id, gambar_url, urutan";

type KabarPublik = Omit<Kabar, "admin_id" | "created_at" | "updated_at">;
type GambarPublik = Pick<KabarGambar, "id" | "gambar_url" | "urutan">;
type KabarRingkas = Omit<KabarPublik, "deskripsi_lengkap">;
type KabarLengkap = KabarPublik & { gambar_lain: GambarPublik[] };

function daftarGambar(nilai: unknown): string[] {
    if (nilai === undefined || nilai === null) {
        return [];
    }
    if (!Array.isArray(nilai)) {
        throw new KesalahanInput("Kolom gambar_lain harus berupa array berisi URL gambar");
    }
    // Dicegat di sini, bukan dibiarkan sampai ke constraint database, supaya
    // tidak ada transaksi yang sudah terbuka dan menyisipkan beberapa baris
    // lalu dibatalkan di tengah jalan
    if (nilai.length > MAKS_GAMBAR_LAIN) {
        throw new KesalahanInput(`Kolom gambar_lain maksimal ${MAKS_GAMBAR_LAIN} gambar`);
    }
    return nilai.map((url, i) => urlUnggahanWajib(url, `gambar_lain[${i}]`));
}

// GET /api/kabar?jenis=berita&limit=10&offset=0
router.get("/", async (req, res) => {
    const nilaiParam: unknown[] = [];
    let filter = "";

    if (req.query.jenis !== undefined) {
        nilaiParam.push(ambilJenisKabar(req.query.jenis));
        filter = `WHERE k.jenis = $${nilaiParam.length}`;
    }

    const limit = req.query.limit === undefined ? 50 : bulatTakNegatif(req.query.limit, "limit", MAKS_LIMIT);
    const offset = req.query.offset === undefined ? 0 : bulatTakNegatif(req.query.offset, "offset");
    nilaiParam.push(limit, offset);

    const hasil = await pool.query<KabarRingkas>(
        `SELECT ${KOLOM_RINGKAS}
         FROM kabar k
         ${filter}
         ${URUTAN_DAFTAR}
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
    const gambar_utama = urlUnggahanWajib(body.gambar_utama, "gambar_utama");
    const ringkasan = teksOpsional(body.ringkasan, "ringkasan", 500);
    const deskripsi_lengkap = teksWajib(body.deskripsi_lengkap, "deskripsi_lengkap", MAKS_DESKRIPSI);
    const gambar_lain = daftarGambar(body.gambar_lain);
    const tanggal_upload = tanggalOpsional(body.tanggal_upload, "tanggal_upload");

    // Penulis diambil dari token, bukan dari body, supaya tidak bisa dipalsukan client
    const admin_id = adminSaatIni(req).id;

    // Kabar dan gambar tambahannya harus masuk bersama-sama, jadi dibungkus transaksi
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const hasil = await client.query<KabarPublik>(
            `INSERT INTO kabar (jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, admin_id, tanggal_upload)
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamp, NOW()))
             RETURNING ${KOLOM_KABAR}`,
            [jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, admin_id, tanggal_upload]
        );

        const kabar = hasil.rows[0];
        if (!kabar) {
            throw new Error("INSERT kabar tidak mengembalikan baris");
        }

        const gambarTersimpan: GambarPublik[] = [];
        for (const [urutan, gambar_url] of gambar_lain.entries()) {
            const tambahan = await client.query<GambarPublik>(
                `INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
                 VALUES ($1, $2, $3)
                 RETURNING ${KOLOM_GAMBAR}`,
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
    const gambar_utama = urlUnggahanWajib(body.gambar_utama, "gambar_utama");
    const ringkasan = teksOpsional(body.ringkasan, "ringkasan", 500);
    const deskripsi_lengkap = teksWajib(body.deskripsi_lengkap, "deskripsi_lengkap", MAKS_DESKRIPSI);
    const tanggal_upload = tanggalOpsional(body.tanggal_upload, "tanggal_upload");
    const gantiGaleri = body.gambar_lain !== undefined;
    const gambar_lain = gantiGaleri ? daftarGambar(body.gambar_lain) : [];

    const client = await pool.connect();
    // Dicatat sebelum diubah, dibandingkan sesudahnya: gambar yang tidak lagi
    // dirujuk berarti sudah tidak terpakai dan berkasnya ikut dibuang.
    let gambarLama: string[] = [];
    let gambarSesudah: string[] = [];
    try {
        await client.query("BEGIN");

        const sebelum = await client.query<{ url: string }>(
            `SELECT gambar_utama AS url FROM kabar WHERE id = $1
             UNION SELECT gambar_url FROM kabar_gambar WHERE kabar_id = $1`,
            [id]
        );
        gambarLama = sebelum.rows.map((r) => r.url);

        const hasil = await client.query<KabarPublik>(
            `UPDATE kabar
             SET jenis = $1, judul = $2, gambar_utama = $3, ringkasan = $4,
                 deskripsi_lengkap = $5, tanggal_upload = COALESCE($6::timestamp, tanggal_upload)
             WHERE id = $7
             RETURNING ${KOLOM_KABAR}`,
            [jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, tanggal_upload, id]
        );

        const kabar = hasil.rows[0];
        if (!kabar) {
            await client.query("ROLLBACK");
            res.status(404).json({ pesan: `Kabar dengan id ${id} tidak ditemukan` });
            return;
        }

        const gambarTersimpan: GambarPublik[] = [];
        if (gantiGaleri) {
            // Dikosongkan dulu supaya urutan 0..4 yang baru tidak bentrok
            // dengan UNIQUE (kabar_id, urutan) milik gambar lama
            await client.query("DELETE FROM kabar_gambar WHERE kabar_id = $1", [id]);

            for (const [urutan, gambar_url] of gambar_lain.entries()) {
                const tambahan = await client.query<GambarPublik>(
                    `INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
                     VALUES ($1, $2, $3)
                     RETURNING ${KOLOM_GAMBAR}`,
                    [id, gambar_url, urutan]
                );
                if (tambahan.rows[0]) {
                    gambarTersimpan.push(tambahan.rows[0]);
                }
            }
        }

        const sesudah = await client.query<{ url: string }>(
            `SELECT gambar_utama AS url FROM kabar WHERE id = $1
             UNION SELECT gambar_url FROM kabar_gambar WHERE kabar_id = $1`,
            [id]
        );
        gambarSesudah = sesudah.rows.map((r) => r.url);

        await client.query("COMMIT");
        res.json(gantiGaleri ? { ...kabar, gambar_lain: gambarTersimpan } : kabar);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    // Sesudah COMMIT, bukan di dalam transaksi: kalau transaksinya batal,
    // berkasnya harus tetap ada karena barisnya juga masih ada.
    const masihDipakai = new Set(gambarSesudah);
    await hapusBerkasTakTerpakai(gambarLama.filter((u) => !masihDipakai.has(u)));
});

// DELETE /api/kabar/:id  (gambar tambahan ikut terhapus lewat ON DELETE CASCADE)
router.delete("/:id", wajibLogin, async (req, res) => {
    const id = ambilId(req.params.id);

    const client = await pool.connect();
    let gambar: string[] = [];
    try {
        await client.query("BEGIN");

        // Dikumpulkan sebelum barisnya hilang: kabar_gambar ikut terhapus
        // lewat ON DELETE CASCADE, jadi sesudah ini URL-nya tidak bisa
        // ditelusuri lagi dan berkasnya akan menganggur di disk selamanya.
        const daftar = await client.query<{ url: string }>(
            `SELECT gambar_utama AS url FROM kabar WHERE id = $1
             UNION SELECT gambar_url FROM kabar_gambar WHERE kabar_id = $1`,
            [id]
        );

        const hasil = await client.query("DELETE FROM kabar WHERE id = $1", [id]);
        if (hasil.rowCount === 0) {
            await client.query("ROLLBACK");
            res.status(404).json({ pesan: `Kabar dengan id ${id} tidak ditemukan` });
            return;
        }

        gambar = daftar.rows.map((r) => r.url);
        await client.query("COMMIT");
        res.status(204).send();
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    await hapusBerkasTakTerpakai(gambar);
});

// POST /api/kabar/:id/gambar  -> tambah satu gambar tambahan
//
// Sejak migrasi 003, batas 5 gambar dijaga constraint (urutan 0..4 dan unik
// per kabar), bukan trigger penghitung yang bisa disalip transaksi lain.
// Karena itu urutan tidak bisa lagi selalu 0: kalau tidak disebut, diambilkan
// nomor kosong berikutnya. Kalau bentrok karena dua permintaan bersamaan,
// constraint uniknya yang menolak, dan itu memang yang diinginkan.
router.post("/:id/gambar", wajibLogin, async (req, res) => {
    const kabar_id = ambilId(req.params.id);
    const body = ambilBody(req.body);
    const gambar_url = urlUnggahanWajib(body.gambar_url, "gambar_url");
    const urutan =
        body.urutan === undefined
            ? null
            : bulatTakNegatif(body.urutan, "urutan", MAKS_GAMBAR_LAIN - 1);

    // Diperiksa lebih dulu supaya pesan penuhnya jelas, bukan berupa
    // pelanggaran CHECK yang berbunyi "tidak sesuai aturan database"
    const jumlah = await pool.query<{ n: string }>(
        "SELECT count(*)::text AS n FROM kabar_gambar WHERE kabar_id = $1",
        [kabar_id]
    );
    if (Number(jumlah.rows[0]?.n ?? 0) >= MAKS_GAMBAR_LAIN) {
        throw new KesalahanInput(
            `Kabar ini sudah punya ${MAKS_GAMBAR_LAIN} gambar tambahan, hapus salah satu dulu`
        );
    }

    const hasil = await pool.query<GambarPublik>(
        `INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
         VALUES ($1, $2, COALESCE($3::int, (
             SELECT COALESCE(max(urutan) + 1, 0) FROM kabar_gambar WHERE kabar_id = $1
         )))
         RETURNING ${KOLOM_GAMBAR}`,
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
