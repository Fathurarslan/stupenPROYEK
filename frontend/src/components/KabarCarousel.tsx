import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useKabar } from "../hooks/useKabar";
import { urlPenuh } from "../lib/api";
import { formatTanggal } from "../lib/tanggal";

const WARNA_SLIDE = ["bg-tambak", "bg-sawah", "bg-daun", "bg-padigelap"];

export default function KabarCarousel() {
  const { kabar: semuaKabar } = useKabar();
  // Slide dibatasi 5 sama seperti daftar di Kabar.tsx. Carousel berganti tiap
  // 4 detik dan menggambar satu titik penanda per slide, jadi tanpa batas ini
  // sekali putaran bisa memakan menit dan deretan titiknya melimpah di HP.
  const kabar = semuaKabar.slice(0, 5);
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const total = kabar.length;
  // Deriva langsung dari total terkini, jadi tetap valid walau kabar
  // berkurang (misalnya admin menghapus item) tanpa perlu efek terpisah.
  const slideAktif = total > 0 ? ((slide % total) + total) % total : 0;

  useEffect(() => {
    if (hover || total <= 1) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % total), 4000);
    return () => clearInterval(timer);
  }, [hover, total]);

  if (total === 0) return null;
  const item = kabar[slideAktif];

  return (
    <div
      className="relative mb-7 overflow-hidden rounded-[14px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to={`/kabar/${item.id}`}
        className={`relative flex min-h-[280px] flex-col justify-end p-8 text-white no-underline transition-colors duration-500 ${
          item.gambar ? "" : WARNA_SLIDE[slideAktif % WARNA_SLIDE.length]
        }`}
      >
        {item.gambar && (
          <>
            <img src={urlPenuh(item.gambar)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </>
        )}
        <div className="relative">
          <span className="text-[13px] opacity-80">
            {item.jenis}, {formatTanggal(item.tanggal)}
          </span>
          <h3 className="mt-2 mb-1 text-[26px] leading-[1.1]">{item.judul}</h3>
          <p className="m-0 max-w-[60ch] text-[15px] opacity-90">{item.ringkas}</p>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Sebelumnya"
        className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/20 text-[18px] text-white hover:bg-white/30"
        onClick={() => setSlide((s) => (s - 1 + total) % total)}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Berikutnya"
        className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/20 text-[18px] text-white hover:bg-white/30"
        onClick={() => setSlide((s) => (s + 1) % total)}
      >
        ›
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {kabar.map((k, i) => (
          <button
            key={k.id}
            type="button"
            aria-label={`Ke slide ${i + 1}`}
            aria-current={i === slideAktif}
            className={`h-2 w-2 cursor-pointer rounded-full border-0 p-0 ${i === slideAktif ? "bg-white" : "bg-white/40"}`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
    </div>
  );
}
