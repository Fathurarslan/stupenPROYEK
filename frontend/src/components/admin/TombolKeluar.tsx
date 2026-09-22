import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hapusTokenLokal, logout, logoutSemua } from "../../lib/auth";

// Tombol keluar untuk sidebar admin.
// Alurnya: klik "Keluar" -> panel konfirmasi -> pilih keluar dari perangkat ini
// saja atau dari semua perangkat. Token lokal hanya dihapus setelah server
// benar-benar mencabut sesinya, jadi tidak ada kondisi "kelihatan sudah keluar
// tapi tokennya masih bisa dipakai orang lain".
type Tahap = "diam" | "konfirmasi" | "memproses";

export default function TombolKeluar() {
  const navigate = useNavigate();
  const [tahap, setTahap] = useState<Tahap>("diam");
  const [error, setError] = useState("");

  const keSalamanLogin = () => navigate("/login", { replace: true });

  const jalankan = async (semuaPerangkat: boolean) => {
    setTahap("memproses");
    setError("");
    try {
      if (semuaPerangkat) {
        await logoutSemua();
      } else {
        await logout();
      }
      keSalamanLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal keluar");
      setTahap("konfirmasi");
    }
  };

  // Jalan terakhir kalau server tidak bisa dihubungi. Jujur disebut bahwa
  // sesi di server mungkin masih hidup sampai kedaluwarsa.
  const keluarPaksa = () => {
    hapusTokenLokal();
    keSalamanLogin();
  };

  if (tahap === "diam") {
    return (
      <button
        type="button"
        onClick={() => setTahap("konfirmasi")}
        className="mt-1 w-full cursor-pointer rounded-md border-0 bg-padi px-3 py-2.5 text-left text-[14px] font-semibold text-sawah hover:bg-padigelap hover:text-white"
      >
        Keluar
      </button>
    );
  }

  const sedangProses = tahap === "memproses";

  return (
    <div className="mt-1 rounded-md bg-white/10 p-3">
      <p className="text-[13px] font-semibold text-white">Keluar dari akun admin?</p>

      {error && (
        <div className="mt-2 rounded border border-padi/50 bg-padi/15 p-2">
          <p className="text-[12px] text-padi">{error}</p>
          <button
            type="button"
            onClick={keluarPaksa}
            className="mt-1.5 cursor-pointer rounded border-0 bg-transparent p-0 text-[12px] font-semibold text-white underline"
          >
            Hapus token di perangkat ini saja
          </button>
        </div>
      )}

      <div className="mt-2.5 flex flex-col gap-1.5">
        <button
          type="button"
          disabled={sedangProses}
          onClick={() => void jalankan(false)}
          className="w-full cursor-pointer rounded-md border-0 bg-padi px-3 py-2 text-[13px] font-semibold text-sawah hover:bg-padigelap hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {sedangProses ? "Memproses…" : "Keluar dari perangkat ini"}
        </button>

        <button
          type="button"
          disabled={sedangProses}
          onClick={() => void jalankan(true)}
          className="w-full cursor-pointer rounded-md border border-white/40 bg-transparent px-3 py-2 text-[13px] font-medium text-white hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
        >
          Keluar dari semua perangkat
        </button>

        <button
          type="button"
          disabled={sedangProses}
          onClick={() => {
            setTahap("diam");
            setError("");
          }}
          className="w-full cursor-pointer rounded-md border-0 bg-transparent px-3 py-1.5 text-[13px] text-white/70 hover:text-white disabled:opacity-60"
        >
          Batal
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-white/60">
        Keluar dari semua perangkat mencabut seluruh sesi yang masih aktif, termasuk di HP atau
        komputer lain.
      </p>
    </div>
  );
}
