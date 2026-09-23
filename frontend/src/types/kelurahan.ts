export interface NavChild {
  label: string;
  path: string;
}

export interface NavItem {
  label: string;
  path?: string;
  children?: NavChild[];
}

export interface LayananItem {
  nama: string;
  waktu: string;
  syarat: string[];
}

export interface KabarItem {
  id: string;
  jenis: "Berita" | "Pengumuman";
  /** Tanggal ISO (YYYY-MM-DD). Diformat ke bahasa Indonesia saat dirender. */
  tanggal: string;
  judul: string;
  ringkas: string;
  /** Wajib: kolom deskripsi_lengkap di database bersifat NOT NULL. */
  deskripsi: string;
  /** Wajib: kolom gambar_utama di database bersifat NOT NULL. */
  gambar: string;
  /** Galeri foto tambahan yang tampil di bawah artikel, maksimal 5 gambar. */
  gambarLain?: string[];
}

/**
 * Tingkat pada bagan struktur jabatan. Tingkat 1 hanya untuk satu orang
 * (Kepala Kelurahan), tingkat 2 dan 3 boleh diisi lebih dari satu.
 * Angkanya hanya mengatur urutan baris kartu, tulisan tingkatnya sendiri
 * tidak pernah tampil di halaman publik.
 */
export const TINGKAT_JABATAN = [1, 2, 3] as const;
export type TingkatJabatan = (typeof TINGKAT_JABATAN)[number];

export interface PerangkatItem {
  id: string;
  jabatan: string;
  nama: string;
  tingkat: TingkatJabatan;
  /** Foto profil orang yang menjabat, opsional. */
  foto?: string;
  /** Nomor Induk Pegawai, opsional. */
  nip?: string;
}

export interface StatItem {
  label: string;
  nilai: number;
}

/** Jumlah penduduk berdasarkan jenis kelamin, bisa diubah lewat admin. */
export interface PendudukStat {
  lakiLaki: number;
  perempuan: number;
}

export interface BatasWilayah {
  arah: string;
  wilayah: string;
}

export interface FaktaGeografis {
  label: string;
  nilai: string;
}
