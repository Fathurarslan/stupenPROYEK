import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { cekSesi, type Admin } from "../../lib/auth";
import { KonteksAdmin } from "./KonteksAdmin";

// Membungkus rute /admin agar hanya bisa diakses setelah login.
// Token diverifikasi ke backend (GET /api/auth/saya), jadi token yang sudah
// dilogout dari perangkat lain langsung tertolak di sini, bukan hanya
// mengandalkan ada-tidaknya nilai di localStorage.
type Status =
  | { tahap: "memuat" }
  | { tahap: "masuk"; admin: Admin }
  | { tahap: "keluar" }
  | { tahap: "gagal"; pesan: string };

export default function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<Status>({ tahap: "memuat" });

  useEffect(() => {
    let dibatalkan = false;

    cekSesi()
      .then((admin) => {
        if (dibatalkan) return;
        setStatus(admin ? { tahap: "masuk", admin } : { tahap: "keluar" });
      })
      .catch((err: unknown) => {
        if (dibatalkan) return;
        // Server mati atau error jaringan. Jangan dianggap "belum login",
        // karena token bisa jadi masih sah begitu server hidup lagi.
        setStatus({
          tahap: "gagal",
          pesan: err instanceof Error ? err.message : "Gagal memeriksa sesi",
        });
      });

    return () => {
      dibatalkan = true;
    };
  }, []);

  if (status.tahap === "memuat") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kabut">
        <p className="text-[15px] text-abu">Memeriksa sesi…</p>
      </div>
    );
  }

  if (status.tahap === "gagal") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kabut px-5">
        <div className="max-w-md rounded-xl border border-garis bg-white p-6 text-center">
          <h1 className="font-heading text-[18px] text-tinta">Sesi tidak bisa diperiksa</h1>
          <p className="mt-2 text-[14px] text-abu">{status.pesan}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 cursor-pointer rounded-md border-0 bg-sawah px-4 py-2 text-[14px] font-semibold text-white hover:bg-daun"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (status.tahap === "keluar") {
    return <Navigate to="/login" replace state={{ dari: location.pathname }} />;
  }

  return <KonteksAdmin.Provider value={status.admin}>{children}</KonteksAdmin.Provider>;
}
