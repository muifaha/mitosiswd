# Panduan Implementasi 3D Hover Effect

## Perubahan yang Dilakukan

### 1. Database Schema
Ditambahkan 2 kolom baru pada tabel `candidates`:
- `cover_photo` - Untuk gambar background/cover
- `title_photo` - Untuk gambar title/nama kandidat

**File:** `database/update_images.sql`
```sql
ALTER TABLE candidates
ADD COLUMN cover_photo VARCHAR(255) AFTER photo,
ADD COLUMN title_photo VARCHAR(255) AFTER cover_photo;
```

**Cara menjalankan:**
```bash
mysql -u root -p pemilu_db < database/update_images.sql
```

### 2. Backend Routes
Updated `routes/candidates.js` untuk handle multiple file uploads:
- Menggunakan `upload.fields()` untuk 3 file: `photo`, `cover_photo`, `title_photo`
- File size limit dinaikkan menjadi 10MB
- Support format: JPEG, JPG, PNG, GIF, WEBP

### 3. Admin Interface
**File:** `public/admin.html`
- Ditambahkan 3 input file terpisah:
  - **Foto Character** - Gambar karakter kandidat (akan muncul saat hover)
  - **Foto Cover** - Gambar background card
  - **Foto Title** - Gambar title/nama (opsional)
- Preview untuk setiap gambar

**File:** `public/js/admin.js`
- Function `previewImage(event, previewId)` untuk preview multiple images
- FormData mengirim 3 file sekaligus

### 4. Voting Page dengan 3D Effect
**File:** `public/voting.html`

**Struktur Card:**
```html
<div class="candidate-card">
  <div class="wrapper">
    <img src="cover_photo" class="cover-image">
  </div>
  <img src="title_photo" class="title-image">
  <img src="photo" class="character-image">
  <div class="candidate-info">
    <h3>Nama</h3>
    <p>Visi</p>
  </div>
</div>
```

**Efek 3D:**
- **Normal state:** Card dengan cover image
- **Hover state:**
  - Card terangkat dengan rotasi 3D (`rotateX(25deg)`)
  - Cover image menjadi blur
  - Character image muncul dari bawah
  - Title image terangkat ke atas
  - Gradient overlay muncul

**CSS Variables:**
```css
--card-height: 500px;
--card-width: calc(var(--card-height) / 1.5);
```

## Cara Menggunakan

### 1. Setup Database
```bash
# Jalankan migration
mysql -u root -p pemilu_db < database/update_images.sql
```

### 2. Upload Kandidat
1. Login ke admin dashboard
2. Pilih tab "Kandidat"
3. Upload 3 gambar:
   - **Character:** Gambar kandidat (PNG dengan background transparan lebih baik)
   - **Cover:** Gambar background (landscape, min 400x600px)
   - **Title:** Logo/nama kandidat (PNG transparan, opsional)
4. Isi nama, visi, misi
5. Submit

### 3. Rekomendasi Gambar

**Character Image (photo):**
- Format: PNG dengan background transparan
- Ukuran: 400x600px atau lebih
- Posisi: Full body atau 3/4 body
- Contoh: Foto kandidat yang sudah di-remove background

**Cover Image (cover_photo):**
- Format: JPG/PNG
- Ukuran: 500x750px atau lebih
- Style: Background menarik, bisa gradient, pattern, atau foto
- Contoh: Background dengan warna sekolah

**Title Image (title_photo):**
- Format: PNG dengan background transparan
- Ukuran: 400x100px
- Konten: Nama kandidat dalam bentuk logo/text
- Opsional: Bisa dikosongkan, nama akan ditampilkan sebagai text

### 4. Fallback
Jika gambar tidak diupload:
- `cover_photo` → fallback ke `photo` → default avatar
- `title_photo` → tidak ditampilkan, hanya text nama
- `photo` → default avatar

## Testing

### Test 3D Effect:
1. Buka halaman voting
2. Hover mouse pada card kandidat
3. Perhatikan:
   - Card terangkat dengan efek 3D
   - Background menjadi blur
   - Character muncul dari bawah
   - Title terangkat
   - Shadow lebih dalam

### Test Responsiveness:
- Desktop: 3 kolom (jika ada banyak kandidat)
- Tablet: 2 kolom
- Mobile: 1 kolom, card lebih kecil (400px height)

## Troubleshooting

### Gambar tidak muncul
- Cek folder `public/uploads/` ada dan writable
- Cek file size tidak melebihi 10MB
- Cek format file (harus image)

### 3D Effect tidak bekerja
- Cek browser support (Chrome, Firefox, Edge modern)
- Disable jika ada extension yang block CSS transforms
- Cek console untuk error JavaScript

### Card terlalu besar/kecil
Edit CSS variable di `voting.html`:
```css
:root {
  --card-height: 500px; /* Ubah sesuai kebutuhan */
}
```

## Perbandingan Sebelum & Sesudah

### Sebelum:
- 1 gambar per kandidat
- Card flat, tidak ada efek hover
- Tampilan sederhana

### Sesudah:
- 3 gambar per kandidat (character, cover, title)
- 3D hover effect dengan perspective
- Character muncul saat hover
- Lebih interaktif dan menarik

## File yang Diubah

1. `database/schema.sql` - Schema update
2. `database/update_images.sql` - Migration script
3. `routes/candidates.js` - Multiple file upload
4. `public/admin.html` - 3 file inputs
5. `public/js/admin.js` - Multiple file handling
6. `public/voting.html` - 3D card implementation

## Referensi
Design terinspirasi dari: `reference/3d-hover-effect-movie-card-main`
