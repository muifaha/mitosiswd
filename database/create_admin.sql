-- SOLUSI CEPAT: Copy dan jalankan query ini di MySQL
-- Ini akan membuat admin account dengan password yang sudah di-hash dengan benar

USE pemilu_db;

-- Hapus admin lama jika ada (untuk menghindari duplicate)
DELETE FROM admins WHERE username = 'admin';

-- Buat admin baru dengan password yang benar
-- Username: admin
-- Password: admin123
-- Hash ini dibuat dengan bcrypt rounds 10 dan VALID
INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Selesai! Sekarang Anda bisa login dengan:
-- Username: admin
-- Password: admin123
