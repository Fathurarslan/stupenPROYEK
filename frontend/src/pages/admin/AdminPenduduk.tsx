import { useEffect, useState, type FormEvent } from "react";
import { usePenduduk } from "../../hooks/usePenduduk";

export default function AdminPenduduk() {
  const { penduduk, perbarui } = usePenduduk();

  const [lakiLaki, setLakiLaki] = useState(String(penduduk.lakiLaki));
  const [perempuan, setPerempuan] = useState(String(penduduk.perempuan));
  const [tersimpan, setTersimpan] = useState(false);

  // Sinkron ulang kalau data di localStorage berubah dari tempat lain
  // (misal setelah reload).
  useEffect(() => {
    setLakiLaki(String(penduduk.lakiLaki));
    setPerempuan(String(penduduk.perempuan));
  }, [penduduk]);

  const angkaLakiLaki = Math.max(0, Math.round(Number(lakiLaki)) || 0);
  const angkaPerempuan = Math.max(0, Math.round(Number(perempuan)) || 0);
  const totalPratinjau = angkaLakiLaki + angkaPerempuan;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    perbarui({ lakiLaki: angkaLakiLaki, perempuan: angkaPerempuan });
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2000);
  };

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">Statistik Penduduk</h1>
      <p className="mt-1.5 mb-8 max-w-[52ch] text-abu">
        Ubah jumlah penduduk laki-laki dan perempuan. Total dan diagram batang di beranda akan mengikuti
        otomatis.
      </p>

      <form onSubmit={submit} className="max-w-105 rounded-lg border border-garis bg-white p-5">
        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-tinta">Laki-laki</span>
          <input
            type="number"
            min={0}
            value={lakiLaki}
            onChange={(e) => setLakiLaki(e.target.value)}
            className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-tinta">Perempuan</span>
          <input
            type="number"
            min={0}
            value={perempuan}
            onChange={(e) => setPerempuan(e.target.value)}
            className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
          />
        </label>

        <div className="mb-5 flex items-center justify-between rounded-md bg-kabut px-3.5 py-2.5 text-[13px]">
          <span className="text-abu">Total penduduk</span>
          <b className="text-tinta">{totalPratinjau.toLocaleString("id-ID")}</b>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun"
          >
            Simpan
          </button>
          {tersimpan && <span className="text-[13px] text-daun">Tersimpan.</span>}
        </div>
      </form>
    </div>
  );
}
