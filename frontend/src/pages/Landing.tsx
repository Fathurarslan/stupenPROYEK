import Hero from "../components/Hero";
import Kabar from "../components/Kabar";
import StatistikPenduduk from "../components/StatistikPenduduk";
import StrukturJabatan from "../components/StrukturJabatan";

export default function Landing() {
  return (
    <>
      <Hero />
      <main className="wrap py-18">
        <div className="grid grid-cols-[4fr_1fr] gap-8 max-[860px]:grid-cols-1">
          <section aria-label="Berita">
            <Kabar />
          </section>
          <section aria-label="Struktur jabatan dan statistik penduduk">
            <StrukturJabatan />
            <StatistikPenduduk />
          </section>
        </div>
      </main>
    </>
  );
}
