import { Link } from "react-router-dom";
import { useKabar } from "../../hooks/useKabar";
import { usePenduduk } from "../../hooks/usePenduduk";
import { useStruktur } from "../../hooks/useStruktur";

export default function AdminDashboard() {
  const { kabar } = useKabar();
  const { perangkat } = useStruktur();
  const { penduduk } = usePenduduk();
  const jumlahBerita = kabar.filter((k) => k.jenis === "Berita").length;
  const jumlahPengumuman = kabar.filter((k) => k.jenis === "Pengumuman").length;
  const totalPenduduk = penduduk.lakiLaki + penduduk.perempuan;

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">Dashboard</h1>
      <p className="mt-1.5 mb-8 text-abu">Kelola konten situs Kelurahan Sidoharjo.</p>

      <div className="grid grid-cols-4 gap-4 max-[860px]:grid-cols-2 max-[480px]:grid-cols-1">
        <Link
          to="/admin/kabar"
          className="rounded-lg border border-garis bg-white p-5 no-underline hover:border-sawah"
        >
          <div className="text-[13px] text-abu">Berita</div>
          <div className="font-heading text-[28px] text-sawah">{jumlahBerita}</div>
        </Link>
        <Link
          to="/admin/kabar"
          className="rounded-lg border border-garis bg-white p-5 no-underline hover:border-sawah"
        >
          <div className="text-[13px] text-abu">Pengumuman</div>
          <div className="font-heading text-[28px] text-sawah">{jumlahPengumuman}</div>
        </Link>
        <Link
          to="/admin/struktur"
          className="rounded-lg border border-garis bg-white p-5 no-underline hover:border-sawah"
        >
          <div className="text-[13px] text-abu">Perangkat kelurahan</div>
          <div className="font-heading text-[28px] text-sawah">{perangkat.length}</div>
        </Link>
        <Link
          to="/admin/penduduk"
          className="rounded-lg border border-garis bg-white p-5 no-underline hover:border-sawah"
        >
          <div className="text-[13px] text-abu">Total penduduk</div>
          <div className="font-heading text-[28px] text-sawah">{totalPenduduk.toLocaleString("id-ID")}</div>
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/kabar/tambah"
          className="rounded-md bg-sawah px-4 py-2.5 text-[14px] font-semibold text-white no-underline hover:bg-daun"
        >
          + Tambah Berita / Pengumuman
        </Link>
        <Link
          to="/admin/struktur"
          className="rounded-md border border-garis bg-white px-4 py-2.5 text-[14px] font-medium text-tinta no-underline hover:border-sawah"
        >
          Kelola Struktur Jabatan
        </Link>
        <Link
          to="/admin/penduduk"
          className="rounded-md border border-garis bg-white px-4 py-2.5 text-[14px] font-medium text-tinta no-underline hover:border-sawah"
        >
          Ubah Statistik Penduduk
        </Link>
      </div>
    </div>
  );
}
