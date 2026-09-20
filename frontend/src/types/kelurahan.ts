export interface NavChild {
  label: string;
  path: string;
}

export interface NavItem {
  label: string;
  path?: string;
  children?: NavChild[];
}

export interface LayananItem {
  nama: string;
  waktu: string;
  syarat: string[];
}

export interface KabarItem {
  jenis: string;
  tanggal: string;
  judul: string;
  ringkas: string;
}

export interface PerangkatItem {
  jabatan: string;
  nama: string;
}

export interface StatItem {
  label: string;
  nilai: number;
}
