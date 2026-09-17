import { useState } from "react";
import { KABAR } from "../data/kabar";
import KabarCarousel from "./KabarCarousel";

export default function Kabar() {
  const [filter, setFilter] = useState("Semua");
  const data = KABAR.filter((k) => filter === "Semua" || k.jenis === filter);
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
          <article className="flex min-h-[300px] flex-col justify-end rounded-[14px] bg-tambak p-8 text-white">
            <span className="text-[13px] opacity-80">{utama.jenis}, {utama.tanggal}</span>
            <h3 className="mt-2 mb-2.5 text-[30px] leading-[1.1]">{utama.judul}</h3>
            <p className="m-0">{utama.ringkas}</p>
          </article>
          <div className="flex flex-col">
            {lain.map((k) => (
              <article key={k.judul} className="border-b border-garis py-4.5 first:pt-0">
                <span className="text-[13px] text-abu">{k.jenis}, {k.tanggal}</span>
                <h3 className="mt-1 mb-1.5 text-[19px] leading-[1.1]">{k.judul}</h3>
                <p className="m-0 text-[15px] text-abu">{k.ringkas}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
