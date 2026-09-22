import { useState, type FormEvent } from "react";
import { usePenduduk } from "../../hooks/usePenduduk";

export default function AdminPenduduk() {
  const { penduduk, memuat, error, perbarui } = usePenduduk();

  if (memuat) {
    return <p className="text-abu">Memuat data penduduk…</p>;
  }

  // Form dipasang sekali saja setelah data tiba, lalu nilainya dipegang form itu
  // sendiri. Ini menggantikan useEffect yang dulu menyalin data ke state.
  //
  // Sengaja TIDAK diberi `key` dari angkanya: kalau key ikut berubah tiap kali
  // data berubah, form akan dibongkar-pasang persis saat penyimpanan berhasil
  // dan pesan "Tersimpan" hilang sebelum sempat terlihat.
  return (
    <FormPenduduk
      awalLakiLaki={penduduk.lakiLaki}
      awalPerempuan={penduduk.perempuan}
      errorMuat={error}
      simpan={perbarui}
    />
  );
}

function FormPenduduk({
  awalLakiLaki,
  awalPerempuan,
  errorMuat,
  simpan,
}: {
  awalLakiLaki: number;
  awalPerempuan: number;
  errorMuat: string;
  simpan: (stat: { lakiLaki: number; perempuan: number }) => Promise<unknown>;
}) {
  const [lakiLaki, setLakiLaki] = useState(String(awalLakiLaki));
  const [perempuan, setPerempuan] = useState(String(awalPerempuan));
  const [tersimpan, setTersimpan] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [error, setError] = useState("");

  const angkaLakiLaki = Math.max(0, Math.round(Number(lakiLaki)) || 0);
  const angkaPerempuan = Math.max(0, Math.round(Number(perempuan)) || 0);
  const totalPratinjau = angkaLakiLaki + angkaPerempuan;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMenyimpan(true);
    setError("");
    try {
      await simpan({ lakiLaki: angkaLakiLaki, perempuan: angkaPerempuan });
      setTersimpan(true);
      setTimeout(() => setTersimpan(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data penduduk.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">Statistik Penduduk</h1>
      <p className="mt-1.5 mb-8 max-w-[52ch] text-abu">
        Ubah jumlah penduduk laki-laki dan perempuan. Total dan diagram batang di beranda akan mengikuti
        otomatis.
      </p>

      {errorMuat && <p className="mb-4 text-[14px] text-[#b3261e]">{errorMuat}</p>}

      <form onSubmit={(e) => void submit(e)} className="max-w-105 rounded-lg border border-garis bg-white p-5">
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

        {error && <p className="mb-4 text-[13px] text-[#b3261e]">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={menyimpan}
            className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun disabled:cursor-wait disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan…" : "Simpan"}
          </button>
          {tersimpan && <span className="text-[13px] text-daun">Tersimpan.</span>}
        </div>
      </form>
    </div>
  );
}
