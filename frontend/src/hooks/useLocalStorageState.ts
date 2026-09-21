import { useEffect, useState } from "react";

// Menyimpan state di localStorage supaya perubahan dari halaman admin
// (tambah/ubah/hapus) tetap ada setelah reload. Setiap komponen membaca
// nilai terbaru saat pertama kali dipasang, jadi selama admin dan halaman
// publik tidak tampil bersamaan di tab yang sama, datanya tetap konsisten.
export function useLocalStorageState<T>(kunci: string, nilaiAwal: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const mentah = localStorage.getItem(kunci);
      return mentah ? (JSON.parse(mentah) as T) : nilaiAwal;
    } catch {
      return nilaiAwal;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(kunci, JSON.stringify(state));
    } catch {
      // localStorage penuh/tidak tersedia, abaikan
    }
  }, [kunci, state]);

  return [state, setState] as const;
}
