// Pembuat id sederhana untuk data yang dikelola di sisi klien (belum ada backend).
export function buatId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
