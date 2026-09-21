import type { BatasWilayah, FaktaGeografis, StatItem } from "../types/kelurahan";

export const FAKTA_GEOGRAFIS: FaktaGeografis[] = [
  { label: "Luas wilayah", nilai: "2,14 km²" },
  { label: "Ketinggian", nilai: "8 mdpl" },
  { label: "Jarak ke pusat kabupaten", nilai: "1,1 km" },
  { label: "Jumlah RT / RW", nilai: "21 RT / 6 RW" },
];

export const BATAS_WILAYAH: BatasWilayah[] = [
  { arah: "Utara", wilayah: "Kelurahan Tumenggungan dan Kelurahan Jetis" },
  { arah: "Selatan", wilayah: "Desa Sidomukti" },
  { arah: "Timur", wilayah: "Kelurahan Tlogoanyar" },
  { arah: "Barat", wilayah: "Kelurahan Sukomulyo dan Desa Wajik" },
];

export const PENGGUNAAN_LAHAN: StatItem[] = [
  { label: "Permukiman", nilai: 42 },
  { label: "Sawah dan tambak", nilai: 38 },
  { label: "Fasilitas umum", nilai: 12 },
  { label: "Lainnya", nilai: 8 },
];
