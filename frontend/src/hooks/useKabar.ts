import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { buatKabar, hapusKabarApi, muatKabar, muatKabarLengkap, ubahKabar } from "../lib/konten";
import { buatSumberData } from "../lib/store";
import type { KabarItem, KabarRingkas } from "../types/kelurahan";

// Daftar kabar ringkas (tanpa isi lengkap) dari PostgreSQL lewat /api/kabar.
// Isi lengkap satu kabar dimuat terpisah lewat useKabarLengkap di bawah.
const sumber = buatSumberData<KabarRingkas[]>([], muatKabar);

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

  return {
    kabar: keadaan.data,
    memuat: keadaan.memuat,
    error: keadaan.error,
    muatUlang: sumber.muatUlang,
    tambah,
    perbarui,
    hapus,
  };
}

interface KeadaanKabarLengkap {
  /** null saat masih memuat, gagal, atau kabarnya memang tidak ada */
  data: KabarItem | null;
  memuat: boolean;
  error: string;
}

// Satu kabar lengkap (isi dan galeri) untuk halaman detail dan form ubah.
// Selalu diambil langsung dari server, tidak disimpan bersama, jadi yang
// tampil adalah isi terbaru di database.
//
// Komponen pemakainya dipasang dengan key={id}, sehingga pindah ke kabar lain
// berarti komponen baru dengan keadaan awal "memuat". Karena itu efek di sini
// tidak perlu mengosongkan keadaan lebih dulu, cukup mengisi saat hasilnya tiba.
export function useKabarLengkap(id: string): KeadaanKabarLengkap {
  const [keadaan, setKeadaan] = useState<KeadaanKabarLengkap>({ data: null, memuat: true, error: "" });

  useEffect(() => {
    // Mencegah hasil yang datang terlambat menimpa keadaan komponen yang sudah dilepas
    let batal = false;
    muatKabarLengkap(id).then(
      (data) => {
        if (!batal) setKeadaan({ data, memuat: false, error: "" });
      },
      (err: unknown) => {
        if (!batal) {
          setKeadaan({
            data: null,
            memuat: false,
            error: err instanceof Error ? err.message : "Gagal memuat kabar",
          });
        }
      },
    );
    return () => {
      batal = true;
    };
  }, [id]);

  return keadaan;
}
