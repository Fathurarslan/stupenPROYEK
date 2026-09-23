-- =========================================================
-- Tingkat pada struktur jabatan
-- =========================================================
-- Struktur jabatan dibagi menjadi 3 tingkat:
--   tingkat 1 = pucuk pimpinan (Kepala Kelurahan), hanya boleh satu orang
--   tingkat 2 = boleh lebih dari satu orang
--   tingkat 3 = boleh lebih dari satu orang
-- Angka tingkat hanya dipakai untuk mengurutkan kartu di halaman publik,
-- tulisan "Tingkat 1/2/3" sendiri tidak pernah ditampilkan ke pengunjung.

ALTER TABLE struktur_jabatan
    ADD COLUMN IF NOT EXISTS tingkat SMALLINT NOT NULL DEFAULT 2;

ALTER TABLE struktur_jabatan
    DROP CONSTRAINT IF EXISTS struktur_jabatan_tingkat_check;

ALTER TABLE struktur_jabatan
    ADD CONSTRAINT struktur_jabatan_tingkat_check CHECK (tingkat IN (1, 2, 3));

-- Batas "hanya satu Kepala Kelurahan" dijaga di database, bukan hanya di API,
-- supaya tidak bisa bocor lewat dua request yang masuk bersamaan.
CREATE UNIQUE INDEX IF NOT EXISTS idx_struktur_jabatan_tingkat_satu
    ON struktur_jabatan (tingkat) WHERE tingkat = 1;

CREATE INDEX IF NOT EXISTS idx_struktur_jabatan_tingkat
    ON struktur_jabatan (tingkat);
