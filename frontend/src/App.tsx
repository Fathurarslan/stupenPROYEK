import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import Landing from "./pages/Landing";
import KabarDetail from "./pages/KabarDetail";
import Profil from "./pages/Profil";
import Geografis from "./pages/Geografis";
import Struktur from "./pages/Struktur";
import VisiMisi from "./pages/VisiMisi";
import Pelayanan from "./pages/Pelayanan";
import Login from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBerita from "./pages/admin/AdminBerita";
import TambahBerita from "./pages/admin/TambahBerita";
import AdminStruktur from "./pages/admin/AdminStruktur";
import AdminPenduduk from "./pages/admin/AdminPenduduk";
import AdminAkun from "./pages/admin/AdminAkun";

export default function App() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isLoginPage = path === "/login";
  const isAdminPage = path.startsWith("/admin");
  const sembunyikanChrome = isLoginPage || isAdminPage;

  return (
    <div className="bg-kabut font-sans leading-[1.6] text-tinta">
      {!sembunyikanChrome && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/kabar/:id" element={<KabarDetail />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/kondisiGeografis" element={<Geografis />} />
        <Route path="/struktur" element={<Struktur />} />
        <Route path="/visi-misi" element={<VisiMisi />} />
        <Route path="/pelayanan" element={<Pelayanan />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="kabar" element={<AdminBerita />} />
          <Route path="kabar/tambah" element={<TambahBerita />} />
          <Route path="kabar/edit/:id" element={<TambahBerita />} />
          <Route path="struktur" element={<AdminStruktur />} />
          <Route path="penduduk" element={<AdminPenduduk />} />
          <Route path="akun" element={<AdminAkun />} />
        </Route>
      </Routes>
      {!sembunyikanChrome && <Footer />}
    </div>
  );
}
