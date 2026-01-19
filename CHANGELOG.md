# Changelog - Perbaikan Bug

## [2026-01-14] - Bug Fix: Token Terpakai Setelah Vote Pertama

### Masalah
- Token ditandai sebagai "used" setelah memilih kandidat OSIS
- User tidak bisa melanjutkan untuk memilih kandidat MPK
- Error: "Token already used"

### Penyebab
Backend langsung menandai token sebagai "used" setelah vote pertama, padahal seharusnya token baru ditandai "used" setelah user memilih KEDUA kandidat (OSIS dan MPK).

### Solusi
Diubah logika di `routes/votes.js`:

**Sebelum:**
```javascript
// Insert vote
await db.query('INSERT INTO votes ...');

// Mark token as used (SALAH - langsung ditandai used)
await db.query('UPDATE tokens SET is_used = TRUE ...');
```

**Sesudah:**
```javascript
// Insert vote
await db.query('INSERT INTO votes ...');

// Cek berapa tipe kandidat yang sudah dipilih
const [voteCount] = await db.query(`
    SELECT COUNT(DISTINCT c.type) as types_voted
    FROM votes v
    JOIN candidates c ON v.candidate_id = c.id
    WHERE v.token_id = ?
`, [tokenId]);

// Hanya tandai token sebagai used jika sudah vote untuk KEDUA tipe
if (voteCount[0].types_voted >= 2) {
    await db.query('UPDATE tokens SET is_used = TRUE ...');
}
```

### Fitur Tambahan
- Mencegah voting ganda untuk tipe yang sama (tidak bisa pilih 2 kandidat OSIS)
- Response API sekarang mengembalikan `votesComplete: true/false` untuk tracking

### Testing
1. Generate token baru di admin
2. Login dengan token
3. Pilih kandidat OSIS → Berhasil, token masih aktif
4. Pilih kandidat MPK → Berhasil, token baru ditandai "used"
5. Coba login lagi dengan token yang sama → Error "Token already used" ✓

### File yang Diubah
- `routes/votes.js` - Update logika submit vote

### Cara Update
Jika server sedang berjalan, restart server:
```bash
# Tekan Ctrl+C untuk stop server
# Lalu jalankan lagi
npm start
```

Token yang sudah ditandai "used" sebelumnya tidak bisa digunakan lagi. Generate token baru untuk testing.
