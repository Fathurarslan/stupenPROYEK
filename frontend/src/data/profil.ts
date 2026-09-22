import type { FaktaGeografis } from "../types/kelurahan";

// Daftar perangkat kelurahan tidak lagi di sini: datanya sekarang berasal dari
// tabel struktur_jabatan lewat useStruktur().

// Sumber: Tabel 2.1 Profil Kelurahan Sidoharjo
export const IDENTITAS_KELURAHAN: FaktaGeografis[] = [
  { label: "Nama Kelurahan", nilai: "Kelurahan Sidoharjo" },
  { label: "Provinsi", nilai: "Jawa Timur" },
  { label: "Alamat", nilai: "Jl. Soekarno Hatta No. 01, Lamongan" },
  { label: "Kode Pos", nilai: "62217" },
  { label: "Email", nilai: "sidoharjolmg@gmail.com" },
  { label: "Luas Wilayah Administrasi", nilai: "2,14 km²" },
];

// Sumber: data jumlah penduduk dan kepadatan Kelurahan Sidoharjo
export const DATA_PENDUDUK: FaktaGeografis[] = [
  { label: "Jumlah Penduduk", nilai: "5.414 jiwa" },
  { label: "Kepadatan", nilai: "2.492 jiwa/km²" },
];
