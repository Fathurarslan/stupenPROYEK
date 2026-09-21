import { usePenduduk } from "../hooks/usePenduduk";

// Diagram batang laki-laki, perempuan, dan total penduduk. Tampil di
// beranda di bawah kartu profil perangkat kelurahan. Angkanya diatur
// dari halaman admin (lihat AdminPenduduk.tsx).
export default function StatistikPenduduk() {
  const { penduduk } = usePenduduk();
  const { lakiLaki, perempuan } = penduduk;
  const total = lakiLaki + perempuan;

  const batang = [
    { label: "Laki-laki", nilai: lakiLaki, warna: "bg-tambak" },
    { label: "Perempuan", nilai: perempuan, warna: "bg-padi" },
    { label: "Total penduduk", nilai: total, warna: "bg-sawah" },
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-[14px] border border-garis bg-white">
      <div className="flex items-center gap-2 bg-padi/25 px-5 py-3.5">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 shrink-0 text-padigelap"
          aria-hidden="true"
        >
          <path d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM0 17c0-2.76 2.9-4.5 7-4.5s7 1.74 7 4.5v1H0v-1Zm14.5-2.9c2.13.32 3.5 1.42 3.5 2.9v1h-2v-1c0-1.05-.55-1.98-1.5-2.63v-.27Z" />
        </svg>
        <span className="font-heading text-[15px] font-semibold text-padigelap">Jumlah Penduduk</span>
      </div>

      <div className="px-5 py-5">
        <div className="font-heading mb-4.5 text-[22px] text-sawah">
          {total.toLocaleString("id-ID")} jiwa
        </div>

        {batang.map((b) => {
          const persen = total > 0 ? (b.nilai / total) * 100 : 0;
          return (
            <div className="mb-3.5 last:mb-0" key={b.label}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span className="text-tinta">{b.label}</span>
                <b>{b.nilai.toLocaleString("id-ID")}</b>
              </div>
              <div className="h-3 overflow-hidden rounded-md bg-garis">
                <i
                  className={`block h-full rounded-md ${b.warna}`}
                  style={{ width: `${Math.min(100, persen)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
