import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useKabar } from "../hooks/useKabar";
import { urlPenuh } from "../lib/api";
import { formatTanggal } from "../lib/tanggal";
import type { KabarRingkas } from "../types/kelurahan";
import KabarCarousel from "./KabarCarousel";

// Sepuluh kabar per halaman. Data sudah datang urut tanggal terbaru dulu
// (ORDER BY tanggal_upload DESC, id DESC di backend), jadi kabar baru selalu di
// halaman 1 dan yang lama mundur ke halaman berikutnya.
const PER_HALAMAN = 10;

const SARINGAN = ["Semua", "Berita", "Pengumuman"];

export default function Kabar() {
  const { kabar, memuat, error } = useKabar();
  const [filter, setFilter] = useState("Semua");
  const [halaman, setHalaman] = useState(1);

  const data = kabar.filter((k) => filter === "Semua" || k.jenis === filter);
  const totalHalaman = Math.max(1, Math.ceil(data.length / PER_HALAMAN));

  // Diturunkan langsung dari data terkini, bukan disimpan di state, supaya
  // tetap sah walau jumlah kabar berkurang (admin menghapus) saat pengunjung
  // sedang berada di halaman terakhir.
  const halamanAktif = Math.min(halaman, totalHalaman);
  const mulai = (halamanAktif - 1) * PER_HALAMAN;
  const tampil = data.slice(mulai, mulai + PER_HALAMAN);

  const gantiSaringan = (pilihan: string) => {
    setFilter(pilihan);
    // Kembali ke halaman 1: halaman 4 pada "Semua" belum tentu ada pada
    // "Pengumuman" yang jumlahnya lebih sedikit
    setHalaman(1);
  };

  return (
    <div id="kabar">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">Kabar kelurahan</h2>
          <p className="mt-1.5 max-w-[52ch] text-abu">Berita kegiatan dan pengumuman untuk warga.</p>
        </div>
        <div className="flex gap-1.5">
          {SARINGAN.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filter === t}
              className="cursor-pointer rounded-full border border-garis bg-white px-3.5 py-2 text-[14px] aria-pressed:border-sawah aria-pressed:bg-sawah aria-pressed:text-white"
              onClick={() => gantiSaringan(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Hanya saat saringan "Semua": carousel selalu menampilkan 5 kabar
          terbaru tanpa memandang jenis, jadi akan membingungkan kalau tetap
          muncul sewaktu pengunjung menyaring khusus Berita atau Pengumuman. */}
      {filter === "Semua" && <KabarCarousel />}

      {error && <p className="mb-4 text-[14px] text-[#b3261e]">{error}</p>}

      {tampil.length === 0 ? (
        <p className="rounded-xl border border-garis bg-white px-5 py-10 text-center text-abu">
          {memuat ? "Memuat kabar…" : "Belum ada kabar untuk ditampilkan."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {tampil.map((k) => (
            <KartuKabar key={k.id} kabar={k} />
          ))}
        </div>
      )}

      {totalHalaman > 1 && (
        <Paginasi halamanAktif={halamanAktif} totalHalaman={totalHalaman} keHalaman={setHalaman} />
      )}
    </div>
  );
}

function KartuKabar({ kabar: k }: { kabar: KabarRingkas }) {
  return (
    <Link
      to={`/kabar/${k.id}`}
      className="flex gap-5 rounded-xl border border-garis bg-white p-4 no-underline transition-colors hover:border-sawah max-[620px]:flex-col"
    >
      {/* Kotak gambar diukur di pembungkusnya, bukan di <img>, supaya tinggi
          kartu sama baik gambarnya ada maupun tidak */}
      <div className="aspect-[16/9] w-[240px] shrink-0 overflow-hidden rounded-lg bg-kabut max-[620px]:w-full">
        {k.gambar ? (
          <img src={urlPenuh(k.gambar)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-abu">
            Tanpa foto
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="m-0 line-clamp-2 text-[19px] leading-[1.3] font-bold text-tinta">{k.judul}</h3>
        <p className="mt-1.5 mb-3 line-clamp-2 text-[15px] leading-[1.5] text-abu">{k.ringkas}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-abu">
          <span className="flex items-center gap-1.5">
            <IkonKalender />
            {formatTanggal(k.tanggal)}
          </span>
          <span className="flex items-center gap-1.5">
            <IkonLabel />
            {k.jenis}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Paginasi({
  halamanAktif,
  totalHalaman,
  keHalaman,
}: {
  halamanAktif: number;
  totalHalaman: number;
  keHalaman: (halaman: number) => void;
}) {
  const nomor = Array.from({ length: totalHalaman }, (_, i) => i + 1);

  return (
    <div className="mt-7">
      <p className="mb-3 text-[14px] text-abu">
        Halaman {halamanAktif} dari {totalHalaman}
      </p>
      <div className="flex flex-wrap gap-2">
        <TombolHalaman
          label="Ke halaman sebelumnya"
          nonaktif={halamanAktif === 1}
          onClick={() => keHalaman(halamanAktif - 1)}
        >
          ←
        </TombolHalaman>

        {nomor.map((n) => (
          <TombolHalaman
            key={n}
            label={`Ke halaman ${n}`}
            aktif={n === halamanAktif}
            onClick={() => keHalaman(n)}
          >
            {n}
          </TombolHalaman>
        ))}

        <TombolHalaman
          label="Ke halaman berikutnya"
          nonaktif={halamanAktif === totalHalaman}
          onClick={() => keHalaman(halamanAktif + 1)}
        >
          ›
        </TombolHalaman>
        <TombolHalaman
          label="Ke halaman terakhir"
          nonaktif={halamanAktif === totalHalaman}
          onClick={() => keHalaman(totalHalaman)}
        >
          →
        </TombolHalaman>
      </div>
    </div>
  );
}

function TombolHalaman({
  children,
  label,
  aktif = false,
  nonaktif = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  aktif?: boolean;
  nonaktif?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={aktif ? "page" : undefined}
      disabled={nonaktif}
      onClick={onClick}
      className={`flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg border px-3 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        aktif
          ? "border-sawah bg-sawah text-white"
          : "border-garis bg-white text-tinta hover:border-sawah"
      }`}
    >
      {children}
    </button>
  );
}

function IkonKalender() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0 text-sawah" aria-hidden="true">
      <path d="M5 1a.75.75 0 0 1 .75.75V3h4.5V1.75a.75.75 0 0 1 1.5 0V3h.75A1.5 1.5 0 0 1 14 4.5v8A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-8A1.5 1.5 0 0 1 3.5 3h.75V1.75A.75.75 0 0 1 5 1Zm7.5 5h-9v6.5h9V6Z" />
    </svg>
  );
}

function IkonLabel() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0 text-sawah" aria-hidden="true">
      <path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v11.25a.75.75 0 0 0 1.17.624L8 11.9l4.33 2.974A.75.75 0 0 0 13.5 14.25V3A1.5 1.5 0 0 0 12 1.5H4Z" />
    </svg>
  );
}
