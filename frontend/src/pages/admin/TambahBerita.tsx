import { useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKabar } from "../../hooks/useKabar";
import type { KabarItem } from "../../types/kelurahan";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MAKS_GAMBAR_LAIN = 5;

function formatTanggal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

// Dibungkus dengan `key` di komponen luar supaya form ini dipasang ulang
// setiap kali id di URL berganti, sehingga state awal bisa langsung
// diturunkan dari data yang ada tanpa efek tambahan untuk menyalinnya.
export default function TambahBerita() {
  const { id } = useParams();
  return <FormKabar key={id ?? "baru"} id={id} />;
}

function FormKabar({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { cariById, tambah, perbarui } = useKabar();
  const modeUbah = Boolean(id);
  const awal: KabarItem | undefined = id ? cariById(id) : undefined;

  const [jenis, setJenis] = useState<"Berita" | "Pengumuman">(
    awal?.jenis === "Pengumuman" ? "Pengumuman" : "Berita",
  );
  const [judul, setJudul] = useState(awal?.judul ?? "");
  const [tanggal, setTanggal] = useState(() =>
    awal && /^\d{4}-\d{2}-\d{2}$/.test(awal.tanggal) ? awal.tanggal : new Date().toISOString().slice(0, 10),
  );
  const [ringkas, setRingkas] = useState(awal?.ringkas ?? "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi ?? "");
  const [gambar, setGambar] = useState<string | undefined>(awal?.gambar);
  const [gambarLain, setGambarLain] = useState<string[]>(awal?.gambarLain ?? []);
  const [error, setError] = useState("");
  const gambarInputRef = useRef<HTMLInputElement>(null);
  const gambarLainInputRef = useRef<HTMLInputElement>(null);

  const ubahGambar = (file: File | null) => {
    if (!file) {
      setGambar(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setGambar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const tambahGambarLain = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const sisaSlot = MAKS_GAMBAR_LAIN - gambarLain.length;
    Array.from(files)
      .slice(0, sisaSlot)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setGambarLain((prev) =>
            prev.length >= MAKS_GAMBAR_LAIN ? prev : [...prev, reader.result as string],
          );
        };
        reader.readAsDataURL(file);
      });
  };

  const hapusGambarLain = (index: number) => {
    setGambarLain((prev) => prev.filter((_, i) => i !== index));
  };

  const kirim = (e: FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !ringkas.trim()) {
      setError("Judul dan ringkasan wajib diisi.");
      return;
    }
    setError("");

    const payload = {
      jenis,
      judul: judul.trim(),
      tanggal: formatTanggal(tanggal),
      ringkas: ringkas.trim(),
      deskripsi: deskripsi.trim() || undefined,
      gambar,
      gambarLain: gambarLain.length > 0 ? gambarLain : undefined,
    };

    if (modeUbah && id) {
      perbarui(id, payload);
    } else {
      tambah(payload);
    }
    navigate("/admin/kabar");
  };

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">
        {modeUbah ? "Ubah" : "Tambah"} Berita / Pengumuman
      </h1>
      <p className="mt-1.5 mb-8 text-abu">
        Isi formulir berikut untuk {modeUbah ? "memperbarui" : "menambahkan"} kabar kelurahan.
      </p>

      <form onSubmit={kirim} className="max-w-[640px]">
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
          <span className="mb-1.5 block text-[14px] font-medium text-tinta">Gambar</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => gambarInputRef.current?.click()}
              className="cursor-pointer rounded-md border-0 bg-sawah px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-daun"
            >
              Pilih Gambar
            </button>
            <span className="text-[13px] text-abu">
              {gambar ? "Gambar terpasang" : "Belum ada gambar dipilih"}
            </span>
          </div>
          <input
            ref={gambarInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => ubahGambar(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {gambar && (
            <div className="mt-3 flex items-center gap-3">
              <img src={gambar} alt="Pratinjau gambar" className="h-24 w-36 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setGambar(undefined)}
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
              disabled={gambarLain.length >= MAKS_GAMBAR_LAIN}
              className="cursor-pointer rounded-md border-0 bg-sawah px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-daun disabled:pointer-events-none disabled:opacity-50"
            >
              Pilih Gambar
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
            accept="image/*"
            multiple
            disabled={gambarLain.length >= MAKS_GAMBAR_LAIN}
            onChange={(e) => {
              tambahGambarLain(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          {gambarLain.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2 max-[480px]:grid-cols-3">
              {gambarLain.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`Pratinjau gambar lain ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
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
            placeholder="Isi lengkap berita atau pengumuman (opsional)"
          />
        </label>

        {error && <p className="mb-4 text-[14px] text-[#b3261e]">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun"
          >
            Simpan
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
