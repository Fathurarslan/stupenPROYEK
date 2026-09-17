import PetakSawah from "./PetakSawah";

export default function Hero() {     
  return (
    <section className="relative overflow-hidden bg-sawah text-white" id="beranda">
      <div className="wrap grid grid-cols-[1.1fr_1fr] items-center gap-10 pt-12 pb-16 max-[860px]:grid-cols-1">
        <div>
          <h1 className="font-heading text-[clamp(40px,6vw,72px)] leading-[1.1] font-extrabold tracking-[-0.02em]">
            Sugeng rawuh di Sidoharjo
          </h1>
          <p className="mt-4.5 mb-7 max-w-[34ch] text-[18px] opacity-90">
            Urus surat, baca kabar terbaru, dan kenali kelurahan kita dari satu tempat.
          </p>
          <a 
            href="https://maps.app.goo.gl/TnYqCRyhPtXtnJQz6" 
            className="inline-block rounded-md bg-padi px-4 py-2 text-[16px] font-bold text-sawah hover:bg-padigelap hover:text-white"
          >
            Cek Alamat kami di sini
          </a>
          <div className="mt-3 text-[14px] opacity-75">Kantor buka Senin sampai Jumat, pukul 07.30 WIB</div>
        </div>
        <PetakSawah />
      </div>
    </section>
  );
}
