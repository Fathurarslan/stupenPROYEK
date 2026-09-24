import { Link } from "react-router-dom";
import { DATA_PENDUDUK, IDENTITAS_KELURAHAN } from "../data/profil";
import fotoKantor from "../assets/foto-kantor.png";

export default function Profil() {
  return (
    <main className="wrap py-18">
      <h1 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">
        Profil Kelurahan
      </h1>
      <p className="mt-1.5 mb-10 max-w-[65ch] text-abu">
        Kelurahan Sidoharjo merupakan salah satu dari tiga belas kelurahan yang berada di
        wilayah Kecamatan Lamongan, Kabupaten Lamongan. Kelurahan Sidoharjo berlokasi di
        kawasan strategis pusat kota Lamongan. Letak yang cukup dekat dengan pusat
        pemerintahan kabupaten menjadikan kelurahan ini memiliki aktivitas pemerintahan dan
        sosial ekonomi yang cukup dinamis.
      </p>

      <div className="mb-14 grid grid-cols-[1fr_1.2fr] items-start gap-10 max-[860px]:grid-cols-1">
        <figure className="m-0">
          <img src={fotoKantor} alt="Foto Kantor Kelurahan Sidoharjo" className="flex aspect-[4/3] items-center justify-center rounded-lg border border-garis bg-kabut text-center text-[14px] text-abu" />
        </figure>

        <div>
          <table className="w-full border-collapse overflow-hidden rounded-lg border border-garis text-[14px]">
            <tbody>
              {IDENTITAS_KELURAHAN.map((item, i) => (
                <tr key={item.label} className={i % 2 === 0 ? "bg-kabut" : undefined}>
                  <th
                    scope="row"
                    className="w-[44%] border-b border-garis px-3.5 py-2.5 text-left font-medium text-abu last:border-b-0"
                  >
                    {item.label}
                  </th>
                  <td className="border-b border-garis px-3.5 py-2.5 text-tinta last:border-b-0">
                    {item.nilai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="mb-14" aria-label="Data penduduk">
        <h2 className="font-heading mb-2.5 text-[22px] text-sawah">Data Penduduk</h2>
        <div className="grid max-w-[440px] grid-cols-2 gap-4 max-[480px]:grid-cols-1">
          {DATA_PENDUDUK.map((d) => (
            <div key={d.label} className="rounded-lg border border-garis bg-kabut p-4">
              <div className="mb-1 text-[13px] text-abu">{d.label}</div>
              <div className="font-heading text-[20px] text-sawah">{d.nilai}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Visi dan misi">
        <h2 className="font-heading mb-2.5 text-[22px] text-sawah">Visi &amp; Misi</h2>
        <p className="mb-3 max-w-[65ch] text-abu">
          Karena OPD Kelurahan Sidoharjo merupakan unit kerja dari Pemerintah Kabupaten
          Lamongan, visi dan misi Kelurahan Sidoharjo tetap mengacu dan disandarkan pada Visi
          Kabupaten Lamongan.
        </p>
        <Link to="/visi-misi" className="font-medium text-daun underline underline-offset-2">
          Baca visi &amp; misi selengkapnya →
        </Link>
      </section>
    </main>
  );
}
