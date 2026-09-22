import { useState } from "react";
import { Link } from "react-router-dom";
import { useKabar } from "../hooks/useKabar";
import { urlPenuh } from "../lib/api";
import { formatTanggal } from "../lib/tanggal";
import KabarCarousel from "./KabarCarousel";

export default function Kabar() {
  const { kabar } = useKabar();
  const [filter, setFilter] = useState("Semua");
  const data = kabar.filter((k) => filter === "Semua" || k.jenis === filter);
  const [utama, ...lain] = data;
  return (
    <div id="kabar">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">Kabar kelurahan</h2>
          <p className="mt-1.5 max-w-[52ch] text-abu">Berita kegiatan dan pengumuman untuk warga.</p>
        </div>
        <div className="flex gap-1.5">
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
      </div>
      {filter === "Semua" && <KabarCarousel />}
      {utama && (
        <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-[860px]:grid-cols-1">
          <Link
            to={`/kabar/${utama.id}`}
            className="relative flex min-h-75 flex-col justify-end overflow-hidden rounded-[14px] bg-tambak p-8 text-white no-underline"
          >
            {utama.gambar && (
              <>
                <img src={urlPenuh(utama.gambar)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </>
            )}
            <div className="relative">
              <span className="text-[13px] opacity-80">{utama.jenis}, {formatTanggal(utama.tanggal)}</span>
              <h3 className="mt-2 mb-2.5 text-[30px] leading-[1.1] hover:underline">{utama.judul}</h3>
              <p className="m-0">{utama.ringkas}</p>
            </div>
          </Link>
          <div className="flex flex-col">
            {lain.map((k) => (
              <Link
                key={k.id}
                to={`/kabar/${k.id}`}
                className="flex gap-3.5 border-b border-garis py-4.5 no-underline first:pt-0"
              >
                {k.gambar ? (
                  <img src={urlPenuh(k.gambar)} alt="" className="h-16 w-20 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-kabut text-center text-[11px] text-abu">
                    Tanpa foto
                  </div>
                )}
                <div>
                  <span className="text-[13px] text-abu">{k.jenis}, {formatTanggal(k.tanggal)}</span>
                  <h3 className="mt-1 mb-1.5 text-[19px] leading-[1.1] text-tinta hover:underline">{k.judul}</h3>
                  <p className="m-0 text-[15px] text-abu">{k.ringkas}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
