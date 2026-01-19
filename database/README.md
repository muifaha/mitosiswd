# Database Setup - Sistem Pemilu OSIS & MPK

## 📋 Daftar Isi
- [Informasi Database](#informasi-database)
- [Cara Install](#cara-install)
- [Struktur Tabel](#struktur-tabel)
- [Default Credentials](#default-credentials)
- [Query Berguna](#query-berguna)

## 🗄️ Informasi Database

- **Nama Database:** `pemiluwd`
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`
- **Engine:** `InnoDB`

## 🚀 Cara Install

### Opsi 1: Menggunakan MySQL Command Line

```bash
# Login ke MySQL
mysql -u root -p

# Import file SQL
source c:/Users/Administrator/Documents/pemilu/database/complete_schema.sql

# Atau jika sudah di dalam MySQL
USE pemiluwd;
```

### Opsi 2: Menggunakan phpMyAdmin

1. Buka phpMyAdmin
2. Klik tab "Import"
3. Pilih file `complete_schema.sql`
4. Klik "Go"

### Opsi 3: Menggunakan MySQL Workbench

1. Buka MySQL Workbench
2. File → Run SQL Script
3. Pilih file `complete_schema.sql`
4. Klik "Run"

## 📊 Struktur Tabel

### 1. **admins**
Menyimpan data admin untuk login ke panel admin.

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR(50) | Username admin (unique) |
| password | VARCHAR(255) | Password (bcrypt hashed) |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### 2. **candidates**
Menyimpan data kandidat OSIS dan MPK.

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(100) | Nama kandidat |
| type | ENUM('osis', 'mpk') | Jenis kandidat |
| photo | VARCHAR(255) | Path foto character |
| cover_photo | VARCHAR(255) | Path foto cover |
| vision | TEXT | Visi kandidat |
| mission | TEXT | Misi kandidat |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### 3. **tokens**
Menyimpan token voting (6 karakter alphanumeric).

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| token_code | VARCHAR(10) | Kode token (unique) |
| is_used | BOOLEAN | Status penggunaan |
| used_at | TIMESTAMP | Waktu digunakan |
| created_at | TIMESTAMP | Waktu dibuat |

**Format Token:** 6 karakter (A-Z, 2-9, tanpa I, 1, O, 0)  
**Contoh:** `A3K7M2`, `P9R4H6`, `X5T8N3`

### 4. **votes**
Menyimpan hasil voting.

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| token_id | INT | Foreign key ke tokens |
| candidate_id | INT | Foreign key ke candidates |
| voted_at | TIMESTAMP | Waktu voting |

### 5. **settings**
Menyimpan konfigurasi sistem.

| Field | Type | Description |
|-------|------|-------------|
| setting_key | VARCHAR(50) | Primary key |
| setting_value | TEXT | Nilai setting |
| updated_at | TIMESTAMP | Waktu diupdate |

**Default Settings:**
- `voting_mode`: `manual` (atau `auto`)

## 🔐 Default Credentials

**Admin Panel:**
- Username: `admin`
- Password: `admin123`

⚠️ **PENTING:** Segera ganti password default setelah instalasi!

## 📝 Query Berguna

### Lihat Kandidat dengan Jumlah Suara

```sql
SELECT 
  c.id,
  c.name,
  c.type,
  COUNT(v.id) as vote_count
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id
GROUP BY c.id, c.name, c.type
ORDER BY c.type, vote_count DESC;
```

### Statistik Token

```sql
SELECT 
  COUNT(*) as total_tokens,
  SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_tokens,
  SUM(CASE WHEN is_used = 0 THEN 1 ELSE 0 END) as remaining_tokens
FROM tokens;
```

### Statistik Voting per Tipe

```sql
SELECT 
  c.type,
  c.name,
  COUNT(v.id) as votes
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id
GROUP BY c.type, c.name
ORDER BY c.type, votes DESC;
```

### Reset Semua Voting (HATI-HATI!)

```sql
-- Hapus semua vote
DELETE FROM votes;

-- Reset semua token
UPDATE tokens SET is_used = FALSE, used_at = NULL;
```

### Hapus Semua Token

```sql
DELETE FROM tokens;
```

### Hapus Semua Kandidat

```sql
DELETE FROM candidates;
```

## 🔧 Maintenance

### Backup Database

```bash
mysqldump -u root -p pemiluwd > backup_pemiluwd_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u root -p pemiluwd < backup_pemiluwd_20260119.sql
```

## 📞 Troubleshooting

### Error: Database already exists
Jika database sudah ada, Anda bisa:
1. Drop database lama: `DROP DATABASE pemiluwd;`
2. Atau gunakan database yang sudah ada

### Error: Access denied
Pastikan user MySQL Anda memiliki privilege yang cukup:
```sql
GRANT ALL PRIVILEGES ON pemiluwd.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Foreign key constraint fails
Pastikan urutan penghapusan data benar:
1. Hapus votes terlebih dahulu
2. Baru hapus tokens atau candidates

## 📄 File SQL Lainnya

- `create_admin.sql` - Membuat admin account saja
- `create_settings.sql` - Membuat tabel settings saja
- `update_images.sql` - Migration untuk update struktur foto
- `complete_schema.sql` - **File lengkap (RECOMMENDED)**

## ✅ Checklist Instalasi

- [ ] Database `pemiluwd` sudah dibuat
- [ ] Semua tabel sudah dibuat (5 tabel)
- [ ] Admin default sudah ada
- [ ] Setting default sudah ada
- [ ] Koneksi database di `.env` sudah benar
- [ ] Server bisa connect ke database
- [ ] Login admin berhasil

## 🎯 Next Steps

Setelah database setup:
1. Update file `.env` dengan credentials database
2. Jalankan server: `npm start`
3. Login ke admin panel: http://localhost:3000/admin.html
4. Tambahkan kandidat OSIS dan MPK
5. Generate token voting
6. Test voting di: http://localhost:3000

---

**Dibuat untuk:** Sistem Pemilu OSIS & MPK  
**Versi:** 1.0  
**Tanggal:** 2026-01-19
