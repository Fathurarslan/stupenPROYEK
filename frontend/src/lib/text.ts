// Inisial untuk avatar cadangan saat belum ada foto profil.
export function ambilInisial(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "?";
  return kata
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
}
