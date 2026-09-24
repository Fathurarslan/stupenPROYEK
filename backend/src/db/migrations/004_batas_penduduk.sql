-- =========================================================
-- Batas atas jumlah penduduk
-- =========================================================
-- Migrasi 003 sudah melarang angka negatif, tapi batas atasnya masih batas
-- INTEGER (2.147.483.647). Angka sebesar itu mustahil untuk satu kelurahan
-- dan akan tampil apa adanya di beranda. Selain itu kolom total dihitung dari
-- laki_laki + perempuan dengan tipe INTEGER, jadi dua angka besar bisa
-- membuatnya meluap.
--
-- Sejuta per kolom sudah jauh di atas kebutuhan. Angka ini harus sama dengan
-- MAKS_PENDUDUK di src/routes/penduduk.ts.

ALTER TABLE penduduk
    DROP CONSTRAINT IF EXISTS penduduk_batas_atas;

ALTER TABLE penduduk
    ADD CONSTRAINT penduduk_batas_atas CHECK (laki_laki <= 1000000 AND perempuan <= 1000000);
