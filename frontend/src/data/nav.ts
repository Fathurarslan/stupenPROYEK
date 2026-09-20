import type { NavItem } from "../types/kelurahan";

export const NAV: NavItem[] = [
  { label: "Beranda", path: "/" },
  {
    label: "Profil Kelurahan",
    children: [
      { label: "Profil Kelurahan", path: "/profil" },
      { label: "Kondisi Geografis", path: "/kondisiGeografis" },
      { label: "Visi Misi", path: "/visi-misi" },
    ],
  },
  { label: "Struktur Jabatan", path: "/struktur" },
  { label: "Pelayanan", path: "/pelayanan" },
];
