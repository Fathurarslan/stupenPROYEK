import { useEffect, useState } from "react";
import { KABAR } from "../data/kabar";

const WARNA_SLIDE = ["bg-tambak", "bg-sawah", "bg-daun", "bg-padigelap"];

export default function KabarCarousel() {
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const total = KABAR.length;

  useEffect(() => {
    if (hover || total <= 1) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % total), 4000);
    return () => clearInterval(timer);
  }, [hover, total]);

  if (total === 0) return null;
  const item = KABAR[slide];

  return (
    <div
      className="relative mb-7 overflow-hidden rounded-[14px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`flex min-h-[280px] flex-col justify-end p-8 text-white transition-colors duration-500 ${WARNA_SLIDE[slide % WARNA_SLIDE.length]}`}
      >
        <span className="text-[13px] opacity-80">
          {item.jenis}, {item.tanggal}
        </span>
        <h3 className="mt-2 mb-1 text-[26px] leading-[1.1]">{item.judul}</h3>
        <p className="m-0 max-w-[60ch] text-[15px] opacity-90">{item.ringkas}</p>
      </div>

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
        {KABAR.map((k, i) => (
          <button
            key={k.judul}
            type="button"
            aria-label={`Ke slide ${i + 1}`}
            aria-current={i === slide}
            className={`h-2 w-2 cursor-pointer rounded-full border-0 p-0 ${i === slide ? "bg-white" : "bg-white/40"}`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
    </div>
  );
}
