import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  hapusPendudukApi,
  muatPenduduk,
  PENDUDUK_KOSONG,
  simpanPenduduk,
  type DataPenduduk,
} from "../lib/konten";
import { buatSumberData } from "../lib/store";
import type { PendudukStat } from "../types/kelurahan";

// Statistik jumlah penduduk yang tampil di beranda, sekarang dari
// tabel penduduk di PostgreSQL lewat /api/penduduk.
const sumber = buatSumberData<DataPenduduk>(PENDUDUK_KOSONG, muatPenduduk);

export function usePenduduk() {
  const keadaan = useSyncExternalStore(sumber.langgan, sumber.baca);

  useEffect(() => {
    sumber.pastikanDimuat();
  }, []);

  // Baris pertama dibuat lewat POST, pembaruan berikutnya lewat PUT ke baris
  // yang sama supaya tabel tidak menumpuk satu baris tiap kali disimpan.
  const perbarui = useCallback(async (stat: PendudukStat) => {
    const hasil = await simpanPenduduk(sumber.baca().data.id, stat);
    sumber.ganti(hasil);
    return hasil.stat;
  }, []);

  // Menghapus barisnya di database, bukan sekadar menolkan angkanya. Sesudah
  // itu data dimuat ulang supaya angka yang dipakai halaman publik ikut
  // mengikuti isi tabel yang sekarang, lalu stat hasilnya dikembalikan agar
  // form admin bisa langsung menyesuaikan isi kotaknya.
  const hapus = useCallback(async () => {
    const id = sumber.baca().data.id;
    if (id !== null) await hapusPendudukApi(id);
    await sumber.muatUlang();
    return sumber.baca().data.stat;
  }, []);

  return {
    penduduk: keadaan.data.stat,
    // Tombol hapus tidak ada gunanya selama tabelnya memang masih kosong
    adaData: keadaan.data.id !== null,
    memuat: keadaan.memuat,
    error: keadaan.error,
    muatUlang: sumber.muatUlang,
    perbarui,
    hapus,
  };
}
