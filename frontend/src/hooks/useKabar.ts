import { useCallback } from "react";
import { KABAR as KABAR_AWAL } from "../data/kabar";
import { buatId } from "../lib/id";
import type { KabarItem } from "../types/kelurahan";
import { useLocalStorageState } from "./useLocalStorageState";

const KUNCI = "admin_kabar";

export function useKabar() {
  const [kabar, setKabar] = useLocalStorageState<KabarItem[]>(KUNCI, KABAR_AWAL);

  const tambah = useCallback(
    (item: Omit<KabarItem, "id">) => {
      const baru: KabarItem = { ...item, id: buatId("kabar") };
      setKabar((s) => [baru, ...s]);
      return baru;
    },
    [setKabar],
  );

  const perbarui = useCallback(
    (id: string, perubahan: Partial<Omit<KabarItem, "id">>) => {
      setKabar((s) => s.map((k) => (k.id === id ? { ...k, ...perubahan } : k)));
    },
    [setKabar],
  );

  const hapus = useCallback(
    (id: string) => {
      setKabar((s) => s.filter((k) => k.id !== id));
    },
    [setKabar],
  );

  const cariById = useCallback((id: string) => kabar.find((k) => k.id === id), [kabar]);

  return { kabar, tambah, perbarui, hapus, cariById };
}
