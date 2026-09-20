export default function Kontak() {
  return (
    <section className="bg-sawah py-18 text-white" id="kontak">
      <div className="wrap">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] leading-[1.1] text-white">Datang atau hubungi kami</h2>
            <p className="mt-1.5 max-w-[52ch] text-white/75">Bawa berkas lengkap agar pelayanan lebih cepat.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 max-[860px]:grid-cols-1">
          <div>
            <h3 className="mb-2 text-[18px] text-padi">Alamat kantor</h3>
            <p className="m-0 opacity-90">Jl. Contoh No. 1, Kelurahan Sidoharjo, Kecamatan Lamongan, Kabupaten Lamongan, Jawa Timur</p>
          </div>
          <div>
            <h3 className="mb-2 text-[18px] text-padi">Jam pelayanan</h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr><td className="py-1">Senin sampai Kamis</td><td className="py-1 text-right">07.30 s/d 15.30</td></tr>
                <tr><td className="py-1">Jumat</td><td className="py-1 text-right">07.30 s/d 11.00</td></tr>
                <tr><td className="py-1">Sabtu, Minggu</td><td className="py-1 text-right">Tutup</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-[18px] text-padi">Kontak</h3>
            <p className="m-0 opacity-90">Telepon: (0322) 000000</p>
            <p className="m-0 opacity-90">Email: kel.sidoharjo@contoh.go.id</p>
          </div>
        </div>
      </div>
    </section>
  );
}
