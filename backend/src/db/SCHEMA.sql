-- =========================================================
-- SCHEMA DATABASE WEBSITE KELURAHAN SIDOHARJO
-- PostgreSQL
-- =========================================================
--
-- PENTING: file ini hanya BENTUK AWAL database, bukan bentuk akhirnya.
-- Bentuk yang benar = file ini + semua file di folder migrations/, yang
-- dijalankan lewat "npm run db:migrate" (lihat DEPLOY.md). Menjalankan file
-- ini saja akan menghasilkan database yang tidak cocok dengan kode.
--
-- Perubahan yang TIDAK tercermin di bawah:
--   001_sesi_admin.sql      tabel sesi_admin (pencabutan token saat logout)
--   002_tingkat_struktur.sql
--                           kolom struktur_jabatan.tingkat (1/2/3, NOT NULL),
--                           tingkat 1 hanya boleh satu baris
--   003_integritas_data.sql trigger trg_maksimal_gambar DIHAPUS, diganti
--                           constraint urutan 0..4 dan UNIQUE (kabar_id, urutan);
--                           CHECK tidak kosong untuk kolom teks wajib;
--                           CHECK penduduk laki_laki/perempuan >= 0;
--                           admin dan penduduk hanya boleh satu baris;
--                           kolom waktu NOT NULL
--   004_batas_penduduk.sql  CHECK penduduk laki_laki/perempuan <= 1.000.000

-- =========================================================
-- 1. TABEL ADMIN (Login) - hanya 1 admin pengelola
-- =========================================================
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Catatan: password_hash diisi dari hasil bcrypt.hash() di Node.js, JANGAN simpan plain text
-- Karena hanya 1 admin, cukup insert satu baris saat setup awal, tidak perlu fitur registrasi

-- Query login
-- SELECT id, email, password_hash FROM admin WHERE email = $1;

-- Update password
-- UPDATE admin SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email;

-- Update email
-- UPDATE admin SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email;


-- =========================================================
-- 2. TABEL KABAR (berita / pengumuman jadi satu)
-- =========================================================
CREATE TABLE kabar (
    id SERIAL PRIMARY KEY,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('berita', 'pengumuman')),
    judul VARCHAR(200) NOT NULL,
    tanggal_upload TIMESTAMP DEFAULT NOW(),
    gambar_utama VARCHAR(255) NOT NULL,
    ringkasan VARCHAR(500),
    deskripsi_lengkap TEXT NOT NULL,
    admin_id INTEGER REFERENCES admin(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kabar_jenis ON kabar(jenis);
CREATE INDEX idx_kabar_tanggal ON kabar(tanggal_upload DESC);

-- Tabel terpisah untuk gambar_lain (relasi satu kabar bisa punya banyak gambar tambahan)
CREATE TABLE kabar_gambar (
    id SERIAL PRIMARY KEY,
    kabar_id INTEGER NOT NULL REFERENCES kabar(id) ON DELETE CASCADE,
    gambar_url VARCHAR(255) NOT NULL,
    urutan INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kabar_gambar_kabar_id ON kabar_gambar(kabar_id);

-- Trigger pembatas jumlah gambar tambahan per kabar (contoh maksimal 5, sesuaikan angkanya kalau perlu)
CREATE OR REPLACE FUNCTION cek_maksimal_gambar()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM kabar_gambar WHERE kabar_id = NEW.kabar_id) >= 5 THEN
        RAISE EXCEPTION 'Maksimal 5 gambar tambahan per kabar';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maksimal_gambar
BEFORE INSERT ON kabar_gambar
FOR EACH ROW EXECUTE FUNCTION cek_maksimal_gambar();

-- CREATE kabar
-- INSERT INTO kabar (jenis, judul, gambar_utama, ringkasan, deskripsi_lengkap, admin_id)
-- VALUES ($1, $2, $3, $4, $5, $6)
-- RETURNING *;

-- CREATE gambar tambahan (panggil berulang kali sesuai jumlah gambar yang diupload, maksimal dicek otomatis oleh trigger)
-- INSERT INTO kabar_gambar (kabar_id, gambar_url, urutan)
-- VALUES ($1, $2, $3)
-- RETURNING *;

-- READ semua kabar beserta gambar tambahannya (satu query pakai json_agg)
-- SELECT k.*,
--   COALESCE(json_agg(kg.gambar_url ORDER BY kg.urutan) FILTER (WHERE kg.id IS NOT NULL), '[]') AS gambar_lain
-- FROM kabar k
-- LEFT JOIN kabar_gambar kg ON kg.kabar_id = k.id
-- GROUP BY k.id
-- ORDER BY k.tanggal_upload DESC;

-- READ berdasarkan jenis (berita saja atau pengumuman saja)
-- SELECT * FROM kabar WHERE jenis = $1 ORDER BY tanggal_upload DESC;

-- READ satu kabar lengkap beserta gambar tambahan
-- SELECT k.*,
--   COALESCE(json_agg(kg.gambar_url ORDER BY kg.urutan) FILTER (WHERE kg.id IS NOT NULL), '[]') AS gambar_lain
-- FROM kabar k
-- LEFT JOIN kabar_gambar kg ON kg.kabar_id = k.id
-- WHERE k.id = $1
-- GROUP BY k.id;

-- UPDATE kabar
-- UPDATE kabar
-- SET jenis = $1, judul = $2, gambar_utama = $3, ringkasan = $4, deskripsi_lengkap = $5, updated_at = NOW()
-- WHERE id = $6
-- RETURNING *;

-- DELETE kabar (gambar tambahan ikut terhapus otomatis karena ON DELETE CASCADE)
-- DELETE FROM kabar WHERE id = $1;

-- DELETE satu gambar tambahan saja (tanpa hapus kabar)
-- DELETE FROM kabar_gambar WHERE id = $1;


-- =========================================================
-- 3. TABEL STRUKTUR JABATAN
-- =========================================================
CREATE TABLE struktur_jabatan (
    id SERIAL PRIMARY KEY,
    foto VARCHAR(255),
    nama_jabatan VARCHAR(100) NOT NULL,
    nama_pejabat VARCHAR(100) NOT NULL,
    nip VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE
-- INSERT INTO struktur_jabatan (foto, nama_jabatan, nama_pejabat, nip)
-- VALUES ($1, $2, $3, $4)
-- RETURNING *;

-- READ semua
-- SELECT * FROM struktur_jabatan ORDER BY id ASC;

-- READ satu
-- SELECT * FROM struktur_jabatan WHERE id = $1;

-- UPDATE
-- UPDATE struktur_jabatan
-- SET foto = $1, nama_jabatan = $2, nama_pejabat = $3, nip = $4, updated_at = NOW()
-- WHERE id = $5
-- RETURNING *;

-- DELETE
-- DELETE FROM struktur_jabatan WHERE id = $1;


-- =========================================================
-- 4. TABEL PENDUDUK
-- =========================================================
CREATE TABLE penduduk (
    id SERIAL PRIMARY KEY,
    laki_laki INTEGER NOT NULL DEFAULT 0,
    perempuan INTEGER NOT NULL DEFAULT 0,
    total INTEGER GENERATED ALWAYS AS (laki_laki + perempuan) STORED,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Catatan: kolom total dihitung otomatis oleh PostgreSQL, tidak perlu diisi manual saat insert/update

-- CREATE
-- INSERT INTO penduduk (laki_laki, perempuan)
-- VALUES ($1, $2)
-- RETURNING *;

-- READ semua
-- SELECT * FROM penduduk ORDER BY id DESC;

-- READ data terbaru saja (buat ditampilkan di beranda)
-- SELECT * FROM penduduk ORDER BY id DESC LIMIT 1;

-- UPDATE
-- UPDATE penduduk
-- SET laki_laki = $1, perempuan = $2, updated_at = NOW()
-- WHERE id = $3
-- RETURNING *;

-- DELETE
-- DELETE FROM penduduk WHERE id = $1;


-- =========================================================
-- TRIGGER: auto update kolom updated_at di setiap tabel
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_updated_at
BEFORE UPDATE ON admin
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_kabar_updated_at
BEFORE UPDATE ON kabar
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_struktur_updated_at
BEFORE UPDATE ON struktur_jabatan
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_penduduk_updated_at
BEFORE UPDATE ON penduduk
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
