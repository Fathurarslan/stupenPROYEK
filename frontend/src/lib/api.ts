const DASAR = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const DASAR_API = DASAR;

// Backend menyimpan gambar sebagai path relatif (/upload/xxx.jpg) supaya tetap
// benar kalau domainnya pindah. Fungsi ini melengkapinya jadi URL penuh saat
// dirender. Nilai lain — data URL lama, http penuh, atau aset hasil bundling
// Vite — dibiarkan apa adanya.
export function urlPenuh(path: string | undefined): string | undefined {
  if (!path) return path;
  return path.startsWith("/upload/") ? `${DASAR}${path}` : path;
}

export class KesalahanApi extends Error {
  // status 0 berarti permintaan tidak sampai ke server (backend mati / salah URL)
  status: number;

  constructor(status: number, pesan: string) {
    super(pesan);
    this.name = "KesalahanApi";
    this.status = status;
  }
}

interface OpsiApi {
  metode?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
}

function bacaPesan(isi: unknown, status: number): string {
  if (typeof isi === "object" && isi !== null && "pesan" in isi) {
    const pesan = (isi as { pesan: unknown }).pesan;
    if (typeof pesan === "string" && pesan !== "") return pesan;
  }
  return `Permintaan gagal (HTTP ${status})`;
}

export async function apiFetch<T>(jalur: string, opsi: OpsiApi = {}): Promise<T> {
  const { metode = "GET", body, token } = opsi;

  const header: Record<string, string> = {};
  if (body !== undefined) header["Content-Type"] = "application/json";
  if (token) header["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${DASAR}${jalur}`, {
      method: metode,
      headers: header,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new KesalahanApi(
      0,
      "Tidak bisa menghubungi server. Pastikan backend sudah dijalankan dengan npm run dev.",
    );
  }

  // 204 No Content, contohnya hasil DELETE
  if (res.status === 204) return undefined as T;

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
    throw new KesalahanApi(res.status, bacaPesan(isi, res.status));
  }

  return isi as T;
}
