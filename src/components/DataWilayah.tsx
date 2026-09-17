import { PENDUDUK, PEKERJAAN } from "../data/wilayah";

export default function DataWilayah() {
  const total = PENDUDUK.reduce((a, b) => a + b.nilai, 0);
  return (
    <section className="py-18" id="data">
      <div className="wrap">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">Data wilayah</h2>
            <p className="mt-1.5 max-w-[52ch] text-abu">Gambaran singkat penduduk Kelurahan Sidoharjo.</p>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1.3fr] gap-12 max-[860px]:grid-cols-1">
          <div>
            <div className="font-heading mb-4.5 text-[22px] text-sawah">{total.toLocaleString("id-ID")} jiwa terdata</div>
            {PENDUDUK.map((p) => (
              <div className="mb-3.5" key={p.label}>
                <div className="mb-1.5 flex justify-between text-[14px]">
                  <span>{p.label}</span>
                  <b>{p.nilai.toLocaleString("id-ID")}</b>
                </div>
                <div className="h-3 overflow-hidden rounded-md bg-garis">
                  <i className="block h-full rounded-md bg-daun" style={{ width: `${(p.nilai / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="font-heading mb-4.5 text-[22px] text-sawah">Mata pencaharian warga</div>
            {PEKERJAAN.map((p) => (
              <div className="mb-3.5" key={p.label}>
                <div className="mb-1.5 flex justify-between text-[14px]">
                  <span>{p.label}</span>
                  <b>{p.nilai}%</b>
                </div>
                <div className="h-3 overflow-hidden rounded-md bg-garis">
                  <i className="block h-full rounded-md bg-padi" style={{ width: `${p.nilai}%` }} />
                </div>
              </div>
            ))}
            <p className="mt-4 text-[13px] text-abu">Angka di atas adalah contoh. Ganti dengan data resmi dari kelurahan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
