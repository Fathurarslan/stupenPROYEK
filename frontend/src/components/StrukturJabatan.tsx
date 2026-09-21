import { useEffect, useState } from "react";
import { useStruktur } from "../hooks/useStruktur";
import { ambilInisial } from "../lib/text";

// Menampilkan satu kartu pejabat pada satu waktu, berganti otomatis ke
// pejabat berikutnya. Untuk tampilan kartu grid di halaman /struktur,
// lihat StrukturJabatanGrid.tsx.
export default function StrukturJabatan() {
  const { perangkat } = useStruktur();
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const total = perangkat.length;
  // Deriva langsung dari total terkini, jadi tetap valid walau daftar
  // berkurang tanpa perlu efek terpisah untuk menyesuaikannya.
  const slideAktif = total > 0 ? ((slide % total) + total) % total : 0;

  useEffect(() => {
    if (hover || total <= 1) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [hover, total]);

  if (total === 0) return null;
  const p = perangkat[slideAktif];

  return (
    <div id="struktur">
      <div
        className="overflow-hidden rounded-[14px] border border-garis bg-white"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="flex items-center gap-2 bg-padi/25 px-5 py-3.5">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 shrink-0 text-padigelap"
            aria-hidden="true"
          >
            <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.66-8 4.5V18h16v-1.5c0-2.84-4.7-4.5-8-4.5Z" />
          </svg>
          <span className="font-heading text-[15px] font-semibold text-padigelap">Pemerintah Kelurahan</span>
        </div>

        <div className="flex flex-col items-center px-6 py-6">
          {p.foto ? (
            <img src={p.foto} alt={p.nama} className="aspect-[3/4] w-44 rounded-lg object-cover" />
          ) : (
            <div className="flex aspect-[3/4] w-44 items-center justify-center rounded-lg bg-kabut text-[40px] font-semibold text-abu">
              {ambilInisial(p.nama)}
            </div>
          )}
          <b className="mt-4 text-center text-[16px] leading-[1.3] font-bold text-tinta uppercase">{p.nama}</b>
          <span className="mt-1 text-center text-[14px] text-abu">{p.jabatan}</span>
          {p.nip && <span className="mt-1 text-center text-[13px] text-abu">NIP. : {p.nip}</span>}
        </div>

        {total > 1 && (
          <div className="flex items-center justify-center gap-4 border-t border-garis px-5 py-3">
            <button
              type="button"
              aria-label="Pejabat sebelumnya"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-kabut text-[16px] text-tinta hover:bg-garis"
              onClick={() => setSlide((s) => (s - 1 + total) % total)}
            >
              ‹
            </button>
            <div className="flex gap-1.5">
              {perangkat.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Ke pejabat ${i + 1}`}
                  aria-current={i === slideAktif}
                  className={`h-2 w-2 cursor-pointer rounded-full border-0 p-0 ${
                    i === slideAktif ? "bg-sawah" : "bg-garis"
                  }`}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Pejabat berikutnya"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-kabut text-[16px] text-tinta hover:bg-garis"
              onClick={() => setSlide((s) => (s + 1) % total)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
