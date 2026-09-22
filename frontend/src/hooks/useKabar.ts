import { useCallback, useEffect, useSyncExternalStore } from "react";
import { buatKabar, hapusKabarApi, muatKabar, ubahKabar } from "../lib/konten";
import { buatSumberData } from "../lib/store";
import type { KabarItem } from "../types/kelurahan";

// Data kabar sekarang berasal dari PostgreSQL lewat /api/kabar,
// bukan lagi dari localStorage.
const sumber = buatSumberData<KabarItem[]>([], muatKabar);

export function useKabar() {
  const keadaan = useSyncExternalStore(sumber.langgan, sumber.baca);

  useEffect(() => {
    sumber.pastikanDimuat();
  }, []);

  // Setelah menulis, data dimuat ulang dari server supaya id dan urutan
  // persis sama dengan isi database, bukan tebakan di sisi klien.
  const tambah = useCallback(async (item: Omit<KabarItem, "id">) => {
    const baru = await buatKabar(item);
    await sumber.muatUlang();
    return baru;
  }, []);

  const perbarui = useCallback(async (id: string, item: Omit<KabarItem, "id">) => {
    const hasil = await ubahKabar(id, item);
    await sumber.muatUlang();
    return hasil;
  }, []);

  const hapus = useCallback(async (id: string) => {
    await hapusKabarApi(id);
    await sumber.muatUlang();
  }, []);

  const cariById = useCallback(
    (id: string) => keadaan.data.find((k) => k.id === id),
    [keadaan.data],
  );

  return {
    kabar: keadaan.data,
    memuat: keadaan.memuat,
    error: keadaan.error,
    muatUlang: sumber.muatUlang,
    tambah,
    perbarui,
    hapus,
    cariById,
  };
}
