import logoHero from "../assets/logo-pemkab-lmg.png"
import fotoKantor from "../assets/foto-kantor.png"

// Isi pita berjalan di bawah Hero. Tambah atau hapus pesan cukup di sini,
// ulangan dan kecepatannya menyesuaikan sendiri.
const PESAN_PITA = [
  "Website masih dalam tahap pengembangan",
  "Jam kerja Senin s.d Jumat Pukul 07.30 - 15.00 WIB",
];

// Satu salinan harus lebih lebar dari layar, jadi makin banyak pesan makin
// sedikit ulangan yang dibutuhkan
const PENGULANGAN = Math.max(2, Math.ceil(8 / PESAN_PITA.length));
// Sekitar 5 detik per item. Durasi animasi adalah waktu untuk menggeser satu
// salinan penuh, jadi kalau angkanya tetap, isi yang lebih panjang akan
// bergerak lebih cepat.
const DURASI_PITA = `${PENGULANGAN * PESAN_PITA.length * 5}s`;

export default function Hero() {     
  return (
    // Foto dipasang lewat style, bukan kelas bg-[url(...)]: path relatif di
    // kelas itu dihitung dari lokasi file CSS, bukan dari file ini, sehingga
    // gambarnya tidak ketemu. Lapisan hitam 50% di atasnya menggelapkan foto
    // supaya teks putih tetap terbaca; bg-sawah jadi cadangan selama foto dimuat.
    <section
      className="relative overflow-hidden bg-sawah bg-cover bg-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgb(31 77 46 / 0.8), rgb(31 77 46 / 0.8)), url(${fotoKantor})`,
      }}
      id="beranda"
    >
      <div className="wrap grid grid-cols-[1.1fr_1fr] justify-center items-center gap-10 py-10 max-[860px]:grid-cols-1 max-[860px]:text-center">
        <div>
          <h1 className="font-heading text-[clamp(40px,6vw,72px)] leading-[1.1] font-extrabold tracking-[-0.02em]">
            Selamat Datang di Kelurahan Sidoharjo
          </h1>
          <p className="mt-4.5 max-w-[34ch] text-[18px] opacity-90 mx-auto">
            Baca kabar terbaru kelurahan Sidoharjo dari satu tempat.
          </p>
          <div className="mt-3 text-[14px] opacity-75">Jam kerja Senin s.d Jumat<br></br>Pukul 07.30 - 15.00 WIB</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <img src={logoHero} alt="Logo Kelurahan Sidoharjo" className="w-full max-w-62.5 justify-self-end object-contain" />
          <h1 className="text-[16px] text-center font-bold">
            Kelurahan Sidoharjo<br></br>
            <span className="text-[26px]">Kabupaten Lamongan</span>
          </h1>
        </div>
      </div>
      <div className="overflow-hidden bg-tambak/35 py-1 text-white">
        <p className="sr-only">{PESAN_PITA.join(". ")}</p>
        <div
          className="pita-berjalan flex w-max"
          style={{ animationDuration: DURASI_PITA }}
          aria-hidden="true"
        >
          {[0, 1].map((salinan) => (
            <div key={salinan} className="flex shrink-0">
              {Array.from({ length: PENGULANGAN }, (_, i) =>
                PESAN_PITA.map((pesan, j) => (
                  <span
                    key={`${i}-${j}`}
                    className="flex items-center gap-10 pr-10 text-[14px] font-light whitespace-nowrap"
                  >
                    {pesan}
                    <span>|</span>
                  </span>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
