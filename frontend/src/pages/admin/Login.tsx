import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { login } from "../../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [error, setError] = useState("");
  const [mengirim, setMengirim] = useState(false);

  // Halaman yang tadi ingin dibuka sebelum dialihkan ke login (diisi AdminGuard)
  const tujuan = (location.state as { dari?: string } | null)?.dari ?? "/admin";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !sandi.trim()) {
      setError("Email dan sandi wajib diisi.");
      return;
    }

    setMengirim(true);
    setError("");
    try {
      await login(email, sandi);
      navigate(tujuan, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
      setMengirim(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sawah">
      <div className="flex flex-row h-150 shadow-lg">
        <div className="w-75 h-full bg-abu rounded-l-xl flex flex-col items-center">
          <img src={logo} className="w-30"></img>
          <h1 className="font-bold text-white text-2xl">Kelurahan Sidoharjo</h1>
          <p className="text-sm px-9 text-white">
            Jl. Pahlawan, Kauman, Kel. Sidoharjo, Kec. Lamongan, Kab. Lamongan,
            Jawa Timur<br></br>(62217)
          </p>
        </div>
        <div className="w-120 h-full bg-garis rounded-r-xl">
          <div className="flex justify-between p-7">
            <h1 className="text-3xl font-semibold text-tinta">
              Memiliki akses admin?<br></br>Silahkan login di bawah
            </h1>
            <Link to="/">
              <p className="flex bg-sawah w-7 h-7 text-white justify-center items-center rounded-4xl hover:cursor-pointer">
                X
              </p>
            </Link>
          </div>
          <form className="flex flex-col items-center" onSubmit={(e) => void submit(e)}>
            <div className="flex flex-col font-medium">
              <label className="text-xl">Email</label>
              <input
                type="email"
                value={email}
                autoComplete="username"
                disabled={mengirim}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg bg-white w-105 py-3 px-5 mb-3 border border-abu disabled:opacity-60"
              ></input>
            </div>
            <div className="flex flex-col font-medium">
              <label className="text-xl">Sandi</label>
              <input
                type="password"
                value={sandi}
                autoComplete="current-password"
                disabled={mengirim}
                onChange={(e) => setSandi(e.target.value)}
                className="rounded-lg bg-white w-105 py-3 px-5 border border-abu disabled:opacity-60"
              ></input>
            </div>
            {error && <p className="w-105 mt-3 text-sm text-[#b3261e]">{error}</p>}
            <div className="w-105 mt-3">
              <button
                type="submit"
                disabled={mengirim}
                className="bg-tambak w-25 py-2 rounded-lg text-white hover:bg-blue-800 hover:cursor-pointer disabled:cursor-wait disabled:opacity-60"
              >
                {mengirim ? "Masuk…" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
