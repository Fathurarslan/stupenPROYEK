import { useRef, useState, type FormEvent } from "react";
import { useStruktur } from "../../hooks/useStruktur";
import { urlPenuh } from "../../lib/api";
import { ambilInisial } from "../../lib/text";
import { notifGagal, notifGagalDari, notifSukses } from "../../lib/notifikasi";
import { UKURAN_MAKS_MB, unggahGambar } from "../../lib/unggah";
import type { PerangkatItem, TingkatJabatan } from "../../types/kelurahan";

// Pengisian dibagi tiga kolom, satu kolom per tingkat bagan. Tingkat 1 hanya
// boleh berisi satu jabatan (Kepala Kelurahan): begitu terisi, form tambahnya
// hilang dan yang tersisa hanya tombol Ubah dan Hapus. Tingkat 2 dan 3 boleh
// diisi berkali-kali.
const KOLOM: { tingkat: TingkatJabatan; judul: string; keterangan: string }[] = [
  {
    tingkat: 1,
    judul: "Tingkat 1",
    keterangan: "Hanya satu jabatan, diisi Kepala Kelurahan.",
  },
  {
    tingkat: 2,
    judul: "Tingkat 2",
    keterangan: "Boleh diisi lebih dari satu jabatan.",
  },
  {
    tingkat: 3,
    judul: "Tingkat 3",
    keterangan: "Boleh diisi lebih dari satu jabatan.",
  },
];

interface NilaiForm {
  jabatan: string;
  nama: string;
  nip: string;
  foto?: string;
}

const FORM_KOSONG: NilaiForm = { jabatan: "", nama: "", nip: "", foto: undefined };

export default function AdminStruktur() {
  const { perangkat, memuat, error, tambah, perbarui, hapus } = useStruktur();

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">Struktur Jabatan</h1>
      <p className="mt-1.5 mb-8 text-abu">
        Kelola perangkat yang melayani warga Sidoharjo. Nomor tingkat hanya mengatur urutan kartu,
        tulisannya tidak tampil di halaman publik.
      </p>

      {/* Hanya kegagalan memuat yang ditulis di sini; hasil tambah, ubah, dan
          hapus muncul sebagai notifikasi di pojok kanan atas. */}
      {error && (
        <p className="mb-4 rounded-md border border-[#b3261e]/30 bg-[#b3261e]/5 p-3 text-[14px] text-[#b3261e]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 items-start gap-5 max-[1100px]:grid-cols-1">
        {KOLOM.map((kolom) => (
          <KolomTingkat
            key={kolom.tingkat}
            judul={kolom.judul}
            keterangan={kolom.keterangan}
            tingkat={kolom.tingkat}
            daftar={perangkat.filter((p) => p.tingkat === kolom.tingkat)}
            memuat={memuat}
            tambah={tambah}
            perbarui={perbarui}
            hapus={hapus}
          />
        ))}
      </div>
    </div>
  );
}

interface PropsKolom {
  judul: string;
  keterangan: string;
  tingkat: TingkatJabatan;
  daftar: PerangkatItem[];
  memuat: boolean;
  tambah: (item: Omit<PerangkatItem, "id">) => Promise<unknown>;
  perbarui: (id: string, item: Omit<PerangkatItem, "id">) => Promise<unknown>;
  hapus: (id: string) => Promise<void>;
}

function KolomTingkat({
  judul,
  keterangan,
  tingkat,
  daftar,
  memuat,
  tambah,
  perbarui,
  hapus,
}: PropsKolom) {
  const [formBaru, setFormBaru] = useState<NilaiForm>(FORM_KOSONG);
  const [editId, setEditId] = useState<string | null>(null);
  const [formEdit, setFormEdit] = useState<NilaiForm>(FORM_KOSONG);

  // Kunci tingkat 1: satu baris saja. Backend juga menolaknya, ini supaya
  // form tambahnya tidak ditampilkan sejak awal.
  const bolehTambah = tingkat !== 1 || daftar.length === 0;

  const simpanBaru = async (nilai: NilaiForm) => {
    await tambah({
      jabatan: nilai.jabatan.trim(),
      nama: nilai.nama.trim(),
      nip: nilai.nip.trim() || undefined,
      foto: nilai.foto,
      tingkat,
    });
    setFormBaru(FORM_KOSONG);
    notifSukses(`"${nilai.nama.trim()}" ditambahkan ke tingkat ${tingkat}.`);
  };

  const simpanEdit = async (id: string, nilai: NilaiForm) => {
    await perbarui(id, {
      jabatan: nilai.jabatan.trim(),
      nama: nilai.nama.trim(),
      nip: nilai.nip.trim() || undefined,
      foto: nilai.foto,
      tingkat,
    });
    setEditId(null);
    notifSukses(`Perubahan pada "${nilai.nama.trim()}" tersimpan.`);
  };

  const mulaiEdit = (p: PerangkatItem) => {
    setEditId(p.id);
    setFormEdit({ jabatan: p.jabatan, nama: p.nama, nip: p.nip ?? "", foto: p.foto });
  };

  const hapusItem = async (p: PerangkatItem) => {
    if (!window.confirm(`Hapus "${p.nama}" dari struktur jabatan?`)) return;
    try {
      await hapus(p.id);
      notifSukses(`"${p.nama}" dihapus dari struktur jabatan.`);
    } catch (err) {
      notifGagalDari(err, "Gagal menghapus jabatan.");
    }
  };

  return (
    <section className="rounded-lg border border-garis bg-white p-4">
      <h2 className="font-heading text-[18px] text-sawah">{judul}</h2>
      <p className="mt-1 mb-4 text-[13px] text-abu">{keterangan}</p>

      {bolehTambah ? (
        <FormJabatan
          nilai={formBaru}
          setNilai={setFormBaru}
          onSimpan={simpanBaru}
          labelSimpan="+ Tambah"
        />
      ) : (
        <p className="mb-4 rounded-md border border-garis bg-kabut px-3 py-2.5 text-[13px] text-abu">
          Tingkat 1 sudah terisi. Ubah atau hapus data di bawah untuk menggantinya.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {daftar.map((p) =>
          editId === p.id ? (
            <div key={p.id} className="rounded-lg border border-sawah p-3">
              <FormJabatan
                nilai={formEdit}
                setNilai={setFormEdit}
                onSimpan={(nilai) => simpanEdit(p.id, nilai)}
                labelSimpan="Simpan"
                onBatal={() => setEditId(null)}
              />
            </div>
          ) : (
            <div key={p.id} className="flex items-start gap-3 rounded-lg border border-garis p-3">
              {p.foto ? (
                <img
                  src={urlPenuh(p.foto)}
                  alt={p.nama}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kabut text-[12px] text-abu">
                  {ambilInisial(p.nama)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium break-words text-tinta">{p.nama}</div>
                <div className="text-[13px] break-words text-abu">{p.jabatan}</div>
                {p.nip && <div className="mt-0.5 text-[12px] text-abu">NIP. {p.nip}</div>}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => mulaiEdit(p)}
                    className="cursor-pointer rounded-md border border-garis px-3 py-1.5 text-[13px] text-tinta hover:border-sawah"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => void hapusItem(p)}
                    className="cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-[13px] text-[#b3261e] hover:bg-[#b3261e]/10"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {daftar.length === 0 && (
          <p className="py-4 text-center text-[13px] text-abu">
            {memuat ? "Memuat data…" : "Belum ada data."}
          </p>
        )}
      </div>
    </section>
  );
}

interface PropsForm {
  nilai: NilaiForm;
  setNilai: (nilai: NilaiForm) => void;
  onSimpan: (nilai: NilaiForm) => Promise<void>;
  labelSimpan: string;
  onBatal?: () => void;
}

function FormJabatan({ nilai, setNilai, onSimpan, labelSimpan, onBatal }: PropsForm) {
  const [mengunggah, setMengunggah] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);

  // Foto diunggah ke backend, yang disimpan hanya path-nya (/upload/xxx.jpg).
  // Sebelumnya foto disimpan sebagai base64 di localStorage, yang cepat penuh.
  const pilihFoto = async (file: File | null) => {
    if (!file) return;
    setMengunggah(true);
    try {
      const hasil = await unggahGambar(file);
      setNilai({ ...nilai, foto: hasil.url });
    } catch (err) {
      notifGagalDari(err, "Gagal mengunggah foto.");
    } finally {
      setMengunggah(false);
    }
  };

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    // Dulu tombolnya diam saja kalau kolomnya kosong, sekarang alasannya
    // disampaikan lewat notifikasi
    if (!nilai.jabatan.trim() || !nilai.nama.trim()) {
      notifGagal("Kolom jabatan dan nama wajib diisi.");
      return;
    }

    setMenyimpan(true);
    try {
      await onSimpan(nilai);
    } catch (err) {
      notifGagalDari(err, "Gagal menyimpan jabatan.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <form onSubmit={(e) => void kirim(e)} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {nilai.foto ? (
          <img
            src={urlPenuh(nilai.foto)}
            alt="Pratinjau foto"
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-kabut text-[11px] text-abu">
            Foto
          </div>
        )}
        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            disabled={mengunggah}
            onClick={() => fotoRef.current?.click()}
            className="cursor-pointer rounded-md border-0 bg-sawah px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-daun disabled:cursor-wait disabled:opacity-60"
          >
            {mengunggah ? "Mengunggah…" : "Pilih Foto"}
          </button>
          {nilai.foto && (
            <button
              type="button"
              onClick={() => setNilai({ ...nilai, foto: undefined })}
              className="cursor-pointer text-[12px] text-[#b3261e]"
            >
              Hapus foto
            </button>
          )}
        </div>
        <input
          ref={fotoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            void pilihFoto(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      <label>
        <span className="mb-1.5 block text-[13px] font-medium text-tinta">Jabatan</span>
        <input
          type="text"
          value={nilai.jabatan}
          onChange={(e) => setNilai({ ...nilai, jabatan: e.target.value })}
          className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
          placeholder="Contoh: Kasi Pemerintahan"
        />
      </label>
      <label>
        <span className="mb-1.5 block text-[13px] font-medium text-tinta">Nama</span>
        <input
          type="text"
          value={nilai.nama}
          onChange={(e) => setNilai({ ...nilai, nama: e.target.value })}
          className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
          placeholder="Nama pejabat"
        />
      </label>
      <label>
        <span className="mb-1.5 block text-[13px] font-medium text-tinta">NIP (opsional)</span>
        <input
          type="text"
          value={nilai.nip}
          onChange={(e) => setNilai({ ...nilai, nip: e.target.value })}
          className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
          placeholder="Nomor Induk Pegawai"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mengunggah || menyimpan}
          className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun disabled:cursor-wait disabled:opacity-60"
        >
          {menyimpan ? "Menyimpan…" : labelSimpan}
        </button>
        {onBatal && (
          <button
            type="button"
            onClick={onBatal}
            className="cursor-pointer rounded-md border border-garis px-4 py-2.5 text-[14px] text-tinta"
          >
            Batal
          </button>
        )}
      </div>

      <p className="text-[12px] text-abu">
        Foto: JPG, PNG, WEBP, atau GIF. Maksimal {UKURAN_MAKS_MB} MB.
      </p>
    </form>
  );
}
