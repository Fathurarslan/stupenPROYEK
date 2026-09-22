-- =========================================================
-- Tabel sesi admin: dipakai agar logout benar-benar mencabut token
-- =========================================================
-- Tanpa tabel ini, JWT yang sudah diterbitkan tetap sah sampai kedaluwarsa,
-- jadi "logout" hanya menghapus token di browser. Dengan tabel ini setiap
-- token punya jti (id sesi) yang dicek ke database pada tiap request.

CREATE TABLE IF NOT EXISTS sesi_admin (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin(id) ON DELETE CASCADE,
    jti UUID NOT NULL UNIQUE,
    user_agent VARCHAR(255),
    ip VARCHAR(45),
    dibuat_pada TIMESTAMP NOT NULL DEFAULT NOW(),
    dipakai_terakhir TIMESTAMP NOT NULL DEFAULT NOW(),
    kedaluwarsa_pada TIMESTAMP NOT NULL,
    dicabut_pada TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sesi_admin_admin_id ON sesi_admin(admin_id);

-- Index sebagian: hanya sesi yang masih aktif yang perlu dicari cepat
CREATE INDEX IF NOT EXISTS idx_sesi_admin_aktif
    ON sesi_admin(jti) WHERE dicabut_pada IS NULL;
