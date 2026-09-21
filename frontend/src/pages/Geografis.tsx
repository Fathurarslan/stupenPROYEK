import PetakSawah from "../components/PetakSawah";
import { BATAS_WILAYAH, FAKTA_GEOGRAFIS, PENGGUNAAN_LAHAN } from "../data/geografis";

export default function Geografis() {
  return (
    <main className="wrap py-18">
      <h1 className="font-heading mb-2.5 text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">
        Kondisi Geografis
      </h1>
      <p className="mb-10 max-w-[65ch] text-abu">
        Gambaran letak, luas, dan kondisi bentang alam Kelurahan Sidoharjo,
        Kabupaten Lamongan, Jawa Timur.
      </p>

      <div className="mb-16 grid grid-cols-[1fr_1fr] items-center gap-12 max-[860px]:grid-cols-1">
        <div>
          {FAKTA_GEOGRAFIS.map((f) => (
            <div
              key={f.label}
              className="flex items-baseline justify-between gap-4 border-b border-garis py-3 first:pt-0 last:border-0"
            >
              <span className="text-abu">{f.label}</span>
              <b className="font-heading text-right text-[18px] text-sawah">{f.nilai}</b>
            </div>
          ))}
        </div>
        <PetakSawah />
      </div>

      <section className="mb-16" aria-label="Batas wilayah">
        <h2 className="font-heading mb-2.5 text-[22px] text-sawah">Batas Wilayah</h2>
        <p className="mb-5 max-w-[65ch] text-abu">
          Kelurahan Sidoharjo berbatasan langsung dengan wilayah-wilayah berikut.
        </p>
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          {BATAS_WILAYAH.map((b) => (
            <div key={b.arah} className="rounded-lg border border-garis bg-kabut p-4">
              <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-daun">
                {b.arah}
              </div>
              <div className="text-tinta">{b.wilayah}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Penggunaan lahan">
        <h2 className="font-heading mb-2.5 text-[22px] text-sawah">Penggunaan Lahan</h2>
        <p className="mb-5 max-w-[65ch] text-abu">
          Perkiraan proporsi penggunaan lahan di wilayah kelurahan.
        </p>
        <div className="max-w-[520px]">
          {PENGGUNAAN_LAHAN.map((p) => (
            <div className="mb-3.5" key={p.label}>
              <div className="mb-1.5 flex justify-between text-[14px]">
                <span>{p.label}</span>
                <b>{p.nilai}%</b>
              </div>
              <div className="h-3 overflow-hidden rounded-md bg-garis">
                <i className="block h-full rounded-md bg-daun" style={{ width: `${p.nilai}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-abu">
          Angka di atas adalah contoh. Ganti dengan data resmi dari kelurahan.
        </p>
      </section>
    </main>
  );
}
