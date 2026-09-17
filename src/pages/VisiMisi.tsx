export default function VisiMisi() {
  return (
    <main className="wrap py-18">
      <h1 className="font-heading mb-7 text-[clamp(28px,4vw,40px)] leading-[1.1] text-sawah">Visi &amp; Misi</h1>
      <div className="max-w-[65ch]">
        <h2 className="mb-2.5 text-[22px] text-sawah">Visi</h2>
        <p className="font-heading mb-6 text-[26px] leading-[1.25] text-sawah">
          Sidoharjo yang tertib, sejahtera, dan guyub dalam pelayanan.
        </p>
        <h2 className="mb-2.5 text-[22px] text-sawah">Misi</h2>
        <ol className="m-0 list-decimal pl-5 text-abu">
          <li className="mb-2">Memberikan pelayanan administrasi yang cepat dan terbuka.</li>
          <li className="mb-2">Mendorong tumbuhnya usaha warga dan hasil pertanian lokal.</li>
          <li className="mb-2">Menjaga kebersihan lingkungan dan saluran irigasi.</li>
          <li className="mb-2">Menguatkan gotong royong antar RT dan RW.</li>
        </ol>
      </div>
    </main>
  );
}
