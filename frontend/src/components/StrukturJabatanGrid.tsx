import { useStruktur } from "../hooks/useStruktur";
import { urlPenuh } from "../lib/api";
import { ambilInisial } from "../lib/text";
import { TINGKAT_JABATAN, type PerangkatItem } from "../types/kelurahan";

// Versi kartu dari struktur jabatan untuk halaman /struktur. Bagan dibagi
// tiga tingkat: tingkat 1 satu kartu di tengah (Kepala Kelurahan), tingkat 2
// dan 3 boleh berisi beberapa kartu. Nomor tingkatnya sendiri tidak ditulis
// di halaman ini, yang tampil hanya kartunya. Kartu dan foto memakai rasio
// potret 3:4, seperti pas foto. Untuk tampilan ringkas di sidebar beranda,
// lihat StrukturJabatan.tsx.
export default function StrukturJabatanGrid() {
  const { perangkat, memuat } = useStruktur();

  return (
    <div id="struktur">
      <h1 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">
        Struktur jabatan kelurahan
      </h1>
      <p className="mt-1.5 mb-8 max-w-[52ch] text-abu">Perangkat yang melayani warga Sidoharjo.</p>

      {perangkat.length === 0 ? (
        <p className="text-abu">{memuat ? "Memuat data…" : "Belum ada data."}</p>
      ) : (
        <div className="flex flex-col gap-7">
          {TINGKAT_JABATAN.map((tingkat) => {
            const baris = perangkat.filter((p) => p.tingkat === tingkat);
            if (baris.length === 0) return null;

            return (
              <div key={tingkat} className="flex flex-wrap justify-center gap-4">
                {baris.map((p) => (
                  <KartuPejabat key={p.id} pejabat={p} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Lebar kartu dipatok supaya beberapa kartu muat dalam satu baris pada layar
// lebar, lalu turun sendiri ke baris berikutnya saat layar menyempit.
function KartuPejabat({ pejabat: p }: { pejabat: PerangkatItem }) {
  return (
    <div className="flex w-[190px] max-w-full flex-col items-center rounded-xl border border-garis bg-white px-3.5 py-4 text-center">
      {/* Kotak foto diukur di sini, bukan di <img>/<div> inisialnya, supaya
          semua kartu sama tinggi baik fotonya ada maupun tidak. */}
      <div className="aspect-[3/4] w-full max-w-[140px] shrink-0 overflow-hidden rounded-lg bg-kabut">
        {p.foto ? (
          <img src={urlPenuh(p.foto)} alt={p.nama} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[26px] font-semibold text-abu">
            {ambilInisial(p.nama)}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col items-center gap-0.5">
        <b className="text-[14px] leading-[1.25] text-tinta">{p.nama}</b>
        <span className="text-[12px] text-abu">{p.jabatan}</span>
        {p.nip && <span className="text-[11px] text-abu">NIP. {p.nip}</span>}
      </div>
    </div>
  );
}
