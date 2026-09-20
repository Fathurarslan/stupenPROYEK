import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Login() {
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
          <form className="flex flex-col items-center">
            <div className="flex flex-col font-medium">
              <label className="text-xl">Email</label>
              <input
                type="email"
                className="rounded-lg bg-white w-105 py-3 px-5 mb-3 border border-abu"
              ></input>
            </div>
            <div className="flex flex-col font-medium">
              <label className="text-xl">Sandi</label>
              <input
                type="password"
                className="rounded-lg bg-white w-105 py-3 px-5 border border-abu"
              ></input>
            </div>
            <div className="w-105 mt-3">
              <button className="bg-tambak w-25 py-2 rounded-lg text-white hover:bg-blue-800 hover:cursor-pointer">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
