import { useState } from "react";
import { Link } from "react-router-dom";
import { useKabar } from "../../hooks/useKabar";

export default function AdminBerita() {
  const { kabar, hapus } = useKabar();
  const [filter, setFilter] = useState("Semua");
  const data = kabar.filter((k) => filter === "Semua" || k.jenis === filter);

  const hapusItem = (id: string, judul: string) => {
    if (window.confirm(`Hapus "${judul}"? Tindakan ini tidak bisa dibatalkan.`)) {
      hapus(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">
            Berita &amp; Pengumuman
          </h1>
          <p className="mt-1.5 text-abu">Kelola berita dan pengumuman yang tampil di beranda.</p>
        </div>
        <Link
          to="/admin/kabar/tambah"
          className="rounded-md bg-sawah px-4 py-2.5 text-[14px] font-semibold text-white no-underline hover:bg-daun"
        >
          + Tambah
        </Link>
      </div>

      <div className="mb-5 flex gap-1.5">
        {["Semua", "Berita", "Pengumuman"].map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={filter === t}
            className="cursor-pointer rounded-full border border-garis bg-white px-3.5 py-2 text-[14px] aria-pressed:border-sawah aria-pressed:bg-sawah aria-pressed:text-white"
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-garis bg-white">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-kabut text-left text-abu">
              <th className="px-4 py-3 font-medium">Gambar</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((k) => (
              <tr key={k.id} className="border-t border-garis align-top">
                <td className="px-4 py-3">
                  {k.gambar ? (
                    <img src={k.gambar} alt="" className="h-12 w-16 rounded object-cover" />
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center rounded bg-kabut text-center text-[11px] text-abu">
                      Tanpa foto
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
                      k.jenis === "Berita" ? "bg-tambak/15 text-tambak" : "bg-padi/25 text-padigelap"
                    }`}
                  >
                    {k.jenis}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-abu">{k.tanggal}</td>
                <td className="px-4 py-3 font-medium text-tinta">{k.judul}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/kabar/edit/${k.id}`}
                      className="rounded-md border border-garis px-3 py-1.5 text-[13px] text-tinta no-underline hover:border-sawah"
                    >
                      Ubah
                    </Link>
                    <button
                      type="button"
                      onClick={() => hapusItem(k.id, k.judul)}
                      className="cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-[13px] text-[#b3261e] hover:bg-[#b3261e]/10"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-abu">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
