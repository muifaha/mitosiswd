# OSIS & MPK Election System

Sistem pemilihan ketua OSIS dan MPK berbasis web dengan database MySQL.

## Fitur

### Untuk Pemilih
- ✅ Login dengan token unik
- ✅ Pilih kandidat OSIS dan MPK
- ✅ Antarmuka modern dan responsif
- ✅ Validasi token sekali pakai

### Untuk Administrator
- ✅ Dashboard statistik real-time
- ✅ Generate dan kelola token voting
- ✅ Kelola kandidat (tambah, edit, hapus)
- ✅ Upload foto kandidat
- ✅ Lihat hasil pemilihan

## Teknologi

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **File Upload**: Multer

## Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Pastikan MySQL sudah terinstall dan berjalan. Kemudian jalankan:

```bash
mysql -u root -p < database/schema.sql
```

Atau buat database manual:
1. Buka MySQL
2. Jalankan perintah di file `database/schema.sql`

### 3. Konfigurasi Environment

Edit file `.env` sesuai konfigurasi MySQL Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pemilu_db
DB_PORT=3306
PORT=3000
```

### 4. Inisialisasi Admin

Jalankan server terlebih dahulu, lalu gunakan endpoint untuk membuat admin pertama:

```bash
curl -X POST http://localhost:3000/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Atau login langsung dengan kredensial default:
- Username: `admin`
- Password: `admin123`

## Menjalankan Aplikasi

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## Akses Aplikasi

- **Halaman Pemilih**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin.html

## Kredensial Default

- **Username**: admin
- **Password**: admin123

⚠️ **Penting**: Ganti password default setelah login pertama kali!

## Struktur Folder

```
pemilu/
├── config/
│   └── database.js          # Konfigurasi database
├── database/
│   └── schema.sql           # Schema database
├── public/
│   ├── css/
│   │   └── styles.css       # Styling
│   ├── js/
│   │   ├── app.js          # Logic pemilih
│   │   └── admin.js        # Logic admin
│   ├── uploads/            # Folder upload foto
│   ├── index.html          # Halaman token
│   ├── voting.html         # Halaman voting
│   └── admin.html          # Dashboard admin
├── routes/
│   ├── auth.js             # Route autentikasi
│   ├── tokens.js           # Route token
│   ├── candidates.js       # Route kandidat
│   └── votes.js            # Route voting
├── .env                    # Konfigurasi environment
├── .env.example            # Template environment
├── package.json
└── server.js               # Entry point
```

## Cara Penggunaan

### Admin

1. Buka `http://localhost:3000/admin.html`
2. Login dengan kredensial admin
3. Generate token untuk pemilih
4. Tambahkan kandidat OSIS dan MPK
5. Pantau statistik pemilihan

### Pemilih

1. Buka `http://localhost:3000`
2. Masukkan token yang diberikan
3. Pilih kandidat OSIS
4. Pilih kandidat MPK
5. Kirim suara

## Troubleshooting

### Database Connection Error
- Pastikan MySQL berjalan
- Cek kredensial di file `.env`
- Pastikan database `pemilu_db` sudah dibuat

### Port Already in Use
- Ubah PORT di file `.env`
- Atau hentikan aplikasi yang menggunakan port 3000

### Upload Error
- Pastikan folder `public/uploads/` ada dan memiliki permission write

## Lisensi

ISC
