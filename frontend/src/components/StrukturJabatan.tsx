import { PERANGKAT } from "../data/profil";

export default function StrukturJabatan() {
  return (
    <div id="struktur">
      <h2 className="font-heading text-[clamp(22px,3vw,28px)] leading-[1.1] text-sawah">Struktur jabatan kelurahan</h2>
      <p className="mt-1.5 mb-7 text-abu">Perangkat yang melayani warga Sidoharjo.</p>
      <ul className="m-0 list-none p-0">
        {PERANGKAT.map((p) => (
          <li
            key={p.jabatan}
            className="flex flex-col gap-1 border-b border-garis py-3.5 first:border-t-2 first:border-t-sawah"
          >
            <span className="text-[14px] text-abu">{p.jabatan}</span>
            <b className="font-semibold">{p.nama}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
