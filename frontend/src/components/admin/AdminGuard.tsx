import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminMasuk } from "../../lib/auth";

// Membungkus rute /admin agar hanya bisa diakses setelah login.
// Login saat ini hanya memvalidasi form dan menyimpan status di
// localStorage (lihat lib/auth.ts) karena belum ada backend/API admin.
export default function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!isAdminMasuk()) {
    return <Navigate to="/login" replace state={{ dari: location.pathname }} />;
  }

  return <>{children}</>;
}
