import { TINGKAT_JABATAN, type TingkatJabatan } from "../types/kelurahan";
import type { KabarItem, PendudukStat, PerangkatItem } from "../types/kelurahan";
import { apiFetch } from "./api";
import { ambilToken } from "./auth";
import { keTanggalInput } from "./tanggal";

// Penerjemah antara bentuk data backend (snake_case, id angka, jenis huruf kecil)
// dan bentuk yang dipakai komponen. Semua penyesuaian nama kolom terkumpul di
// satu berkas ini supaya komponen tidak perlu tahu bentuk tabelnya.

// ============================== KABAR ==============================

interface KabarApi {
  id: number;
  jenis: "berita" | "pengumuman";
  judul: string;
  tanggal_upload: string;
  gambar_utama: string;
  ringkasan: string | null;
  deskripsi_lengkap: string;
  gambar_lain?: { id: number; gambar_url: string; urutan: number | null }[];
}

function keKabarItem(api: KabarApi): KabarItem {
  return {
    id: String(api.id),
    jenis: api.jenis === "pengumuman" ? "Pengumuman" : "Berita",
    tanggal: keTanggalInput(api.tanggal_upload),
    judul: api.judul,
    ringkas: api.ringkasan ?? "",
    deskripsi: api.deskripsi_lengkap,
    gambar: api.gambar_utama,
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

export async function muatKabar(): Promise<KabarItem[]> {
  const hasil = await apiFetch<{ data: KabarApi[] }>("/api/kabar?limit=100");
  return hasil.data.map(keKabarItem);
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

// Tabel penduduk menyimpan riwayat (satu baris per pembaruan), yang dipakai
// halaman publik adalah baris terbaru. id-nya disimpan supaya penyimpanan
// berikutnya memperbarui baris yang sama, bukan menumpuk baris baru.
export interface DataPenduduk {
  id: number | null;
  stat: PendudukStat;
}

export const PENDUDUK_KOSONG: DataPenduduk = {
  id: null,
  stat: { lakiLaki: 0, perempuan: 0 },
};

export async function muatPenduduk(): Promise<DataPenduduk> {
  const hasil = await apiFetch<PendudukApi[]>("/api/penduduk");
  const terbaru = hasil[0];
  if (!terbaru) return PENDUDUK_KOSONG;

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
