import { createContext, useContext } from "react";
import type { Admin } from "../../lib/auth";

// Diisi oleh AdminGuard setelah token diverifikasi ke backend,
// supaya AdminLayout bisa menampilkan email yang sedang login
// tanpa memanggil /api/auth/saya lagi.
export const KonteksAdmin = createContext<Admin | null>(null);

export function useAdmin(): Admin {
  const admin = useContext(KonteksAdmin);
  if (!admin) {
    throw new Error("useAdmin dipakai di luar AdminGuard");
  }
  return admin;
}
