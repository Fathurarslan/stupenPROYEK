import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
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

  return {
    penduduk: keadaan.data.stat,
    memuat: keadaan.memuat,
    error: keadaan.error,
    muatUlang: sumber.muatUlang,
    perbarui,
  };
}
