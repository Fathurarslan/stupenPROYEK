import { useCallback, useEffect, useSyncExternalStore } from "react";
import { buatStruktur, hapusStrukturApi, muatStruktur, ubahStruktur } from "../lib/konten";
import { buatSumberData } from "../lib/store";
import type { PerangkatItem } from "../types/kelurahan";

// Data struktur jabatan sekarang berasal dari PostgreSQL lewat
// /api/struktur-jabatan, bukan lagi dari localStorage.
const sumber = buatSumberData<PerangkatItem[]>([], muatStruktur);

export function useStruktur() {
  const keadaan = useSyncExternalStore(sumber.langgan, sumber.baca);

  useEffect(() => {
    sumber.pastikanDimuat();
  }, []);

  const tambah = useCallback(async (item: Omit<PerangkatItem, "id">) => {
    const baru = await buatStruktur(item);
    await sumber.muatUlang();
    return baru;
  }, []);

  const perbarui = useCallback(async (id: string, item: Omit<PerangkatItem, "id">) => {
    const hasil = await ubahStruktur(id, item);
    await sumber.muatUlang();
    return hasil;
  }, []);

  const hapus = useCallback(async (id: string) => {
    await hapusStrukturApi(id);
    await sumber.muatUlang();
  }, []);

  return {
    perangkat: keadaan.data,
    memuat: keadaan.memuat,
    error: keadaan.error,
    muatUlang: sumber.muatUlang,
    tambah,
    perbarui,
    hapus,
  };
}
