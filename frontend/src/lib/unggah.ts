import { DASAR_API, KesalahanApi } from "./api";
import { ambilToken } from "./auth";

// Unggah gambar ke backend (multer). Yang disimpan di data kabar hanya
// path-nya (/upload/xxx.jpg), bukan isi gambarnya, sehingga tidak lagi
// membengkakkan localStorage seperti waktu masih memakai base64.
export interface BerkasTerunggah {
  url: string;
  nama_berkas: string;
  ukuran: number;
  tipe: string;
}

export const UKURAN_MAKS_MB = 5;
export const MAKS_GAMBAR_SEKALIGUS = 5;

// FormData tidak boleh diberi Content-Type manual: browser perlu menyisipkan
// boundary-nya sendiri, jadi permintaan ini tidak lewat apiFetch.
async function kirimBerkas<T>(jalur: string, form: FormData): Promise<T> {
  const token = ambilToken();

  let res: Response;
  try {
    res = await fetch(`${DASAR_API}${jalur}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch {
    throw new KesalahanApi(0, "Tidak bisa menghubungi server saat mengunggah gambar.");
  }

  const teks = await res.text();
  let isi: unknown = null;
  if (teks !== "") {
    try {
      isi = JSON.parse(teks);
    } catch {
      isi = teks;
    }
  }

  if (!res.ok) {
    const pesan =
      typeof isi === "object" && isi !== null && "pesan" in isi &&
      typeof (isi as { pesan: unknown }).pesan === "string"
        ? (isi as { pesan: string }).pesan
        : `Unggahan gagal (HTTP ${res.status})`;
    throw new KesalahanApi(res.status, pesan);
  }

  return isi as T;
}

export async function unggahGambar(berkas: File): Promise<BerkasTerunggah> {
  const form = new FormData();
  form.append("gambar", berkas);
  return kirimBerkas<BerkasTerunggah>("/api/unggah", form);
}

export async function unggahBeberapaGambar(daftar: File[]): Promise<BerkasTerunggah[]> {
  const form = new FormData();
  for (const berkas of daftar) form.append("gambar", berkas);
  const hasil = await kirimBerkas<{ berkas: BerkasTerunggah[] }>("/api/unggah/banyak", form);
  return hasil.berkas;
}

// Dipakai saat admin membatalkan atau mengganti gambar yang baru saja diunggah,
// supaya berkasnya tidak tertinggal di server tanpa pemilik.
export async function hapusGambarTerunggah(namaBerkas: string): Promise<void> {
  const token = ambilToken();
  try {
    await fetch(`${DASAR_API}/api/unggah/${namaBerkas}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // Gagal membersihkan bukan alasan untuk menggagalkan pekerjaan admin
  }
}

// Mengambil nama berkas dari path /upload/<nama>
export function namaDariUrl(url: string | undefined): string | null {
  if (!url) return null;
  const cocok = /^\/upload\/(.+)$/.exec(url);
  return cocok?.[1] ?? null;
}
