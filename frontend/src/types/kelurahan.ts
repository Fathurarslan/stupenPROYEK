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

export interface PerangkatItem {
  id: string;
  jabatan: string;
  nama: string;
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
