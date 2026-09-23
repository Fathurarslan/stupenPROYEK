import { useSyncExternalStore } from "react";
import { bacaNotifikasi, langganNotifikasi, tutupNotifikasi } from "../../lib/notifikasi";

// Tumpukan notifikasi di pojok kanan atas halaman admin. Dipasang sekali di
// AdminLayout, jadi semua halaman admin memakai tumpukan yang sama.
export default function Notifikasi() {
  const daftar = useSyncExternalStore(langganNotifikasi, bacaNotifikasi);

  return (
    // aria-live membuat pembaca layar ikut membacakan pesannya. Wadahnya selalu
    // ada di DOM walau kosong, karena aria-live hanya mengumumkan isi yang
    // berubah di dalam elemen yang sudah lebih dulu terpasang.
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-5 right-5 z-50 flex w-[320px] max-w-[calc(100vw-40px)] flex-col gap-2"
    >
      {daftar.map((n) => (
        <div
          key={n.id}
          className={`notif-masuk pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-white px-3.5 py-3 shadow-[0_6px_20px_rgba(23,34,27,0.14)] ${
            n.jenis === "sukses" ? "border-daun/40" : "border-[#b3261e]/40"
          }`}
        >
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${
              n.jenis === "sukses" ? "bg-daun" : "bg-[#b3261e]"
            }`}
          >
            {n.jenis === "sukses" ? "✓" : "!"}
          </span>
          <p className="m-0 flex-1 text-[13px] leading-[1.4] text-tinta">{n.pesan}</p>
          <button
            type="button"
            onClick={() => tutupNotifikasi(n.id)}
            aria-label="Tutup notifikasi"
            className="-mt-0.5 -mr-1 cursor-pointer rounded-md border-0 bg-transparent px-1.5 py-0.5 text-[16px] leading-none text-abu hover:text-tinta"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
