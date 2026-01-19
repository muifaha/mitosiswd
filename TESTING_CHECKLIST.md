# Testing Checklist - 3D Hover Effect

## ✅ Server Status
- Server running on: http://localhost:3000
- Database connected successfully

## 📋 Testing Steps

### 1. Database Migration
```bash
mysql -u root -p pemilu_db < database/update_images.sql
```
**Verifikasi:** Cek tabel candidates memiliki kolom `cover_photo` dan `title_photo`

### 2. Admin Login & Upload Kandidat
- [ ] Login ke http://localhost:3000/admin.html
  - Username: `admin`
  - Password: `admin123` (atau sesuai yang di-setup)

- [ ] Upload kandidat OSIS dengan 3 gambar:
  - **Character (photo):** Gambar kandidat PNG transparan
  - **Cover (cover_photo):** Background image
  - **Title (title_photo):** Logo/nama (opsional)

- [ ] Upload kandidat MPK dengan 3 gambar

### 3. Test Voting Page
- [ ] Generate token di admin
- [ ] Buka http://localhost:3000
- [ ] Masukkan token
- [ ] **Test 3D Effect:**
  - Hover mouse pada card kandidat
  - Verifikasi efek:
    - ✓ Card terangkat dengan rotasi 3D
    - ✓ Background blur
    - ✓ Character muncul dari bawah
    - ✓ Title terangkat ke atas
    - ✓ Shadow lebih dalam
  
- [ ] Klik card untuk select
- [ ] Verifikasi checkmark muncul
- [ ] Lanjut ke MPK
- [ ] Submit vote

### 4. Test Responsiveness
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

### 5. Test Fallback
- [ ] Upload kandidat tanpa cover_photo → harus fallback ke photo
- [ ] Upload kandidat tanpa title_photo → hanya tampil text nama
- [ ] Upload kandidat tanpa semua gambar → default avatar

## 🐛 Known Issues to Check

1. **File upload size:** Max 10MB per file
2. **Image format:** JPEG, JPG, PNG, GIF, WEBP
3. **Browser compatibility:** Chrome, Firefox, Edge (modern)
4. **Mobile hover:** Touch untuk select, tidak ada hover effect

## 📸 Rekomendasi Gambar untuk Testing

### Character Image (photo):
- Ukuran: 400x600px
- Format: PNG transparan
- Contoh: Foto kandidat full body

### Cover Image (cover_photo):
- Ukuran: 500x750px
- Format: JPG/PNG
- Contoh: Background gradient atau pattern

### Title Image (title_photo):
- Ukuran: 400x100px
- Format: PNG transparan
- Contoh: Nama dalam bentuk logo

## ✅ Success Criteria

- [x] Server berjalan tanpa error
- [ ] Database migration berhasil
- [ ] Admin dapat upload 3 gambar
- [ ] 3D hover effect berfungsi
- [ ] Voting flow lengkap berjalan
- [ ] Responsive di semua device
- [ ] Fallback image bekerja

## 🔧 Troubleshooting

### Server tidak start:
- Cek `routes/candidates.js` ada
- Run `npm install`

### Upload gagal:
- Cek folder `public/uploads/` writable
- Cek file size < 10MB

### 3D effect tidak muncul:
- Cek browser modern (Chrome/Firefox)
- Disable extension yang block CSS
- Cek console untuk error

### Gambar tidak tampil:
- Cek path di database benar
- Cek file ada di `public/uploads/`
- Cek permission folder
