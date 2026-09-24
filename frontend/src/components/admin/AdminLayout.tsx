import { Link, NavLink, Outlet } from "react-router-dom";
import Notifikasi from "./Notifikasi";
import TombolKeluar from "./TombolKeluar";

const MENU = [
  { label: "Dashboard", to: "/admin", end: true },
  { label: "Berita & Pengumuman", to: "/admin/kabar", end: false },
  { label: "Struktur Jabatan", to: "/admin/struktur", end: false },
  { label: "Statistik Penduduk", to: "/admin/penduduk", end: false },
  { label: "Akun Admin", to: "/admin/akun", end: false },
];

export default function AdminLayout() {

  return (
    <div className="flex min-h-screen bg-kabut max-[860px]:flex-col">
      <Notifikasi />
      <aside className="flex w-64 flex-col bg-sawah text-white max-[860px]:w-full">
        <div className="px-5 py-6">
          <div className="font-heading text-[18px]">Admin Kelurahan</div>
          <div className="text-[13px] opacity-70">Sidoharjo</div>
          <hr className="mt-3" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 max-[860px]:flex-row max-[860px]:flex-wrap">
          {MENU.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-[14px] font-medium no-underline ${
                  isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-5">
          <Link
            to="/"
            className="block rounded-md px-3 py-2.5 text-[14px] font-medium text-white/80 no-underline hover:bg-white/10"
          >
            ← Lihat situs
          </Link>
          <TombolKeluar />
        </div>
      </aside>
      <main className="flex-1">
        <div className="wrap py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
