import type { LayananItem } from "../types/kelurahan";

export const LAYANAN: LayananItem[] = [
  {
    nama: "Surat Keterangan Domisili",
    waktu: "1 hari kerja",
    syarat: ["Fotokopi KTP", "Fotokopi Kartu Keluarga", "Surat pengantar RT/RW"],
  },
  {
    nama: "Surat Keterangan Tidak Mampu",
    waktu: "1 hari kerja",
    syarat: ["Fotokopi KTP", "Fotokopi Kartu Keluarga", "Surat pengantar RT/RW", "Foto rumah tampak depan"],
  },
  {
    nama: "Surat Pengantar SKCK",
    waktu: "1 hari kerja",
    syarat: ["Fotokopi KTP", "Fotokopi Kartu Keluarga", "Pas foto 4x6 (2 lembar)", "Surat pengantar RT/RW"],
  },
  {
    nama: "Surat Keterangan Usaha",
    waktu: "2 hari kerja",
    syarat: ["Fotokopi KTP", "Surat pengantar RT/RW", "Foto tempat usaha"],
  },
  {
    nama: "Pengantar Akta Kelahiran",
    waktu: "1 hari kerja",
    syarat: ["Surat keterangan lahir dari bidan/rumah sakit", "Fotokopi KTP kedua orang tua", "Fotokopi buku nikah", "Fotokopi Kartu Keluarga"],
  },
  {
    nama: "Surat Keterangan Kematian",
    waktu: "1 hari kerja",
    syarat: ["Fotokopi KTP almarhum", "Fotokopi Kartu Keluarga", "Surat pengantar RT/RW", "KTP pelapor"],
  },
];
