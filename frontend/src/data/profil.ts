import type { FaktaGeografis, PerangkatItem } from "../types/kelurahan";

export const PERANGKAT: PerangkatItem[] = [
  { id: "perangkat-1", jabatan: "Lurah", nama: "Nama Lurah" },
  { id: "perangkat-2", jabatan: "Sekretaris Kelurahan", nama: "Nama Sekretaris" },
  { id: "perangkat-3", jabatan: "Kasi Pemerintahan", nama: "Nama Pejabat" },
  { id: "perangkat-4", jabatan: "Kasi Kesejahteraan Sosial", nama: "Nama Pejabat" },
  { id: "perangkat-5", jabatan: "Kasi Pembangunan", nama: "Nama Pejabat" },
];

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
