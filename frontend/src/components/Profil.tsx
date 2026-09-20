import { PERANGKAT } from "../data/profil";

export default function Profil() {
  return (
    <section className="bg-white py-18" id="profil">
      <div className="wrap">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">Profil kelurahan</h2>
            <p className="mt-1.5 max-w-[52ch] text-abu">Arah pembangunan dan perangkat yang melayani warga Sidoharjo.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-12 max-[860px]:grid-cols-1">
          <div>
            <h3 className="mb-2.5 text-[22px] text-sawah">Visi</h3>
            <p className="font-heading mb-6 text-[26px] leading-[1.25] text-sawah">
              Sidoharjo yang tertib, sejahtera, dan guyub dalam pelayanan.
            </p>
            <h3 className="mb-2.5 text-[22px] text-sawah">Misi</h3>
            <ol className="m-0 list-decimal pl-5 text-abu">
              <li className="mb-2">Memberikan pelayanan administrasi yang cepat dan terbuka.</li>
              <li className="mb-2">Mendorong tumbuhnya usaha warga dan hasil pertanian lokal.</li>
              <li className="mb-2">Menjaga kebersihan lingkungan dan saluran irigasi.</li>
              <li className="mb-2">Menguatkan gotong royong antar RT dan RW.</li>
            </ol>
          </div>
          <div>
            <h3 className="mb-2.5 text-[22px] text-sawah">Perangkat kelurahan</h3>
            <ul className="m-0 list-none p-0">
              {PERANGKAT.map((p) => (
                <li
                  key={p.jabatan}
                  className="flex justify-between gap-4 border-b border-garis py-3.5 first:border-t-2 first:border-t-sawah"
                >
                  <span className="text-[14px] text-abu">{p.jabatan}</span>
                  <b className="text-right font-semibold">{p.nama}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
