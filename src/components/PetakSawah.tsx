// Ilustrasi petak sawah dan tambak, ciri khas bentang alam Lamongan
export default function PetakSawah() {
  const warna = ["#3f7d4a", "#4e8f55", "#2f6a3c", "#e2b93b", "#2f7f86", "#5a9a5f", "#d4a82e"];
  const petak = [
    [0, 0, 150, 90], [158, 0, 90, 130], [256, 0, 144, 70],
    [0, 98, 100, 110], [108, 98, 42, 110], [256, 78, 70, 130], [334, 78, 66, 60],
    [158, 138, 90, 70], [334, 146, 66, 62],
    [0, 216, 180, 84], [188, 216, 110, 84], [306, 216, 94, 84],
  ];
  return (
    <svg
      className="block h-auto w-full max-[860px]:max-w-[420px]"
      viewBox="0 0 400 300"
      role="img"
      aria-label="Ilustrasi petak sawah dan tambak"
    >
      {petak.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill={warna[i % warna.length]} />
      ))}
      <path d="M0 212 C 120 200, 250 226, 400 210" stroke="#f3f6f1" strokeWidth="4" fill="none" opacity=".7" />
    </svg>
  );
}
