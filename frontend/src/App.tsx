import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Profil from "./pages/Profil";
import Struktur from "./pages/Struktur";
import VisiMisi from "./pages/VisiMisi";
import Pelayanan from "./pages/Pelayanan";
import Login from "../src/pages/admin/Login";

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname.toLowerCase() === "/login";

  return (
    <div className="bg-kabut font-sans leading-[1.6] text-tinta">
      {!isLoginPage && <Header />}
      <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/struktur" element={<Struktur />} />
                <Route path="/visi-misi" element={<VisiMisi />} />
                <Route path="/pelayanan" element={<Pelayanan />} />
          <Route path="/login" element={<Login />} />
      </Routes>
      {!isLoginPage && <Footer />}
    </div>
  );
}
