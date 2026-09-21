import { useCallback } from "react";
import { PENDUDUK_AWAL } from "../data/wilayah";
import type { PendudukStat } from "../types/kelurahan";
import { useLocalStorageState } from "./useLocalStorageState";

const KUNCI = "admin_penduduk";

// Statistik jumlah penduduk (laki-laki & perempuan) yang tampil di
// beranda. Nilainya bisa diubah lewat halaman admin dan tersimpan di
// localStorage seperti data struktur jabatan & berita.
export function usePenduduk() {
  const [penduduk, setPenduduk] = useLocalStorageState<PendudukStat>(KUNCI, PENDUDUK_AWAL);

  const perbarui = useCallback(
    (perubahan: Partial<PendudukStat>) => {
      setPenduduk((s) => ({ ...s, ...perubahan }));
    },
    [setPenduduk],
  );

  return { penduduk, perbarui };
}
