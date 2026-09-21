import type { PendudukStat, StatItem } from "../types/kelurahan";

export const PENDUDUK: StatItem[] = [
  { label: "Laki laki", nilai: 2140 },
  { label: "Perempuan", nilai: 2215 },
];

// Nilai awal statistik penduduk yang tampil di beranda. Admin bisa
// mengubahnya lewat halaman /admin/penduduk (tersimpan di localStorage).
export const PENDUDUK_AWAL: PendudukStat = {
  lakiLaki: 2140,
  perempuan: 2215,
};

export const PEKERJAAN: StatItem[] = [
  { label: "Petani dan buruh tani", nilai: 38 },
  { label: "Pedagang dan UMKM", nilai: 24 },
  { label: "Karyawan swasta", nilai: 18 },
  { label: "PNS, TNI, Polri", nilai: 7 },
  { label: "Lainnya", nilai: 13 },
];
