import { Link, useParams } from "react-router-dom";
import { useKabar, useKabarLengkap } from "../hooks/useKabar";
import { urlPenuh } from "../lib/api";
import { formatTanggal } from "../lib/tanggal";

// key={id} supaya pindah dari satu kabar ke kabar lain (lewat "Kabar lainnya")
// memasang komponen baru yang mulai dari keadaan memuat, bukan sempat
// menampilkan isi kabar sebelumnya
export default function KabarDetail() {
  const { id = "" } = useParams();
  return <IsiKabar key={id} id={id} />;
}

function IsiKabar({ id }: { id: string }) {
  // Isi lengkap diambil sendiri dari /api/kabar/:id, karena daftar kabar
  // sekarang hanya membawa ringkasan. Daftar tetap dipakai untuk "Kabar lainnya".
  const { data: item, memuat, error } = useKabarLengkap(id);
  const { kabar } = useKabar();

  // Data datang dari backend, jadi jangan bilang "tidak ditemukan"
  // sebelum pemuatannya selesai
  if (memuat) {
    return (
      <main className="wrap py-18">
        <p className="text-abu">Memuat kabar…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="wrap py-18">
        <p className="text-[#b3261e]">{error}</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="wrap py-18">
        <p className="text-abu">Berita atau pengumuman yang dicari tidak ditemukan.</p>
        <Link to="/" className="mt-3 inline-block font-medium text-daun underline underline-offset-2">
          ← Kembali ke beranda
        </Link>
      </main>
    );
  }

  const lainnya = kabar.filter((k) => k.id !== item.id).slice(0, 3);

  return (
    <main className="wrap py-18">
      <Link
        to="/#kabar"
        className="mb-6 inline-block text-[14px] font-medium text-daun no-underline hover:underline"
      >
        ← Kembali ke kabar kelurahan
      </Link>

      <article className="max-w-[760px]">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-medium ${
            item.jenis === "Berita" ? "bg-tambak/15 text-tambak" : "bg-padi/25 text-padigelap"
          }`}
        >
          {item.jenis}
        </span>
        <h1 className="font-heading mt-3 mb-2 text-[clamp(26px,4vw,38px)] leading-[1.15] text-sawah">
          {item.judul}
        </h1>
        <p className="mb-6 text-[14px] text-abu">{formatTanggal(item.tanggal)}</p>

        {item.gambar ? (
          <img
            src={urlPenuh(item.gambar)}
            alt={item.judul}
            className="mb-6 max-h-[420px] w-full rounded-[14px] object-cover"
          />
        ) : (
          <div className="mb-6 flex h-[220px] items-center justify-center rounded-[14px] bg-kabut text-abu">
            Tanpa foto
          </div>
        )}

        <p className="mb-5 text-[18px] leading-[1.6] font-medium text-tinta">{item.ringkas}</p>

        {item.deskripsi && (
          <div className="text-[15px] leading-[1.8] whitespace-pre-line text-tinta">{item.deskripsi}</div>
        )}

        {item.gambarLain && item.gambarLain.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading mb-3 text-[18px] text-sawah">Galeri foto</h2>
            <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-2">
              {item.gambarLain.map((src, i) => (
                <img
                  key={i}
                  src={urlPenuh(src)}
                  alt={`${item.judul} - foto ${i + 1}`}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </article>

      {lainnya.length > 0 && (
        <section className="mt-16 max-w-[760px]">
          <h2 className="font-heading mb-4 text-[20px] text-sawah">Kabar lainnya</h2>
          <div className="flex flex-col">
            {lainnya.map((k) => (
              <Link
                key={k.id}
                to={`/kabar/${k.id}`}
                className="block border-b border-garis py-4 no-underline first:pt-0 hover:bg-kabut/60"
              >
                <span className="text-[13px] text-abu">
                  {k.jenis}, {formatTanggal(k.tanggal)}
                </span>
                <h3 className="mt-1 text-[16px] text-tinta">{k.judul}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
