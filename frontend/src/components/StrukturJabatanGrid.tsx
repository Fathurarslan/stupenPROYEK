import { useStruktur } from "../hooks/useStruktur";
import { ambilInisial } from "../lib/text";

// Versi kartu dari struktur jabatan untuk halaman /struktur, maksimal
// 3 kartu per baris agar foto bisa tampil besar. Kartu dan foto
// memakai rasio potret 3:4, seperti pas foto. Untuk tampilan ringkas
// di sidebar beranda, lihat StrukturJabatan.tsx.
export default function StrukturJabatanGrid() {
  const { perangkat } = useStruktur();

  return (
    <div id="struktur">
      <h1 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">
        Struktur jabatan kelurahan
      </h1>
      <p className="mt-1.5 mb-8 max-w-[52ch] text-abu">Perangkat yang melayani warga Sidoharjo.</p>

      <div className="grid grid-cols-3 gap-5 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1">
        {perangkat.map((p) => (
          <div
            key={p.id}
            className="flex flex-col items-center rounded-xl border border-garis bg-white px-5 py-6 text-center"
          >
            {p.foto ? (
              <img
                src={p.foto}
                alt={p.nama}
                className="aspect-[3/4] w-full max-w-[220px] shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full max-w-[220px] shrink-0 items-center justify-center rounded-lg bg-kabut text-[40px] font-semibold text-abu">
                {ambilInisial(p.nama)}
              </div>
            )}
            <div className="mt-4 flex flex-col items-center gap-1">
              <b className="text-[16px] leading-[1.25] text-tinta">{p.nama}</b>
              <span className="text-[13px] text-abu">{p.jabatan}</span>
              {p.nip && <span className="text-[12px] text-abu">NIP. {p.nip}</span>}
            </div>
          </div>
        ))}
        {perangkat.length === 0 && <p className="text-abu">Belum ada data.</p>}
      </div>
    </div>
  );
}
