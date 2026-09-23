// Notifikasi singkat (toast) untuk halaman admin.
//
// Disimpan di luar React dengan pola yang sama seperti store.ts, bukan lewat
// state komponen, karena ada aksi yang langsung pindah halaman sesudah berhasil
// (menyimpan kabar lalu kembali ke daftar). Kalau pesannya dipegang komponen,
// pesan itu ikut hilang saat komponennya dilepas.

export type JenisNotifikasi = "sukses" | "gagal";

export interface Notifikasi {
  id: number;
  jenis: JenisNotifikasi;
  pesan: string;
}

// Pesan gagal ditahan lebih lama karena biasanya perlu dibaca sampai habis
const LAMA_TAMPIL: Record<JenisNotifikasi, number> = {
  sukses: 3000,
  gagal: 6000,
};

let daftar: Notifikasi[] = [];
let nomorTerakhir = 0;
const pendengar = new Set<() => void>();

// Seperti di store.ts: array diganti utuh, tidak pernah dimutasi, supaya
// useSyncExternalStore bisa membandingkannya dengan Object.is.
function pasang(baru: Notifikasi[]) {
  daftar = baru;
  for (const dengar of pendengar) dengar();
}

export function bacaNotifikasi(): Notifikasi[] {
  return daftar;
}

export function langganNotifikasi(dengar: () => void): () => void {
  pendengar.add(dengar);
  return () => {
    pendengar.delete(dengar);
  };
}

export function tutupNotifikasi(id: number) {
  if (daftar.some((n) => n.id === id)) {
    pasang(daftar.filter((n) => n.id !== id));
  }
}

function beriTahu(jenis: JenisNotifikasi, pesan: string) {
  const id = ++nomorTerakhir;
  pasang([...daftar, { id, jenis, pesan }]);
  setTimeout(() => tutupNotifikasi(id), LAMA_TAMPIL[jenis]);
}

export function notifSukses(pesan: string) {
  beriTahu("sukses", pesan);
}

export function notifGagal(pesan: string) {
  beriTahu("gagal", pesan);
}

// Dipakai di blok catch: pesan dari server dipakai apa adanya kalau ada,
// selebihnya jatuh ke kalimat cadangan yang ditulis pemanggilnya.
export function notifGagalDari(err: unknown, cadangan: string) {
  notifGagal(err instanceof Error ? err.message : cadangan);
}
