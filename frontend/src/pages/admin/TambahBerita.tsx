import { useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKabar, useKabarLengkap } from "../../hooks/useKabar";
import { urlPenuh } from "../../lib/api";
import { notifGagalDari, notifSukses } from "../../lib/notifikasi";
import {
  hapusGambarTerunggah,
  namaDariUrl,
  UKURAN_MAKS_MB,
  unggahBeberapaGambar,
  unggahGambar,
} from "../../lib/unggah";
import type { KabarItem } from "../../types/kelurahan";

const MAKS_GAMBAR_LAIN = 5;

function hariIni() {
  const sekarang = new Date();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");
  return `${sekarang.getFullYear()}-${bulan}-${hari}`;
}

// Mode tambah langsung memasang form kosong. Mode ubah memuat kabar lengkap
// dari server dulu (daftar kabar tidak membawa isi lengkap), baru memasang
// form dengan data itu sebagai nilai awal. `key` membuat semuanya terpasang
// ulang tiap ganti id, sehingga nilai awal bisa langsung diturunkan dari data
// tanpa efek tambahan.
export default function TambahBerita() {
  const { id } = useParams();
  return id ? <MuatLaluUbah key={id} id={id} /> : <FormKabar key="baru" />;
}

function MuatLaluUbah({ id }: { id: string }) {
  const { data, memuat, error } = useKabarLengkap(id);

  if (memuat) {
    return <p className="text-abu">Memuat data kabar…</p>;
  }
  if (error) {
    return <p className="text-[14px] text-[#b3261e]">{error}</p>;
  }
  if (!data) {
    return <p className="text-abu">Kabar yang ingin diubah tidak ditemukan.</p>;
  }
  return <FormKabar id={id} awal={data} />;
}

function FormKabar({ id, awal }: { id?: string; awal?: KabarItem }) {
  const navigate = useNavigate();
  const { tambah, perbarui } = useKabar();
  const modeUbah = Boolean(id);

  const [jenis, setJenis] = useState<"Berita" | "Pengumuman">(awal?.jenis ?? "Berita");
  const [judul, setJudul] = useState(awal?.judul ?? "");
  const [tanggal, setTanggal] = useState(awal?.tanggal ?? hariIni());
  const [ringkas, setRingkas] = useState(awal?.ringkas ?? "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi ?? "");
  const [gambar, setGambar] = useState<string | undefined>(awal?.gambar);
  const [gambarLain, setGambarLain] = useState<string[]>(awal?.gambarLain ?? []);
  const [error, setError] = useState("");
  const [mengunggah, setMengunggah] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const gambarInputRef = useRef<HTMLInputElement>(null);
  const gambarLainInputRef = useRef<HTMLInputElement>(null);

  // Berkas yang diunggah selama form ini dibuka. Kalau salah satunya dibuang
  // sebelum disimpan, berkasnya ikut dihapus di server supaya tidak menumpuk.
  // Gambar bawaan dari kabar lama tidak masuk sini, jadi tidak ikut terhapus.
  const diunggahSesiIni = useRef(new Set<string>());

  const buangKalauBaruDiunggah = (url: string | undefined) => {
    const nama = namaDariUrl(url);
    if (nama && diunggahSesiIni.current.has(nama)) {
      diunggahSesiIni.current.delete(nama);
      void hapusGambarTerunggah(nama);
    }
  };

  const ubahGambar = async (file: File | null) => {
    if (!file) return;

    setMengunggah(true);
    setError("");
    try {
      const hasil = await unggahGambar(file);
      diunggahSesiIni.current.add(hasil.nama_berkas);
      buangKalauBaruDiunggah(gambar); // gambar lama diganti, bersihkan kalau perlu
      setGambar(hasil.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setMengunggah(false);
    }
  };

  const tambahGambarLain = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const sisaSlot = MAKS_GAMBAR_LAIN - gambarLain.length;
    const dipilih = Array.from(files).slice(0, sisaSlot);
    if (dipilih.length === 0) return;

    setMengunggah(true);
    setError("");
    try {
      const hasil = await unggahBeberapaGambar(dipilih);
      for (const berkas of hasil) diunggahSesiIni.current.add(berkas.nama_berkas);
      setGambarLain((prev) => [...prev, ...hasil.map((b) => b.url)].slice(0, MAKS_GAMBAR_LAIN));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setMengunggah(false);
    }
  };

  const hapusGambarLain = (index: number) => {
    buangKalauBaruDiunggah(gambarLain[index]);
    setGambarLain((prev) => prev.filter((_, i) => i !== index));
  };

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    if (mengunggah) {
      setError("Tunggu sampai unggahan gambar selesai.");
      return;
    }
    if (!judul.trim() || !ringkas.trim()) {
      setError("Judul dan ringkasan wajib diisi.");
      return;
    }
    // Kolom gambar_utama dan deskripsi_lengkap di database bersifat NOT NULL,
    // jadi keduanya dicegat di sini supaya pesannya jelas, bukan lewat error 400
    if (!gambar) {
      setError("Gambar utama wajib diunggah.");
      return;
    }
    if (!deskripsi.trim()) {
      setError("Deskripsi lengkap wajib diisi.");
      return;
    }

    setError("");
    setMenyimpan(true);

    const payload = {
      jenis,
      judul: judul.trim(),
      tanggal,
      ringkas: ringkas.trim(),
      deskripsi: deskripsi.trim(),
      gambar,
      gambarLain,
    };

    try {
      if (modeUbah && id) {
        await perbarui(id, payload);
      } else {
        await tambah(payload);
      }
      // Sudah tersimpan di database, berkasnya bukan lagi milik sesi form ini
      diunggahSesiIni.current.clear();
      // Notifikasi dulu baru pindah halaman: pesannya disimpan di luar React,
      // jadi tetap terbaca di daftar kabar walau form ini sudah dilepas.
      notifSukses(
        modeUbah ? `"${payload.judul}" diperbarui.` : `"${payload.judul}" berhasil ditambahkan.`,
      );
      navigate("/admin/kabar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kabar.");
      notifGagalDari(err, "Gagal menyimpan kabar.");
      setMenyimpan(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">
        {modeUbah ? "Ubah" : "Tambah"} Berita / Pengumuman
      </h1>
      <p className="mt-1.5 mb-8 text-abu">
        Isi formulir berikut untuk {modeUbah ? "memperbarui" : "menambahkan"} kabar kelurahan.
      </p>

      <form onSubmit={(e) => void kirim(e)} className="max-w-[640px]">
        <div className="mb-5">
          <span className="mb-2 block text-[14px] font-medium text-tinta">Jenis</span>
          <div className="flex gap-1.5">
            {(["Berita", "Pengumuman"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={jenis === t}
                onClick={() => setJenis(t)}
                className="cursor-pointer rounded-full border border-garis bg-white px-3.5 py-2 text-[14px] aria-pressed:border-sawah aria-pressed:bg-sawah aria-pressed:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-5 block">
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">Judul</span>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full rounded-lg border border-garis bg-white px-3.5 py-2.5 text-[14px]"
            placeholder="Judul berita atau pengumuman"
          />
        </label>

        <label className="mb-5 block max-w-[220px]">
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">Tanggal</span>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-lg border border-garis bg-white px-3.5 py-2.5 text-[14px]"
          />
        </label>

        <div className="mb-5">
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">Gambar utama (wajib)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={mengunggah}
              onClick={() => gambarInputRef.current?.click()}
              className="cursor-pointer rounded-md border-0 bg-sawah px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-daun disabled:cursor-wait disabled:opacity-60"
            >
              {mengunggah ? "Mengunggah…" : "Pilih Gambar"}
            </button>
            <span className="text-[13px] text-abu">
              {gambar ? "Gambar terpasang" : "Belum ada gambar dipilih"}
            </span>
          </div>
          <p className="mt-1.5 text-[12px] text-abu">
            JPG, PNG, WEBP, atau GIF. Maksimal {UKURAN_MAKS_MB} MB per gambar.
          </p>
          <input
            ref={gambarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              void ubahGambar(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
            className="hidden"
          />
          {gambar && (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={urlPenuh(gambar)}
                alt="Pratinjau gambar"
                className="h-24 w-36 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  buangKalauBaruDiunggah(gambar);
                  setGambar(undefined);
                }}
                className="cursor-pointer text-[13px] text-[#b3261e]"
              >
                Hapus gambar
              </button>
            </div>
          )}
        </div>

        <div className="mb-5">
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">
            Gambar lain ({gambarLain.length}/{MAKS_GAMBAR_LAIN})
          </span>
          <p className="mb-2 text-[13px] text-abu">
            Ditampilkan sebagai galeri di bawah artikel, maksimal {MAKS_GAMBAR_LAIN} gambar.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => gambarLainInputRef.current?.click()}
              disabled={mengunggah || gambarLain.length >= MAKS_GAMBAR_LAIN}
              className="cursor-pointer rounded-md border-0 bg-sawah px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-daun disabled:pointer-events-none disabled:opacity-50"
            >
              {mengunggah ? "Mengunggah…" : "Pilih Gambar"}
            </button>
            <span className="text-[13px] text-abu">
              {gambarLain.length >= MAKS_GAMBAR_LAIN
                ? "Batas gambar tercapai"
                : `${gambarLain.length} dari ${MAKS_GAMBAR_LAIN} gambar dipilih`}
            </span>
          </div>
          <input
            ref={gambarLainInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={mengunggah || gambarLain.length >= MAKS_GAMBAR_LAIN}
            onChange={(e) => {
              void tambahGambarLain(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          {gambarLain.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2 max-[480px]:grid-cols-3">
              {gambarLain.map((src, i) => (
                <div key={i} className="relative">
                  <img src={urlPenuh(src)} alt={`Pratinjau gambar lain ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => hapusGambarLain(i)}
                    aria-label={`Hapus gambar ${i + 1}`}
                    className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-0 bg-black/60 text-[12px] leading-none text-white hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="mb-5 block">
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">Ringkasan</span>
          <textarea
            value={ringkas}
            onChange={(e) => setRingkas(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-garis bg-white px-3.5 py-2.5 text-[14px]"
            placeholder="Ringkasan singkat yang tampil di daftar kabar"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">Deskripsi lengkap</span>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-garis bg-white px-3.5 py-2.5 text-[14px]"
            placeholder="Isi lengkap berita atau pengumuman (wajib diisi)"
          />
        </label>

        {error && <p className="mb-4 text-[14px] text-[#b3261e]">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mengunggah || menyimpan}
            className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun disabled:cursor-wait disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan…" : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/kabar")}
            className="cursor-pointer rounded-md border border-garis bg-white px-5 py-2.5 text-[14px] font-medium text-tinta hover:border-sawah"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
