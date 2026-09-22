const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Tanggal disimpan sebagai ISO (YYYY-MM-DD) supaya bisa diurutkan dan langsung
// dipakai oleh <input type="date">, lalu baru diformat ke bahasa Indonesia
// saat dirender.
export function formatTanggal(iso: string): string {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!cocok) return iso;

  const tahun = cocok[1];
  const bulan = BULAN[Number(cocok[2]) - 1];
  const hari = Number(cocok[3]);
  if (!bulan) return iso;

  return `${hari} ${bulan} ${tahun}`;
}

// Backend mengirim TIMESTAMP yang di-serialisasi jadi ISO UTC. Bagian tanggalnya
// diambil lewat getter waktu lokal, bukan slice(0, 10), karena di WIB (UTC+7)
// pemotongan mentah bisa memundurkan tanggal satu hari.
export function keTanggalInput(iso: string): string {
  const waktu = new Date(iso);
  if (Number.isNaN(waktu.getTime())) return iso.slice(0, 10);

  const bulan = String(waktu.getMonth() + 1).padStart(2, "0");
  const hari = String(waktu.getDate()).padStart(2, "0");
  return `${waktu.getFullYear()}-${bulan}-${hari}`;
}
