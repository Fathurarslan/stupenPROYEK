import { JENIS_KABAR, TINGKAT_JABATAN, type JenisKabar, type TingkatJabatan } from "../types.js";
import { KesalahanInput } from "./kesalahan.js";

// Batas kolom INTEGER (int4) PostgreSQL. Angka di atas ini dicegat di sini,
// sebab kalau sampai ke database jadinya error 22003 yang muncul ke client
// sebagai "kesalahan server", padahal yang salah justru kiriman client.
export const MAKS_INT4 = 2147483647;

// Number() terlalu longgar untuk dipakai menyaring: " 12 ", "0x10", "1e3",
// [], [5], dan true semuanya berubah jadi angka yang kelihatan sah. Di sini
// bentuk nilainya yang diperiksa lebih dulu, bukan hasil konversinya.
// null berarti "bukan bilangan bulat tak negatif", bukan "nol".
function keBulatTakNegatif(nilai: unknown): number | null {
    if (typeof nilai === "number") {
        return Number.isInteger(nilai) && nilai >= 0 ? nilai : null;
    }
    if (typeof nilai === "string" && /^\d+$/.test(nilai)) {
        const angka = Number(nilai);
        // Di atas 2^53 bilangan bulat tidak lagi tepat, jadi ditolak sekalian
        return Number.isSafeInteger(angka) ? angka : null;
    }
    return null;
}

// Ambil :id dari URL atau body, pastikan angka bulat positif
export function ambilId(nilai: unknown, nama = "id"): number {
    const angka = keBulatTakNegatif(nilai);
    if (angka === null || angka < 1 || angka > MAKS_INT4) {
        throw new KesalahanInput(`Kolom ${nama} harus berupa angka bulat 1 sampai ${MAKS_INT4}`);
    }
    return angka;
}

export function teksWajib(nilai: unknown, nama: string, maksimal?: number): string {
    if (typeof nilai !== "string" || nilai.trim() === "") {
        throw new KesalahanInput(`Kolom ${nama} wajib diisi`);
    }
    const teks = nilai.trim();
    if (maksimal !== undefined && teks.length > maksimal) {
        throw new KesalahanInput(`Kolom ${nama} maksimal ${maksimal} karakter`);
    }
    return teks;
}

// Untuk kolom yang boleh NULL di database
export function teksOpsional(nilai: unknown, nama: string, maksimal?: number): string | null {
    if (nilai === undefined || nilai === null || nilai === "") {
        return null;
    }
    return teksWajib(nilai, nama, maksimal);
}

// maksimal bisa diperketat per pemakaian, contohnya untuk ?limit pada paginasi
export function bulatTakNegatif(nilai: unknown, nama: string, maksimal = MAKS_INT4): number {
    const angka = keBulatTakNegatif(nilai);
    if (angka === null || angka > maksimal) {
        throw new KesalahanInput(`Kolom ${nama} harus berupa angka bulat 0 sampai ${maksimal}`);
    }
    return angka;
}

export function ambilJenisKabar(nilai: unknown): JenisKabar {
    if (typeof nilai === "string" && (JENIS_KABAR as readonly string[]).includes(nilai)) {
        return nilai as JenisKabar;
    }
    throw new KesalahanInput("Kolom jenis harus 'berita' atau 'pengumuman'");
}

// Tingkat pada struktur jabatan: 1, 2, atau 3.
// Lewat keBulatTakNegatif, bukan Number(), supaya " 2 ", "1e0", [3], dan true
// ditolak seperti di validator angka lainnya
export function ambilTingkatJabatan(nilai: unknown): TingkatJabatan {
    const angka = keBulatTakNegatif(nilai);
    if (angka !== null && (TINGKAT_JABATAN as readonly number[]).includes(angka)) {
        return angka as TingkatJabatan;
    }
    throw new KesalahanInput("Kolom tingkat harus bernilai 1, 2, atau 3");
}

// Nama berkas unggahan selalu UUID + ekstensi yang ditentukan dari mimetype
// (lihat middleware/unggah.ts). Pola ketat ini dipakai bersama untuk tiga hal:
// memeriksa nama di DELETE /api/unggah/:nama, memeriksa URL gambar yang
// dikirim bersama data, dan mengenali berkas milik kita saat pembersihan.
export const POLA_NAMA_BERKAS =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/;

const AWALAN_UNGGAH = "/upload/";

// Kolom gambar hanya boleh menunjuk berkas hasil POST /api/unggah. Tanpa ini
// kolomnya menerima teks apa saja, termasuk URL situs lain: siapa pun yang
// memegang token admin bisa memasang gambar dari server luar di halaman
// publik, yang ikut mencatat IP setiap pengunjung dan bisa diganti isinya
// kapan saja tanpa lewat aplikasi ini.
export function urlUnggahanWajib(nilai: unknown, nama: string): string {
    const url = teksWajib(nilai, nama, 255);
    if (!url.startsWith(AWALAN_UNGGAH) || !POLA_NAMA_BERKAS.test(url.slice(AWALAN_UNGGAH.length))) {
        throw new KesalahanInput(`Kolom ${nama} harus berupa gambar hasil unggahan (/upload/...)`);
    }
    return url;
}

export function urlUnggahanOpsional(nilai: unknown, nama: string): string | null {
    if (nilai === undefined || nilai === null || nilai === "") {
        return null;
    }
    return urlUnggahanWajib(nilai, nama);
}

// Kolom tanggal yang boleh tidak dikirim. null berarti "biarkan apa adanya"
// (saat UPDATE) atau "pakai NOW()" (saat INSERT).
export function tanggalOpsional(nilai: unknown, nama: string): Date | null {
    if (nilai === undefined || nilai === null || nilai === "") {
        return null;
    }
    if (typeof nilai !== "string") {
        throw new KesalahanInput(`Kolom ${nama} harus berupa teks tanggal`);
    }
    const tanggal = new Date(nilai);
    if (Number.isNaN(tanggal.getTime())) {
        throw new KesalahanInput(`Kolom ${nama} bukan tanggal yang valid`);
    }
    return tanggal;
}

export function ambilEmail(nilai: unknown): string {
    const email = teksWajib(nilai, "email", 150).toLowerCase();
    // Pemeriksaan sederhana, cukup untuk menyaring salah ketik yang jelas
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        throw new KesalahanInput("Format email tidak valid");
    }
    return email;
}

// bcrypt hanya membaca 72 BYTE pertama dan membuang sisanya tanpa peringatan.
// Panjang string di JavaScript dihitung dalam satuan UTF-16, bukan byte, jadi
// .length tidak bisa dipakai untuk batas ini: password 36 emoji terbaca 72
// tapi sebenarnya 144 byte, lolos pemeriksaan lalu dipotong separuh diam-diam.
// Akibat anehnya, dua password yang hanya berbeda di ekornya sama-sama diterima.
const MAKS_BYTE_BCRYPT = 72;

// Password tidak di-trim karena spasi boleh jadi bagian dari password
export function ambilPassword(nilai: unknown, nama = "password"): string {
    if (typeof nilai !== "string" || nilai === "") {
        throw new KesalahanInput(`Kolom ${nama} wajib diisi`);
    }
    // Minimum tetap dihitung per karakter: itu satuan yang dimengerti orang,
    // dan aturannya datang dari kita sendiri, bukan dari bcrypt
    if (nilai.length < 8) {
        throw new KesalahanInput(`Kolom ${nama} minimal 8 karakter`);
    }

    const byte = Buffer.byteLength(nilai, "utf8");
    if (byte > MAKS_BYTE_BCRYPT) {
        throw new KesalahanInput(
            `Kolom ${nama} terlalu panjang: maksimal ${MAKS_BYTE_BCRYPT} byte, yang dikirim ${byte} byte. ` +
                `Huruf dan angka biasa dihitung 1 byte, huruf beraksen 2 byte, emoji 4 byte.`
        );
    }
    return nilai;
}

// Password yang dikirim untuk DICOCOKKAN dengan hash (login, password lama,
// konfirmasi ganti email), bukan untuk disimpan. Bedanya dengan ambilPassword:
//  - tidak ada batas minimal, supaya password lama yang dibuat sebelum aturan
//    itu ada tetap bisa dipakai
//  - hasilnya null, bukan exception, supaya pemanggil menjawab dengan 401 yang
//    sama persis seperti password salah
// Di atas 72 byte langsung null: tanpa ini, password asli yang ditambah ekor
// apa saja tetap lolos karena bcrypt membuang semua byte setelah ke-72.
export function passwordUntukDicocokkan(nilai: unknown): string | null {
    if (typeof nilai !== "string" || nilai === "") {
        return null;
    }
    if (Buffer.byteLength(nilai, "utf8") > MAKS_BYTE_BCRYPT) {
        return null;
    }
    return nilai;
}

// Body boleh tidak berbentuk objek kalau client lupa header Content-Type
export function ambilBody(nilai: unknown): Record<string, unknown> {
    if (typeof nilai !== "object" || nilai === null || Array.isArray(nilai)) {
        throw new KesalahanInput("Body harus berupa objek JSON (pastikan header Content-Type: application/json)");
    }
    return nilai as Record<string, unknown>;
}
