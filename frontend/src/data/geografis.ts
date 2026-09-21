import type { BatasWilayah, FaktaGeografis, StatItem } from "../types/kelurahan";

export const FAKTA_GEOGRAFIS: FaktaGeografis[] = [
  { label: "Luas wilayah", nilai: "±2,3 km²" },
  { label: "Ketinggian", nilai: "8 mdpl" },
  { label: "Jarak ke pusat kabupaten", nilai: "±3 km" },
  { label: "Jumlah RT / RW", nilai: "18 RT / 5 RW" },
];

export const BATAS_WILAYAH: BatasWilayah[] = [
  { arah: "Utara", wilayah: "Kelurahan/Desa tetangga sebelah utara" },
  { arah: "Selatan", wilayah: "Kelurahan/Desa tetangga sebelah selatan" },
  { arah: "Timur", wilayah: "Kelurahan/Desa tetangga sebelah timur" },
  { arah: "Barat", wilayah: "Kelurahan/Desa tetangga sebelah barat" },
];

export const PENGGUNAAN_LAHAN: StatItem[] = [
  { label: "Permukiman", nilai: 42 },
  { label: "Sawah dan tambak", nilai: 38 },
  { label: "Fasilitas umum", nilai: 12 },
  { label: "Lainnya", nilai: 8 },
];
