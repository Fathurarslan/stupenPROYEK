-- =========================================================
-- Pengerasan integritas data di sisi database
-- =========================================================
-- Sampai sekarang semua aturan data hanya hidup di lapisan aplikasi
-- (teksWajib, bulatTakNegatif, dan kawan-kawan). Selama semua tulisan lewat
-- Express itu cukup, tapi database sendiri tidak tahu apa-apa soal aturan
-- tersebut: SQL yang dijalankan langsung, bug yang melewati validasi, atau
-- skrip impor data akan diterima apa adanya.
--
-- Migrasi ini memindahkan aturan-aturan itu ke database, supaya jadi lapisan
-- terakhir yang tidak bisa dilupakan. Seluruh data yang ada sudah diperiksa
-- lebih dulu dan tidak ada satu pun baris yang melanggar.


-- =========================================================
-- 1. Batas 5 gambar per kabar: dari trigger menjadi constraint
-- =========================================================
-- Trigger cek_maksimal_gambar menghitung dulu (SELECT COUNT), baru menyisipkan.
-- Di antara keduanya ada celah: dua transaksi yang berjalan bersamaan sama-sama
-- melihat "baru ada 4", sama-sama lolos, dan hasilnya jadi 6 baris.
--
-- Dua constraint di bawah membuat pelanggaran itu mustahil tanpa menghitung
-- apa pun: urutan hanya boleh 0..4, dan tiap kabar tidak boleh punya urutan
-- kembar. Unique index dijaga secara atomik oleh PostgreSQL, jadi tidak ada
-- celah yang bisa disalip transaksi lain.
--
-- Efek sampingnya menguntungkan: trigger ini satu-satunya sumber RAISE
-- EXCEPTION (kode P0001) di database, dan pesan P0001 selama ini diteruskan
-- mentah-mentah ke client.

UPDATE kabar_gambar SET urutan = 0 WHERE urutan IS NULL;

ALTER TABLE kabar_gambar
    ALTER COLUMN urutan SET NOT NULL,
    ALTER COLUMN urutan SET DEFAULT 0;

ALTER TABLE kabar_gambar
    DROP CONSTRAINT IF EXISTS kabar_gambar_urutan_check,
    DROP CONSTRAINT IF EXISTS kabar_gambar_urutan_unik;

ALTER TABLE kabar_gambar
    ADD CONSTRAINT kabar_gambar_urutan_check CHECK (urutan BETWEEN 0 AND 4),
    ADD CONSTRAINT kabar_gambar_urutan_unik UNIQUE (kabar_id, urutan);

DROP TRIGGER IF EXISTS trg_maksimal_gambar ON kabar_gambar;
DROP FUNCTION IF EXISTS cek_maksimal_gambar();


-- =========================================================
-- 2. NOT NULL tidak berarti "tidak kosong"
-- =========================================================
-- Bagi PostgreSQL, judul = '' sepenuhnya sah pada kolom NOT NULL. Tanpa
-- pemeriksaan ini, satu baris kosong cukup untuk memunculkan kartu berita
-- melompong di beranda.

ALTER TABLE kabar
    DROP CONSTRAINT IF EXISTS kabar_judul_tidak_kosong,
    DROP CONSTRAINT IF EXISTS kabar_gambar_utama_tidak_kosong,
    DROP CONSTRAINT IF EXISTS kabar_deskripsi_tidak_kosong;

ALTER TABLE kabar
    ADD CONSTRAINT kabar_judul_tidak_kosong CHECK (length(trim(judul)) > 0),
    ADD CONSTRAINT kabar_gambar_utama_tidak_kosong CHECK (length(trim(gambar_utama)) > 0),
    ADD CONSTRAINT kabar_deskripsi_tidak_kosong CHECK (length(trim(deskripsi_lengkap)) > 0);

ALTER TABLE kabar_gambar
    DROP CONSTRAINT IF EXISTS kabar_gambar_url_tidak_kosong;

ALTER TABLE kabar_gambar
    ADD CONSTRAINT kabar_gambar_url_tidak_kosong CHECK (length(trim(gambar_url)) > 0);

ALTER TABLE struktur_jabatan
    DROP CONSTRAINT IF EXISTS struktur_jabatan_tidak_kosong,
    DROP CONSTRAINT IF EXISTS struktur_pejabat_tidak_kosong;

ALTER TABLE struktur_jabatan
    ADD CONSTRAINT struktur_jabatan_tidak_kosong CHECK (length(trim(nama_jabatan)) > 0),
    ADD CONSTRAINT struktur_pejabat_tidak_kosong CHECK (length(trim(nama_pejabat)) > 0);

ALTER TABLE admin
    DROP CONSTRAINT IF EXISTS admin_email_tidak_kosong;

ALTER TABLE admin
    ADD CONSTRAINT admin_email_tidak_kosong CHECK (length(trim(email)) > 0);


-- =========================================================
-- 3. Jumlah penduduk tidak boleh negatif
-- =========================================================
-- Kolom total dihitung PostgreSQL dari kedua kolom ini, jadi angka negatif
-- akan ikut terbawa ke total dan tampil di beranda.

ALTER TABLE penduduk
    DROP CONSTRAINT IF EXISTS penduduk_tak_negatif;

ALTER TABLE penduduk
    ADD CONSTRAINT penduduk_tak_negatif CHECK (laki_laki >= 0 AND perempuan >= 0);


-- =========================================================
-- 4. Aturan "hanya satu baris" yang selama ini cuma janji
-- =========================================================
-- Unique index pada nilai tetap: hanya satu baris yang mungkin ada, karena
-- baris kedua akan punya kunci yang sama persis. Pola yang sama dipakai untuk
-- membatasi struktur_jabatan tingkat 1 di migrasi 002.
--
-- admin: SCHEMA.sql menyebut "hanya 1 admin pengelola", tapi tidak ada yang
-- memaksakannya. Tidak ada endpoint registrasi, jadi belum bisa ditembus dari
-- luar, tapi janji yang tidak dijaga cepat atau lambat dilanggar.
--
-- penduduk: angka penduduk selalu ditimpa, bukan diarsipkan. Tanpa index ini,
-- dua kali POST diam-diam membuat dua baris dan halaman publik hanya
-- menampilkan yang id-nya terbesar, menyisakan data hantu yang tak terlihat.

CREATE UNIQUE INDEX IF NOT EXISTS admin_hanya_satu ON admin ((true));
CREATE UNIQUE INDEX IF NOT EXISTS penduduk_hanya_satu ON penduduk ((true));


-- =========================================================
-- 5. Kolom waktu tidak boleh NULL
-- =========================================================
-- DEFAULT NOW() hanya berlaku kalau kolomnya tidak disebut sama sekali.
-- Mengirim NULL secara eksplisit tetap tersimpan sebagai NULL, dan
-- tanggal_upload yang NULL akan membuat formatTanggal di frontend kebingungan.

ALTER TABLE admin
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE kabar
    ALTER COLUMN tanggal_upload SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE kabar_gambar
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE struktur_jabatan
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE penduduk
    ALTER COLUMN updated_at SET NOT NULL;


-- =========================================================
-- 6. Masa berlaku sesi harus sesudah waktu pembuatannya
-- =========================================================

ALTER TABLE sesi_admin
    DROP CONSTRAINT IF EXISTS sesi_admin_masa_berlaku;

ALTER TABLE sesi_admin
    ADD CONSTRAINT sesi_admin_masa_berlaku CHECK (kedaluwarsa_pada > dibuat_pada);
