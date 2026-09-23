import { useState, type FormEvent } from "react";
import { usePenduduk } from "../../hooks/usePenduduk";
import { notifGagalDari, notifSukses } from "../../lib/notifikasi";

export default function AdminPenduduk() {
  const { penduduk, adaData, memuat, error, perbarui, hapus } = usePenduduk();

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
      adaData={adaData}
      errorMuat={error}
      simpan={perbarui}
      hapus={hapus}
    />
  );
}

// Meniru cara kalkulator memperlakukan angka nol: hanya digit yang diterima,
// dan nol di depan tidak pernah menumpuk. "00" jadi "0", "007" jadi "7",
// sedangkan kotak yang dikosongkan dibiarkan kosong dulu supaya admin bisa
// langsung mengetik angka baru tanpa menghapus nol bawaan.
function normalkanAngka(teks: string): string {
  const digit = teks.replace(/\D/g, "");
  if (digit === "") return "";
  const tanpaNolDepan = digit.replace(/^0+/, "");
  return tanpaNolDepan === "" ? "0" : tanpaNolDepan;
}

// Sengaja type="text" dengan inputMode numerik, bukan type="number": pada
// type="number" ketikan seperti "e" atau "-" membuat value terbaca kosong
// sementara isinya masih tampak di layar, jadi aturan nol di atas tidak bisa
// dijamin. Keyboard HP tetap muncul dalam mode angka.
function InputAngka({
  label,
  nilai,
  setNilai,
}: {
  label: string;
  nilai: string;
  setNilai: (nilai: string) => void;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[13px] font-medium text-tinta">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={nilai}
        onChange={(e) => setNilai(normalkanAngka(e.target.value))}
        onBlur={() => nilai === "" && setNilai("0")}
        className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
      />
    </label>
  );
}

function FormPenduduk({
  awalLakiLaki,
  awalPerempuan,
  adaData,
  errorMuat,
  simpan,
  hapus,
}: {
  awalLakiLaki: number;
  awalPerempuan: number;
  adaData: boolean;
  errorMuat: string;
  simpan: (stat: { lakiLaki: number; perempuan: number }) => Promise<unknown>;
  hapus: () => Promise<{ lakiLaki: number; perempuan: number }>;
}) {
  const [lakiLaki, setLakiLaki] = useState(String(awalLakiLaki));
  const [perempuan, setPerempuan] = useState(String(awalPerempuan));
  const [menyimpan, setMenyimpan] = useState(false);
  const [menghapus, setMenghapus] = useState(false);

  const angkaLakiLaki = Math.max(0, Math.round(Number(lakiLaki)) || 0);
  const angkaPerempuan = Math.max(0, Math.round(Number(perempuan)) || 0);
  const totalPratinjau = angkaLakiLaki + angkaPerempuan;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMenyimpan(true);
    try {
      await simpan({ lakiLaki: angkaLakiLaki, perempuan: angkaPerempuan });
      notifSukses(
        `Data penduduk tersimpan. Total ${(angkaLakiLaki + angkaPerempuan).toLocaleString("id-ID")} jiwa.`,
      );
    } catch (err) {
      notifGagalDari(err, "Gagal menyimpan data penduduk.");
    } finally {
      setMenyimpan(false);
    }
  };

  // Barisnya benar-benar dihapus dari tabel penduduk, bukan hanya diisi 0.
  // Angka di kotak lalu diambil dari hasil muat ulang: tabel kosong berarti
  // kembali ke 0, dan halaman publik ikut menyesuaikan.
  const hapusData = async () => {
    if (!window.confirm("Hapus data penduduk? Angka di beranda akan kosong kembali.")) return;

    setMenghapus(true);
    try {
      const sisa = await hapus();
      setLakiLaki(String(sisa.lakiLaki));
      setPerempuan(String(sisa.perempuan));
      notifSukses("Data penduduk dihapus, angkanya kembali ke 0.");
    } catch (err) {
      notifGagalDari(err, "Gagal menghapus data penduduk.");
    } finally {
      setMenghapus(false);
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
        <InputAngka label="Laki-laki" nilai={lakiLaki} setNilai={setLakiLaki} />
        <InputAngka label="Perempuan" nilai={perempuan} setNilai={setPerempuan} />

        <div className="mb-5 flex items-center justify-between rounded-md bg-kabut px-3.5 py-2.5 text-[13px]">
          <span className="text-abu">Total penduduk</span>
          <b className="text-tinta">{totalPratinjau.toLocaleString("id-ID")}</b>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={menyimpan || menghapus}
            className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun disabled:cursor-wait disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan…" : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => void hapusData()}
            disabled={!adaData || menyimpan || menghapus}
            className="cursor-pointer rounded-md border border-[#b3261e]/30 px-4 py-2.5 text-[14px] font-medium text-[#b3261e] hover:bg-[#b3261e]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {menghapus ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </form>
    </div>
  );
}
