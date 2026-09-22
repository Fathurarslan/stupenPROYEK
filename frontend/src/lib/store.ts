// Penyimpan data sederhana di luar React.
//
// Beranda memasang useKabar dua kali (Kabar dan KabarCarousel). Kalau tiap hook
// memuat sendiri-sendiri, backend dipanggil berkali-kali untuk data yang sama
// dan hasil sesudah menyimpan bisa berbeda antar komponen. Dengan satu sumber
// bersama, semua komponen melihat data yang sama dan ikut ter-render ulang
// setelah ada perubahan.
export interface Keadaan<T> {
  data: T;
  memuat: boolean;
  error: string;
}

export interface SumberData<T> {
  baca: () => Keadaan<T>;
  langgan: (dengar: () => void) => () => void;
  pastikanDimuat: () => void;
  muatUlang: () => Promise<void>;
  ganti: (data: T) => void;
}

export function buatSumberData<T>(awal: T, muat: () => Promise<T>): SumberData<T> {
  let keadaan: Keadaan<T> = { data: awal, memuat: true, error: "" };
  let sudahDiminta = false;
  const pendengar = new Set<() => void>();

  // useSyncExternalStore membandingkan hasil baca dengan Object.is, jadi objek
  // keadaan diganti utuh setiap ada perubahan dan tidak pernah dimutasi.
  function pasang(baru: Keadaan<T>) {
    keadaan = baru;
    for (const dengar of pendengar) dengar();
  }

  async function muatUlang() {
    pasang({ ...keadaan, memuat: true, error: "" });
    try {
      pasang({ data: await muat(), memuat: false, error: "" });
    } catch (err) {
      pasang({
        ...keadaan,
        memuat: false,
        error: err instanceof Error ? err.message : "Gagal memuat data",
      });
    }
  }

  return {
    baca: () => keadaan,
    langgan: (dengar) => {
      pendengar.add(dengar);
      return () => {
        pendengar.delete(dengar);
      };
    },
    pastikanDimuat: () => {
      if (sudahDiminta) return;
      sudahDiminta = true;
      void muatUlang();
    },
    muatUlang,
    ganti: (data) => pasang({ data, memuat: false, error: "" }),
  };
}
