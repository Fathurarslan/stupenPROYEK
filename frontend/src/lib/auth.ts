import { apiFetch, KesalahanApi } from "./api";

// Login admin sungguhan ke backend. Token JWT disimpan di localStorage,
// dan setiap token punya baris sesi di database sehingga logout benar-benar
// mencabutnya di sisi server (bukan cuma menghapus token di browser).
const KUNCI_TOKEN = "admin_token";

export interface Admin {
  id: number;
  email: string;
}

export interface Sesi {
  id: number;
  jti: string;
  user_agent: string | null;
  ip: string | null;
  dibuat_pada: string;
  dipakai_terakhir: string;
  kedaluwarsa_pada: string;
  ini_perangkat_sekarang: boolean;
}

export function ambilToken(): string | null {
  try {
    return localStorage.getItem(KUNCI_TOKEN);
  } catch {
    return null;
  }
}

function simpanToken(token: string) {
  try {
    localStorage.setItem(KUNCI_TOKEN, token);
  } catch {
    // localStorage tidak tersedia (mode privat), sesi hanya bertahan selama tab terbuka
  }
}

// Hanya menghapus token di perangkat ini. Dipakai sebagai jalan terakhir kalau
// server tidak bisa dihubungi, sesi di server bisa jadi masih hidup.
export function hapusTokenLokal() {
  try {
    localStorage.removeItem(KUNCI_TOKEN);
  } catch {
    // abaikan
  }
}

export async function login(email: string, sandi: string): Promise<Admin> {
  const hasil = await apiFetch<{ token: string; admin: Admin }>("/api/auth/login", {
    metode: "POST",
    body: { email: email.trim(), password: sandi },
  });
  simpanToken(hasil.token);
  return hasil.admin;
}

// Mengembalikan data admin kalau token masih sah, null kalau tidak.
// Sesi yang sudah dilogout di perangkat lain juga akan ketahuan di sini.
export async function cekSesi(): Promise<Admin | null> {
  const token = ambilToken();
  if (!token) return null;

  try {
    return await apiFetch<Admin>("/api/auth/saya", { token });
  } catch (err) {
    if (err instanceof KesalahanApi && err.status === 401) {
      hapusTokenLokal();
      return null;
    }
    throw err;
  }
}

// Mencabut sesi ini di server. Token lokal baru dihapus setelah server
// benar-benar mencabutnya, supaya tidak ada ilusi "sudah keluar".
export async function logout(): Promise<void> {
  const token = ambilToken();
  if (!token) return;

  try {
    await apiFetch("/api/auth/logout", { metode: "POST", token });
  } catch (err) {
    // 401 berarti sesinya memang sudah tidak berlaku, hasilnya sama dengan berhasil
    if (!(err instanceof KesalahanApi && err.status === 401)) throw err;
  }
  hapusTokenLokal();
}

// Mencabut semua sesi milik admin ini, termasuk perangkat lain yang masih login
export async function logoutSemua(): Promise<number> {
  const token = ambilToken();
  if (!token) return 0;

  let jumlah = 0;
  try {
    const hasil = await apiFetch<{ jumlah_sesi_dicabut: number }>("/api/auth/logout-semua", {
      metode: "POST",
      token,
    });
    jumlah = hasil.jumlah_sesi_dicabut;
  } catch (err) {
    if (!(err instanceof KesalahanApi && err.status === 401)) throw err;
  }
  hapusTokenLokal();
  return jumlah;
}

export async function daftarSesi(): Promise<Sesi[]> {
  return apiFetch<Sesi[]>("/api/auth/sesi", { token: ambilToken() });
}
