import { useCallback } from "react";
import { PERANGKAT as PERANGKAT_AWAL } from "../data/profil";
import { buatId } from "../lib/id";
import type { PerangkatItem } from "../types/kelurahan";
import { useLocalStorageState } from "./useLocalStorageState";

const KUNCI = "admin_struktur";

export function useStruktur() {
  const [perangkat, setPerangkat] = useLocalStorageState<PerangkatItem[]>(KUNCI, PERANGKAT_AWAL);

  const tambah = useCallback(
    (item: Omit<PerangkatItem, "id">) => {
      const baru: PerangkatItem = { ...item, id: buatId("perangkat") };
      setPerangkat((s) => [...s, baru]);
      return baru;
    },
    [setPerangkat],
  );

  const perbarui = useCallback(
    (id: string, perubahan: Partial<Omit<PerangkatItem, "id">>) => {
      setPerangkat((s) => s.map((p) => (p.id === id ? { ...p, ...perubahan } : p)));
    },
    [setPerangkat],
  );

  const hapus = useCallback(
    (id: string) => {
      setPerangkat((s) => s.filter((p) => p.id !== id));
    },
    [setPerangkat],
  );

  return { perangkat, tambah, perbarui, hapus };
}
