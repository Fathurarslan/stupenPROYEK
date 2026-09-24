import { BATAS_WILAYAH, FAKTA_GEOGRAFIS } from "../data/geografis";
// Peta Google Maps yang disematkan: bisa diperbesar, diperkecil, dan digeser,
// tanpa pustaka tambahan maupun API key.
//
// Harus URL /maps/embed. Link bagikan (maps.app.goo.gl/...) atau alamat
// google.com/maps/place/... TIDAK bisa dipakai: Google mengirim header
// X-Frame-Options: SAMEORIGIN untuk halaman itu, sehingga browser menolak
// menampilkannya di iframe dan kotak petanya kosong.
//
// Koordinat pin diambil dari lokasi "Kantor Kelurahan Sidoharjo Kec. Lamongan"
// di Google Maps. Angka setelah !6i adalah tingkat zoom awal (17 = sekitar
// tingkat jalan; kecilkan untuk memperlihatkan wilayah yang lebih luas).
const KOORDINAT_KANTOR = "-7.1280449,112.4137123";
const URL_PETA = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${KOORDINAT_KANTOR}!6i17`;

export default function Geografis() {
  return (
    <main className="wrap py-18">
      <h1 className="font-heading mb-2.5 text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">
        Kondisi Geografis
      </h1>
      <p className="mb-10 max-w-[65ch] text-abu">
        Gambaran letak, luas, dan kondisi bentang alam Kelurahan Sidoharjo,
        Kabupaten Lamongan, Jawa Timur.
      </p>

      <div className="mb-16 grid grid-cols-[1fr_1fr] items-center gap-12 max-[860px]:grid-cols-1">
        <div>
          {FAKTA_GEOGRAFIS.map((f) => (
            <div
              key={f.label}
              className="flex items-baseline justify-between gap-4 border-b border-garis py-3 first:pt-0 last:border-0"
            >
              <span className="text-abu">{f.label}</span>
              <b className="font-heading text-right text-[18px] text-sawah">{f.nilai}</b>
            </div>
          ))}
        </div>
        {/* loading="lazy": peta baru dimuat saat mendekati layar, jadi tidak
            memperlambat bagian atas halaman */}
        <iframe
          src={URL_PETA}
          title="Peta lokasi Kantor Kelurahan Sidoharjo"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="aspect-[4/3] w-full rounded-lg border border-garis bg-kabut"
        />
      </div>

      <section className="mb-16" aria-label="Batas wilayah">
        <h2 className="font-heading mb-2.5 text-[22px] text-sawah">Batas Wilayah</h2>
        <p className="mb-5 max-w-[65ch] text-abu">
          Kelurahan Sidoharjo berbatasan langsung dengan wilayah-wilayah berikut.
        </p>
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          {BATAS_WILAYAH.map((b) => (
            <div key={b.arah} className="rounded-lg border border-garis bg-kabut p-4">
              <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-daun">
                {b.arah}
              </div>
              <div className="text-tinta">{b.wilayah}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
