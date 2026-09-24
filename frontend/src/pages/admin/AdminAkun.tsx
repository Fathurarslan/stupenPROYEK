import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAdmin } from "../../components/admin/KonteksAdmin";
import {
  daftarSesi,
  gantiEmail,
  gantiPassword,
  logoutSemua,
  type Sesi,
} from "../../lib/auth";
import { notifGagal, notifGagalDari, notifSukses } from "../../lib/notifikasi";

// Aturan password disalin dari backend/src/utils/validasi.ts. Sengaja diperiksa
// juga di sini supaya admin tahu kesalahannya sebelum mengirim, bukan untuk
// menggantikan pemeriksaan server -- yang menentukan tetap server.
const MIN_KARAKTER = 8;
const MAKS_BYTE = 72;

function ukuranByte(teks: string) {
  return new TextEncoder().encode(teks).length;
}

export default function AdminAkun() {
  const admin = useAdmin();

  return (
    <div>
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.1] text-sawah">Akun Admin</h1>
      <p className="mt-1.5 mb-8 max-w-[60ch] text-abu">
        Masuk sebagai <b className="text-tinta">{admin.email}</b>. Ganti password secara berkala, dan
        periksa daftar perangkat di bawah kalau ada yang tidak Anda kenali.
      </p>

      <div className="flex max-w-[640px] flex-col gap-6">
        <FormPassword />
        <FormEmail emailSekarang={admin.email} />
        <DaftarPerangkat />
      </div>
    </div>
  );
}

function Kartu({ judul, keterangan, anak }: { judul: string; keterangan: string; anak: ReactNode }) {
  return (
    <section className="rounded-lg border border-garis bg-white p-5">
      <h2 className="font-heading text-[18px] text-sawah">{judul}</h2>
      <p className="mt-1 mb-4 text-[13px] text-abu">{keterangan}</p>
      {anak}
    </section>
  );
}

function Label({ teks, anak }: { teks: string; anak: ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[13px] font-medium text-tinta">{teks}</span>
      {anak}
    </label>
  );
}

// Dipakai form password dan form email: membuat kolom password terlihat
function CentangTampilkan({
  tampilkan,
  setTampilkan,
}: {
  tampilkan: boolean;
  setTampilkan: (tampilkan: boolean) => void;
}) {
  return (
    <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-[13px] text-tinta">
      <input
        type="checkbox"
        checked={tampilkan}
        onChange={(e) => setTampilkan(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-sawah"
      />
      Tampilkan password
    </label>
  );
}

const KELAS_INPUT = "w-full rounded-lg border border-garis px-3.5 py-2.5 text-[14px]";
const KELAS_TOMBOL =
  "cursor-pointer rounded-md bg-sawah px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-daun disabled:cursor-wait disabled:opacity-60";

function FormPassword() {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [tampilkan, setTampilkan] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);

  const byteBaru = ukuranByte(baru);
  // Satu pengaturan untuk ketiga kolom, supaya password baru dan ulangannya
  // bisa dibandingkan langsung saat keduanya terlihat
  const tipeInput = tampilkan ? "text" : "password";

  const kirim = async (e: FormEvent) => {
    e.preventDefault();

    if (!lama || !baru) {
      notifGagal("Password lama dan password baru wajib diisi.");
      return;
    }
    if (baru.length < MIN_KARAKTER) {
      notifGagal(`Password baru minimal ${MIN_KARAKTER} karakter.`);
      return;
    }
    // Dihitung per byte, bukan per karakter, karena bcrypt di server memotong
    // di 72 byte: satu emoji memakan 4 byte, huruf beraksen 2 byte
    if (byteBaru > MAKS_BYTE) {
      notifGagal(
        `Password baru terlalu panjang (${byteBaru} dari ${MAKS_BYTE} byte). Emoji dan huruf beraksen memakan lebih dari satu byte.`,
      );
      return;
    }
    if (baru !== ulangi) {
      notifGagal("Ulangi password baru belum sama.");
      return;
    }
    if (baru === lama) {
      notifGagal("Password baru masih sama dengan yang lama.");
      return;
    }

    setMenyimpan(true);
    try {
      const dicabut = await gantiPassword(lama, baru);
      setLama("");
      setBaru("");
      setUlangi("");
      // Disembunyikan lagi supaya pengisian berikutnya tidak langsung terlihat
      setTampilkan(false);
      notifSukses(
        dicabut > 0
          ? `Password diganti. ${dicabut} perangkat lain ikut dikeluarkan.`
          : "Password berhasil diganti.",
      );
    } catch (err) {
      notifGagalDari(err, "Gagal mengganti password.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <Kartu
      judul="Ganti Password"
      keterangan="Perangkat lain yang sedang login akan otomatis dikeluarkan. Perangkat ini tetap masuk."
      anak={
        <form onSubmit={(e) => void kirim(e)}>
          <Label
            teks="Password lama"
            anak={
              <input
                type={tipeInput}
                autoComplete="current-password"
                value={lama}
                onChange={(e) => setLama(e.target.value)}
                className={KELAS_INPUT}
              />
            }
          />
          <Label
            teks="Password baru"
            anak={
              <input
                type={tipeInput}
                autoComplete="new-password"
                value={baru}
                onChange={(e) => setBaru(e.target.value)}
                className={KELAS_INPUT}
              />
            }
          />
          <Label
            teks="Ulangi password baru"
            anak={
              <input
                type={tipeInput}
                autoComplete="new-password"
                value={ulangi}
                onChange={(e) => setUlangi(e.target.value)}
                className={KELAS_INPUT}
              />
            }
          />

          <CentangTampilkan tampilkan={tampilkan} setTampilkan={setTampilkan} />

          <p className="mb-4 text-[12px] text-abu">
            Minimal {MIN_KARAKTER} karakter, maksimal {MAKS_BYTE} byte
            {baru !== "" && ` — sekarang ${baru.length} karakter, ${byteBaru} byte`}.
          </p>

          <button type="submit" disabled={menyimpan} className={KELAS_TOMBOL}>
            {menyimpan ? "Menyimpan…" : "Simpan Password"}
          </button>
        </form>
      }
    />
  );
}

function FormEmail({ emailSekarang }: { emailSekarang: string }) {
  const [emailBaru, setEmailBaru] = useState("");
  const [password, setPassword] = useState("");
  const [tampilkan, setTampilkan] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();

    if (!emailBaru.trim() || !password) {
      notifGagal("Email baru dan password wajib diisi.");
      return;
    }
    if (emailBaru.trim().toLowerCase() === emailSekarang.toLowerCase()) {
      notifGagal("Email baru masih sama dengan yang sekarang.");
      return;
    }

    setMenyimpan(true);
    try {
      const hasil = await gantiEmail(emailBaru, password);
      setEmailBaru("");
      setPassword("");
      setTampilkan(false);
      notifSukses(`Email login diganti jadi ${hasil.email}. Pakai email ini untuk login berikutnya.`);
    } catch (err) {
      notifGagalDari(err, "Gagal mengganti email.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <Kartu
      judul="Ganti Email Login"
      keterangan="Email ini yang dipakai untuk masuk. Password diminta sebagai pemastian, bukan diganti."
      anak={
        <form onSubmit={(e) => void kirim(e)}>
          <Label
            teks="Email baru"
            anak={
              <input
                type="email"
                autoComplete="username"
                value={emailBaru}
                onChange={(e) => setEmailBaru(e.target.value)}
                placeholder={emailSekarang}
                className={KELAS_INPUT}
              />
            }
          />
          <Label
            teks="Password (untuk memastikan ini Anda)"
            anak={
              <input
                type={tampilkan ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={KELAS_INPUT}
              />
            }
          />
          <CentangTampilkan tampilkan={tampilkan} setTampilkan={setTampilkan} />
          <button type="submit" disabled={menyimpan} className={KELAS_TOMBOL}>
            {menyimpan ? "Menyimpan…" : "Simpan Email"}
          </button>
        </form>
      }
    />
  );
}

function waktuSingkat(iso: string) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "—";

  const selisihMenit = Math.round((Date.now() - tanggal.getTime()) / 60000);
  if (selisihMenit < 1) return "baru saja";
  if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
  if (selisihMenit < 24 * 60) return `${Math.round(selisihMenit / 60)} jam lalu`;
  return tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// Browser ditebak dari user agent hanya untuk memudahkan mengenali perangkat.
// Teks ini datang dari header yang dikirim client, jadi tidak bisa dipercaya
// sebagai bukti apa pun -- hanya petunjuk.
function tebakBrowser(userAgent: string | null) {
  if (!userAgent) return "Perangkat tidak dikenal";
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Safari/")) return "Safari";
  return "Browser lain";
}

function DaftarPerangkat() {
  const [sesi, setSesi] = useState<Sesi[]>([]);
  const [memuat, setMemuat] = useState(true);

  // Pola yang sama dengan AdminGuard: state diubah di dalam callback promise,
  // bukan langsung di badan efek, dan diabaikan kalau komponennya sudah
  // dilepas sebelum permintaannya selesai.
  useEffect(() => {
    let dibatalkan = false;

    daftarSesi()
      .then((hasil) => {
        if (!dibatalkan) setSesi(hasil);
      })
      .catch((err: unknown) => {
        if (!dibatalkan) notifGagalDari(err, "Gagal memuat daftar perangkat.");
      })
      .finally(() => {
        if (!dibatalkan) setMemuat(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, []);

  const muatUlang = async () => {
    setMemuat(true);
    try {
      setSesi(await daftarSesi());
    } catch (err) {
      notifGagalDari(err, "Gagal memuat daftar perangkat.");
    } finally {
      setMemuat(false);
    }
  };

  const keluarkanSemua = async () => {
    if (
      !window.confirm(
        "Keluarkan semua perangkat termasuk yang ini? Anda akan diminta login ulang.",
      )
    ) {
      return;
    }
    try {
      await logoutSemua();
      // Dimuat ulang penuh supaya AdminGuard memeriksa sesi dari awal dan
      // mengalihkan ke halaman login
      window.location.href = "/login";
    } catch (err) {
      notifGagalDari(err, "Gagal mengeluarkan perangkat.");
    }
  };

  return (
    <Kartu
      judul="Perangkat yang Sedang Login"
      keterangan="Kalau ada perangkat yang tidak Anda kenali, segera ganti password lalu keluarkan semuanya."
      anak={
        <>
          {memuat && <p className="text-[14px] text-abu">Memuat daftar perangkat…</p>}

          {!memuat && sesi.length === 0 && (
            <p className="text-[14px] text-abu">Tidak ada sesi aktif yang tercatat.</p>
          )}

          {!memuat && sesi.length > 0 && (
            <ul className="m-0 mb-4 list-none p-0">
              {sesi.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-garis py-3 first:border-t first:border-t-garis"
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-tinta">
                      {tebakBrowser(s.user_agent)}
                      {s.ini_perangkat_sekarang && (
                        <span className="ml-2 rounded-full bg-sawah px-2 py-0.5 text-[11px] font-medium text-white">
                          perangkat ini
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-abu">
                      {s.ip ?? "IP tidak tercatat"} · terakhir dipakai {waktuSingkat(s.dipakai_terakhir)}
                    </div>
                  </div>
                  <div className="text-[12px] text-abu">masuk {waktuSingkat(s.dibuat_pada)}</div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void muatUlang()}
              disabled={memuat}
              className="cursor-pointer rounded-md border border-garis bg-white px-4 py-2 text-[13px] text-tinta hover:border-sawah disabled:opacity-60"
            >
              Muat ulang
            </button>
            {sesi.length > 1 && (
              <button
                type="button"
                onClick={() => void keluarkanSemua()}
                className="cursor-pointer rounded-md border border-[#b3261e]/30 px-4 py-2 text-[13px] font-medium text-[#b3261e] hover:bg-[#b3261e]/10"
              >
                Keluarkan semua perangkat
              </button>
            )}
          </div>
        </>
      }
    />
  );
}
