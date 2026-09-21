// Login admin sisi klien: belum ada backend, jadi status masuk hanya
// disimpan di perangkat ini (localStorage). Ganti dengan sesi/JWT asli
// begitu API admin tersedia.
const KUNCI = "admin_auth";

// Akun dummy untuk mencoba halaman admin dan CRUD berita/struktur
// sebelum ada backend/API login yang sesungguhnya.
export const AKUN_DUMMY_ADMIN = {
  email: "admin@sidoharjo.id",
  sandi: "admin123",
};

export function validasiLogin(email: string, sandi: string): boolean {
  return (
    email.trim().toLowerCase() === AKUN_DUMMY_ADMIN.email &&
    sandi === AKUN_DUMMY_ADMIN.sandi
  );
}

export function isAdminMasuk(): boolean {
  try {
    return localStorage.getItem(KUNCI) === "1";
  } catch {
    return false;
  }
}

export function masukAdmin() {
  try {
    localStorage.setItem(KUNCI, "1");
  } catch {
    // localStorage tidak tersedia, abaikan
  }
}

export function keluarAdmin() {
  try {
    localStorage.removeItem(KUNCI);
  } catch {
    // localStorage tidak tersedia, abaikan
  }
}
