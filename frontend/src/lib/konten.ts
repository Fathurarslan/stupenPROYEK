import { TINGKAT_JABATAN, type TingkatJabatan } from "../types/kelurahan";
import type { KabarItem, KabarRingkas, PendudukStat, PerangkatItem } from "../types/kelurahan";
import { apiFetch, KesalahanApi } from "./api";
import { ambilToken } from "./auth";
import { keTanggalInput } from "./tanggal";

// Penerjemah antara bentuk data backend (snake_case, id angka, jenis huruf kecil)
// dan bentuk yang dipakai komponen. Semua penyesuaian nama kolom terkumpul di
// satu berkas ini supaya komponen tidak perlu tahu bentuk tabelnya.

// ============================== KABAR ==============================

// Bentuk satu kabar di GET /api/kabar (daftar)
interface KabarRingkasApi {
  id: number;
  jenis: "berita" | "pengumuman";
  judul: string;
  tanggal_upload: string;
  gambar_utama: string;
  ringkasan: string | null;
}

// Bentuk di GET /api/kabar/:id dan balasan simpan
interface KabarApi extends KabarRingkasApi {
  deskripsi_lengkap: string;
  gambar_lain?: { id: number; gambar_url: string; urutan: number | null }[];
}

function keKabarRingkas(api: KabarRingkasApi): KabarRingkas {
  return {
    id: String(api.id),
    jenis: api.jenis === "pengumuman" ? "Pengumuman" : "Berita",
    tanggal: keTanggalInput(api.tanggal_upload),
    judul: api.judul,
    ringkas: api.ringkasan ?? "",
    gambar: api.gambar_utama,
  };
}

function keKabarItem(api: KabarApi): KabarItem {
  return {
    ...keKabarRingkas(api),
    deskripsi: api.deskripsi_lengkap,
    gambarLain: (api.gambar_lain ?? []).map((g) => g.gambar_url),
  };
}

function keBodyKabar(item: Omit<KabarItem, "id">) {
  return {
    jenis: item.jenis === "Pengumuman" ? "pengumuman" : "berita",
    judul: item.judul,
    tanggal_upload: item.tanggal,
    gambar_utama: item.gambar,
    ringkasan: item.ringkas,
    deskripsi_lengkap: item.deskripsi,
    gambar_lain: item.gambarLain ?? [],
  };
}

// Batas ?limit di backend (MAKS_LIMIT di routes/kabar.ts), harus sama
const PER_PERMINTAAN = 100;

// Dulu hanya satu permintaan ?limit=100, jadi begitu kabar lebih dari 100 yang
// paling lama hilang diam-diam, termasuk dari tabel admin sehingga tidak bisa
// diubah atau dihapus lagi. Sekarang dimuat per 100 sampai habis. Ini wajar
// karena daftarnya sudah ringkas (tanpa isi lengkap), sekitar 1 KB per kabar.
export async function muatKabar(): Promise<KabarRingkas[]> {
  // Dikumpulkan per id: kalau ada kabar baru masuk di antara dua permintaan,
  // semua baris bergeser satu dan satu kabar terbaca dua kali
  const terkumpul = new Map<number, KabarRingkasApi>();
  let offset = 0;

  for (;;) {
    const hasil = await apiFetch<{ data: KabarRingkasApi[]; total: number }>(
      `/api/kabar?limit=${PER_PERMINTAAN}&offset=${offset}`,
    );
    for (const k of hasil.data) terkumpul.set(k.id, k);
    offset += hasil.data.length;
    if (hasil.data.length < PER_PERMINTAAN || offset >= hasil.total) break;
  }

  return [...terkumpul.values()].map(keKabarRingkas);
}

// null berarti kabarnya tidak ada. 400 ikut dianggap begitu karena id di URL
// yang bukan angka (misalnya /kabar/abc) memang tidak menunjuk kabar apa pun.
export async function muatKabarLengkap(id: string): Promise<KabarItem | null> {
  try {
    const hasil = await apiFetch<KabarApi>(`/api/kabar/${encodeURIComponent(id)}`);
    return keKabarItem(hasil);
  } catch (err) {
    if (err instanceof KesalahanApi && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export async function buatKabar(item: Omit<KabarItem, "id">): Promise<KabarItem> {
  const hasil = await apiFetch<KabarApi>("/api/kabar", {
    metode: "POST",
    body: keBodyKabar(item),
    token: ambilToken(),
  });
  return keKabarItem(hasil);
}

export async function ubahKabar(id: string, item: Omit<KabarItem, "id">): Promise<KabarItem> {
  const hasil = await apiFetch<KabarApi>(`/api/kabar/${id}`, {
    metode: "PUT",
    body: keBodyKabar(item),
    token: ambilToken(),
  });
  return keKabarItem(hasil);
}

export async function hapusKabarApi(id: string): Promise<void> {
  await apiFetch(`/api/kabar/${id}`, { metode: "DELETE", token: ambilToken() });
}

// ========================= STRUKTUR JABATAN =========================

interface StrukturApi {
  id: number;
  foto: string | null;
  nama_jabatan: string;
  nama_pejabat: string;
  nip: string | null;
  tingkat: number;
}

function kePerangkatItem(api: StrukturApi): PerangkatItem {
  return {
    id: String(api.id),
    jabatan: api.nama_jabatan,
    nama: api.nama_pejabat,
    // Data lama sebelum kolom tingkat ada dianggap tingkat 2
    tingkat: keTingkat(api.tingkat),
    foto: api.foto ?? undefined,
    nip: api.nip ?? undefined,
  };
}

function keTingkat(nilai: number): TingkatJabatan {
  return (TINGKAT_JABATAN as readonly number[]).includes(nilai)
    ? (nilai as TingkatJabatan)
    : 2;
}

function keBodyStruktur(item: Omit<PerangkatItem, "id">) {
  return {
    foto: item.foto ?? null,
    nama_jabatan: item.jabatan,
    nama_pejabat: item.nama,
    nip: item.nip ?? null,
    tingkat: item.tingkat,
  };
}

export async function muatStruktur(): Promise<PerangkatItem[]> {
  const hasil = await apiFetch<StrukturApi[]>("/api/struktur-jabatan");
  return hasil.map(kePerangkatItem);
}

export async function buatStruktur(item: Omit<PerangkatItem, "id">): Promise<PerangkatItem> {
  const hasil = await apiFetch<StrukturApi>("/api/struktur-jabatan", {
    metode: "POST",
    body: keBodyStruktur(item),
    token: ambilToken(),
  });
  return kePerangkatItem(hasil);
}

export async function ubahStruktur(
  id: string,
  item: Omit<PerangkatItem, "id">,
): Promise<PerangkatItem> {
  const hasil = await apiFetch<StrukturApi>(`/api/struktur-jabatan/${id}`, {
    metode: "PUT",
    body: keBodyStruktur(item),
    token: ambilToken(),
  });
  return kePerangkatItem(hasil);
}

export async function hapusStrukturApi(id: string): Promise<void> {
  await apiFetch(`/api/struktur-jabatan/${id}`, { metode: "DELETE", token: ambilToken() });
}

// ============================= PENDUDUK =============================

interface PendudukApi {
  id: number;
  laki_laki: number;
  perempuan: number;
  total: number;
}

// Tabel penduduk hanya berisi satu baris (dijaga database). id-nya disimpan
// supaya penyimpanan berikutnya memperbarui baris yang sama lewat PUT, bukan
// mencoba POST baris kedua yang pasti ditolak.
export interface DataPenduduk {
  id: number | null;
  stat: PendudukStat;
}

export const PENDUDUK_KOSONG: DataPenduduk = {
  id: null,
  stat: { lakiLaki: 0, perempuan: 0 },
};

export async function muatPenduduk(): Promise<DataPenduduk> {
  let terbaru: PendudukApi;
  try {
    terbaru = await apiFetch<PendudukApi>("/api/penduduk/terbaru");
  } catch (err) {
    // 404 berarti tabelnya memang masih kosong, bukan kegagalan
    if (err instanceof KesalahanApi && err.status === 404) return PENDUDUK_KOSONG;
    throw err;
  }

  return {
    id: terbaru.id,
    stat: { lakiLaki: terbaru.laki_laki, perempuan: terbaru.perempuan },
  };
}

export async function hapusPendudukApi(id: number): Promise<void> {
  await apiFetch(`/api/penduduk/${id}`, { metode: "DELETE", token: ambilToken() });
}

export async function simpanPenduduk(
  id: number | null,
  stat: PendudukStat,
): Promise<DataPenduduk> {
  const body = { laki_laki: stat.lakiLaki, perempuan: stat.perempuan };

  const hasil = await apiFetch<PendudukApi>(id === null ? "/api/penduduk" : `/api/penduduk/${id}`, {
    metode: id === null ? "POST" : "PUT",
    body,
    token: ambilToken(),
  });

  return {
    id: hasil.id,
    stat: { lakiLaki: hasil.laki_laki, perempuan: hasil.perempuan },
  };
}
