import { useState, useMemo } from "react";
import { LAYANAN } from "../data/layanan";

export default function Layanan({ kata, setKata }: { kata: string; setKata: (v: string) => void }) {
  const [aktif, setAktif] = useState<string | null>(null);
  const hasil = useMemo(
    () => LAYANAN.filter((l) => l.nama.toLowerCase().includes(kata.toLowerCase())),
    [kata]
  );
  return (
    <section className="py-18" id="layanan">
      <div className="wrap">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">Layanan surat</h2>
            <p className="mt-1.5 max-w-[52ch] text-abu">Pilih layanan untuk melihat berkas yang perlu dibawa ke kantor kelurahan.</p>
          </div>
          {kata && (
            <div className="flex gap-1.5">
              <button
                type="button"
                className="cursor-pointer rounded-full border border-garis bg-white px-3.5 py-2 text-[14px]"
                onClick={() => setKata("")}
              >
                Tampilkan semua layanan
              </button>
            </div>
          )}
        </div>
        <div className="border-t-2 border-sawah">
          {hasil.length === 0 && (
            <div className="px-1 py-6 text-abu">Layanan "{kata}" tidak ditemukan. Coba kata lain atau hubungi kantor kelurahan.</div>
          )}
          {hasil.map((l) => {
            const buka = aktif === l.nama;
            return (
              <div className="border-b border-garis" key={l.nama}>
                <button
                  type="button"
                  className="group flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-1 py-4.5 text-left text-tinta"
                  aria-expanded={buka}
                  onClick={() => setAktif(buka ? null : l.nama)}
                >
                  <span className="text-[17px] font-semibold group-hover:text-daun">{l.nama}</span>
                  <span className="flex items-center gap-4">
                    <span className="text-[13px] whitespace-nowrap text-abu">Selesai {l.waktu}</span>
                    <span className="w-5 text-center text-[22px] text-daun" aria-hidden="true">{buka ? "−" : "+"}</span>
                  </span>
                </button>
                {buka && (
                  <div className="px-1 pb-5 text-abu">
                    Berkas yang dibawa:
                    <ul className="mt-1.5 list-disc pl-5">{l.syarat.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
