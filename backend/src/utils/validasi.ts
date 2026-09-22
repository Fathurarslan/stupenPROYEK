import { JENIS_KABAR, type JenisKabar } from "../types.js";
import { KesalahanInput } from "./kesalahan.js";

// Ambil :id dari URL atau body, pastikan angka bulat positif
export function ambilId(nilai: unknown, nama = "id"): number {
    const angka = Number(nilai);
    if (!Number.isInteger(angka) || angka < 1) {
        throw new KesalahanInput(`Kolom ${nama} harus berupa angka bulat positif`);
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

export function bulatTakNegatif(nilai: unknown, nama: string): number {
    const angka = Number(nilai);
    if (nilai === null || nilai === undefined || nilai === "" || !Number.isInteger(angka) || angka < 0) {
        throw new KesalahanInput(`Kolom ${nama} harus berupa angka bulat 0 atau lebih`);
    }
    return angka;
}

export function ambilJenisKabar(nilai: unknown): JenisKabar {
    if (typeof nilai === "string" && (JENIS_KABAR as readonly string[]).includes(nilai)) {
        return nilai as JenisKabar;
    }
    throw new KesalahanInput("Kolom jenis harus 'berita' atau 'pengumuman'");
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

// Password tidak di-trim karena spasi boleh jadi bagian dari password
export function ambilPassword(nilai: unknown, nama = "password"): string {
    if (typeof nilai !== "string" || nilai === "") {
        throw new KesalahanInput(`Kolom ${nama} wajib diisi`);
    }
    if (nilai.length < 8) {
        throw new KesalahanInput(`Kolom ${nama} minimal 8 karakter`);
    }
    if (nilai.length > 72) {
        // bcrypt hanya membaca 72 byte pertama, sisanya diabaikan tanpa peringatan
        throw new KesalahanInput(`Kolom ${nama} maksimal 72 karakter`);
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
