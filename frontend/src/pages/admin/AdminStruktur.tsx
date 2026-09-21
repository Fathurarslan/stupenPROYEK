import { useRef, useState, type FormEvent } from "react";
import { useStruktur } from "../../hooks/useStruktur";
import { ambilInisial } from "../../lib/text";

function bacaFoto(file: File | null, set: (v: string | undefined) => void) {
  if (!file) {
    set(undefined);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => set(reader.result as string);
  reader.readAsDataURL(file);
}

export default function AdminStruktur() {
  const { perangkat, tambah, perbarui, hapus } = useStruktur();

  const [jabatanBaru, setJabatanBaru] = useState("");
  const [namaBaru, setNamaBaru] = useState("");
  const [nipBaru, setNipBaru] = useState("");
  const [fotoBaru, setFotoBaru] = useState<string | undefined>(undefined);
  const fotoBaruRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editJabatan, setEditJabatan] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editNip, setEditNip] = useState("");
  const [editFoto, setEditFoto] = useState<string | undefined>(undefined);
  const editFotoRef = useRef<HTMLInputElement>(null);

  const submitTambah = (e: FormEvent) => {
    e.preventDefault();
    if (!jabatanBaru.trim() || !namaBaru.trim()) return;
    tambah({
      jabatan: jabatanBaru.trim(),
      nama: namaBaru.trim(),
      nip: nipBaru.trim() || undefined,
      foto: fotoBaru,
    });
    setJabatanBaru("");
    setNamaBaru("");
    setNipBaru("");
    setFotoBaru(undefined);
  };

  const mulaiEdit = (id: string, jabatan: string, nama: string, nip?: string, foto?: string) => {
    setEditId(id);
    setEditJabatan(jabatan);
    setEditNama(nama);
    setEditNip(nip ?? "");
    setEditFoto(foto);
  };

  const simpanEdit = (id: string) => {
    if (!editJabatan.trim() || !editNama.trim()) return;
    perbarui(id, {
      jabatan: editJabatan.trim(),
      nama: editNama.trim(),
      nip: editNip.trim() || undefined,
      foto: editFoto,
    });
    setEditId(null);
  };

  const hapusItem = (id: string, nama: string) => {
    if (window.confirm(`Hapus "${nama}" dari struktur jabatan?`)) hapus(id);
  };

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">Struktur Jabatan</h1>
      <p className="mt-1.5 mb-8 text-abu">Kelola perangkat yang melayani warga Sidoharjo.</p>

      <form
        onSubmit={submitTambah}
        className="mb-8 flex flex-wrap items-end gap-4 rounded-lg border border-garis bg-white p-4"
      >
        <div className="flex items-center gap-3">
          {fotoBaru ? (
            <img src={fotoBaru} alt="Pratinjau foto" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-kabut text-[11px] text-abu">
              Foto
            </div>
          )}
          <div className="flex flex-col items-start gap-1">
            <button
              type="button"
              onClick={() => fotoBaruRef.current?.click()}
              className="cursor-pointer rounded-md border-0 bg-sawah px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-daun"
            >
              Pilih Foto
            </button>
            {fotoBaru && (
              <button
                type="button"
                onClick={() => setFotoBaru(undefined)}
                className="cursor-pointer text-[12px] text-[#b3261e]"
              >
                Hapus foto
              </button>
            )}
          </div>
          <input
            ref={fotoBaruRef}
            type="file"
            accept="image/*"
            onChange={(e) => bacaFoto(e.target.files?.[0] ?? null, setFotoBaru)}
            className="hidden"
          />
        </div>
        <label className="min-w-[200px] flex-1">
          <span className="mb-1.5 block text-[13px] font-medium text-tinta">Jabatan</span>
          <input
            type="text"
            value={jabatanBaru}
            onChange={(e) => setJabatanBaru(e.target.value)}
            className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
            placeholder="Contoh: Kasi Pemerintahan"
          />
        </label>
        <label className="min-w-[200px] flex-1">
          <span className="mb-1.5 block text-[13px] font-medium text-tinta">Nama</span>
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
            placeholder="Nama pejabat"
          />
        </label>
        <label className="min-w-[180px] flex-1">
          <span className="mb-1.5 block text-[13px] font-medium text-tinta">NIP (opsional)</span>
          <input
            type="text"
            value={nipBaru}
            onChange={(e) => setNipBaru(e.target.value)}
            className="w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]"
            placeholder="Nomor Induk Pegawai"
          />
        </label>
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun"
        >
          + Tambah
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-garis bg-white">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-kabut text-left text-abu">
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Jabatan</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {perangkat.map((p) => (
              <tr key={p.id} className="border-t border-garis">
                {editId === p.id ? (
                  <>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {editFoto ? (
                          <img src={editFoto} alt="Pratinjau foto" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kabut text-[11px] text-abu">
                            Foto
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => editFotoRef.current?.click()}
                          className="cursor-pointer rounded-md border border-garis px-2.5 py-1.5 text-[12px] text-tinta hover:border-sawah"
                        >
                          Ubah
                        </button>
                        <input
                          ref={editFotoRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => bacaFoto(e.target.files?.[0] ?? null, setEditFoto)}
                          className="hidden"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={editJabatan}
                        onChange={(e) => setEditJabatan(e.target.value)}
                        className="w-full rounded-md border border-garis px-2.5 py-1.5 text-[14px]"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        className="mb-1.5 w-full rounded-md border border-garis px-2.5 py-1.5 text-[14px]"
                        placeholder="Nama"
                      />
                      <input
                        value={editNip}
                        onChange={(e) => setEditNip(e.target.value)}
                        className="w-full rounded-md border border-garis px-2.5 py-1.5 text-[13px]"
                        placeholder="NIP (opsional)"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => simpanEdit(p.id)}
                          className="cursor-pointer rounded-md bg-sawah px-3 py-1.5 text-[13px] font-medium text-white hover:bg-daun"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="cursor-pointer rounded-md border border-garis px-3 py-1.5 text-[13px] text-tinta"
                        >
                          Batal
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      {p.foto ? (
                        <img src={p.foto} alt={p.nama} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kabut text-[11px] text-abu">
                          {ambilInisial(p.nama)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-abu">{p.jabatan}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-tinta">{p.nama}</div>
                      {p.nip && <div className="mt-0.5 text-[12px] text-abu">NIP. {p.nip}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => mulaiEdit(p.id, p.jabatan, p.nama, p.nip, p.foto)}
                          className="cursor-pointer rounded-md border border-garis px-3 py-1.5 text-[13px] text-tinta hover:border-sawah"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => hapusItem(p.id, p.nama)}
                          className="cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-[13px] text-[#b3261e] hover:bg-[#b3261e]/10"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {perangkat.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-abu">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
