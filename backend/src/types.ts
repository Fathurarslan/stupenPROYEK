// Bentuk baris tiap tabel, mengikuti src/db/SCHEMA.sql

export const JENIS_KABAR = ["berita", "pengumuman"] as const;
export type JenisKabar = (typeof JENIS_KABAR)[number];

export interface Kabar {
    id: number;
    jenis: JenisKabar;
    judul: string;
    tanggal_upload: Date;
    gambar_utama: string;
    ringkasan: string | null;
    deskripsi_lengkap: string;
    admin_id: number | null;
    created_at: Date;
    updated_at: Date;
}

export interface KabarGambar {
    id: number;
    kabar_id: number;
    gambar_url: string;
    urutan: number | null;
    created_at: Date;
}

// Kabar beserta daftar gambar tambahannya (hasil json_agg)
export interface KabarLengkap extends Kabar {
    gambar_lain: Pick<KabarGambar, "id" | "gambar_url" | "urutan">[];
}

// Tingkat 1 hanya boleh diisi satu orang (Kepala Kelurahan), tingkat 2 dan 3
// boleh lebih dari satu. Lihat migrations/002_tingkat_struktur.sql.
export const TINGKAT_JABATAN = [1, 2, 3] as const;
export type TingkatJabatan = (typeof TINGKAT_JABATAN)[number];

export interface StrukturJabatan {
    id: number;
    foto: string | null;
    nama_jabatan: string;
    nama_pejabat: string;
    nip: string | null;
    tingkat: TingkatJabatan;
    created_at: Date;
    updated_at: Date;
}

export interface Penduduk {
    id: number;
    laki_laki: number;
    perempuan: number;
    total: number; // dihitung otomatis oleh PostgreSQL, jangan pernah dikirim manual
    updated_at: Date;
}
