import PetakSawah from "./PetakSawah";

export default function Hero() {     
  return (
    <section className="relative overflow-hidden bg-sawah text-white" id="beranda">
      <div className="wrap grid grid-cols-[1.1fr_1fr] items-center gap-10 pt-12 pb-16 max-[860px]:grid-cols-1">
        <div>
          <h1 className="font-heading text-[clamp(40px,6vw,72px)] leading-[1.1] font-extrabold tracking-[-0.02em]">
            Selamat Datang di Kelurahan Sidoharjo
          </h1>
          <p className="mt-4.5 max-w-[34ch] text-[18px] opacity-90">
            Baca kabar terbaru kelurahan Sidoharjo dari satu tempat.
          </p>
          <div className="mt-3 text-[14px] opacity-75">Jam kerja Senin s.d Jumat, <br></br>Pukul 07.30 - 15.00 WIB</div>
        </div>
        <PetakSawah />
      </div>
    </section>
  );
}
