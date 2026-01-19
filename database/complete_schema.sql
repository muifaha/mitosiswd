-- ============================================
-- SISTEM PEMILU OSIS & MPK
-- Complete Database Schema
-- Database Name: pemiluwd
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pemiluwd;
USE pemiluwd;

-- ============================================
-- TABLE: admins
-- Menyimpan data admin untuk login
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account
-- Username: admin
-- Password: admin123
DELETE FROM admins WHERE username = 'admin';
INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- ============================================
-- TABLE: candidates
-- Menyimpan data kandidat OSIS dan MPK
-- ============================================
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('osis', 'mpk') NOT NULL,
  photo VARCHAR(255) DEFAULT NULL COMMENT 'Character/profile photo',
  cover_photo VARCHAR(255) DEFAULT NULL COMMENT 'Background/cover photo',
  vision TEXT DEFAULT NULL,
  mission TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: tokens
-- Menyimpan token voting (6 karakter alphanumeric)
-- ============================================
CREATE TABLE IF NOT EXISTS tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_code VARCHAR(10) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_code (token_code),
  INDEX idx_is_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: votes
-- Menyimpan hasil voting
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_id INT NOT NULL,
  candidate_id INT NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  INDEX idx_token_id (token_id),
  INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: settings
-- Menyimpan konfigurasi sistem
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) 
VALUES ('voting_mode', 'manual')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- ============================================
-- SAMPLE DATA (Optional - Uncomment to use)
-- ============================================

-- Sample OSIS Candidates
-- INSERT INTO candidates (name, type, vision, mission) VALUES
-- ('Kandidat OSIS 1', 'osis', 'Membangun OSIS yang inklusif dan inovatif', 'Meningkatkan partisipasi siswa dalam kegiatan sekolah'),
-- ('Kandidat OSIS 2', 'osis', 'OSIS yang transparan dan akuntabel', 'Membuat program kerja yang bermanfaat untuk semua siswa');

-- Sample MPK Candidates
-- INSERT INTO candidates (name, type, vision, mission) VALUES
-- ('Kandidat MPK 1', 'mpk', 'MPK yang aspiratif dan responsif', 'Menjembatani komunikasi antara siswa dan pihak sekolah'),
-- ('Kandidat MPK 2', 'mpk', 'MPK yang profesional dan terpercaya', 'Mengawasi kinerja OSIS secara objektif');

-- Sample Tokens (10 tokens)
-- INSERT INTO tokens (token_code) VALUES
-- ('A3K7M2'), ('P9R4H6'), ('X5T8N3'), ('M2Q7R9'), ('K4W8D5'),
-- ('T6Y3L9'), ('R7N2P4'), ('H8M5Q3'), ('W9K6T2'), ('D3L7X8');

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all candidates with vote count
-- SELECT 
--   c.id,
--   c.name,
--   c.type,
--   COUNT(v.id) as vote_count
-- FROM candidates c
-- LEFT JOIN votes v ON c.id = v.candidate_id
-- GROUP BY c.id, c.name, c.type
-- ORDER BY c.type, vote_count DESC;

-- View token usage statistics
-- SELECT 
--   COUNT(*) as total_tokens,
--   SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_tokens,
--   SUM(CASE WHEN is_used = 0 THEN 1 ELSE 0 END) as remaining_tokens
-- FROM tokens;

-- View voting statistics by type
-- SELECT 
--   c.type,
--   c.name,
--   COUNT(v.id) as votes
-- FROM candidates c
-- LEFT JOIN votes v ON c.id = v.candidate_id
-- GROUP BY c.type, c.name
-- ORDER BY c.type, votes DESC;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Reset all votes (CAUTION: This will delete all voting data)
-- DELETE FROM votes;
-- UPDATE tokens SET is_used = FALSE, used_at = NULL;

-- Delete all tokens
-- DELETE FROM tokens;

-- Delete all candidates
-- DELETE FROM candidates;

-- ============================================
-- DATABASE INFORMATION
-- ============================================
-- Database: pemiluwd
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- Engine: InnoDB
-- 
-- Tables:
-- 1. admins - Admin accounts
-- 2. candidates - OSIS & MPK candidates
-- 3. tokens - Voting tokens (6-char alphanumeric)
-- 4. votes - Voting records
-- 5. settings - System configuration
-- 
-- Default Admin:
-- Username: admin
-- Password: admin123
-- 
-- Token Format: 6 characters (A-Z, 2-9, excluding I,1,O,0)
-- Example: A3K7M2, P9R4H6, X5T8N3
-- ============================================
