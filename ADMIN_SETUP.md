# Cara Membuat Admin Account

Karena Node.js belum terinstall, berikut adalah cara alternatif untuk membuat admin account:

## Metode 1: Menggunakan Online Bcrypt Generator (TERCEPAT)

1. **Buka website bcrypt generator:**
   - https://bcrypt-generator.com/
   - Atau: https://www.devglan.com/online-tools/bcrypt-hash-generator

2. **Generate hash:**
   - Masukkan password: `admin123`
   - Pilih Cost Factor/Rounds: `10`
   - Klik "Generate Hash"
   - Copy hash yang dihasilkan (contoh: `$2b$10$abc123...`)

3. **Jalankan query di MySQL:**
   ```sql
   USE pemilu_db;
   
   INSERT INTO admins (username, password) VALUES 
   ('admin', 'PASTE_HASH_DISINI');
   ```
   
   Ganti `PASTE_HASH_DISINI` dengan hash yang Anda copy.

4. **Selesai!** Sekarang Anda bisa login dengan:
   - Username: `admin`
   - Password: `admin123`

---

## Metode 2: Menggunakan API Endpoint (Setelah Server Berjalan)

Jika server sudah berjalan (`npm start`), Anda bisa menggunakan API endpoint:

### Menggunakan Browser:

1. Install Node.js terlebih dahulu
2. Jalankan `npm install` dan `npm start`
3. Buka browser, tekan F12 untuk Console
4. Paste dan jalankan kode ini:

```javascript
fetch('http://localhost:3000/api/auth/init-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(d => console.log(d));
```

### Menggunakan PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/init-admin" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
```

---

## Metode 3: Menggunakan Script Node.js (Setelah Install Node.js)

1. Install Node.js dari https://nodejs.org/
2. Buka terminal di folder project
3. Jalankan:
   ```bash
   npm install
   npm run init-admin
   ```

---

## Verifikasi

Setelah membuat admin account, coba login di:
- http://localhost:3000/admin.html
- Username: `admin`
- Password: `admin123`

Jika berhasil, Anda akan masuk ke dashboard admin.

---

## Troubleshooting

### "Invalid credentials" saat login
- Pastikan hash password benar (gunakan bcrypt rounds 10)
- Cek di MySQL apakah admin sudah ada: `SELECT * FROM admins;`
- Pastikan username dan password sesuai

### "Cannot connect to database"
- Pastikan MySQL berjalan
- Cek kredensial di file `.env`
- Pastikan database `pemilu_db` sudah dibuat

### "Admin already exists"
- Hapus admin lama: `DELETE FROM admins WHERE username = 'admin';`
- Lalu buat lagi dengan salah satu metode di atas
