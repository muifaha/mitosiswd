# Git Usage Guide - Pemilu OSIS & MPK

## Git Repository Setup ✅

Git repository telah berhasil diinisialisasi untuk project Pemilu OSIS & MPK.

### Konfigurasi
- **User Name**: Admin Pemilu
- **User Email**: admin@pemilu.local
- **Initial Commit**: ✅ Completed

### File yang Di-ignore
Berikut file/folder yang tidak akan di-track oleh Git (lihat `.gitignore`):
- `node_modules/` - Dependencies
- `.env` - Environment variables
- `public/uploads/*` - User uploaded files
- `*.log` - Log files
- IDE files (.vscode/, .idea/)
- OS files (.DS_Store, Thumbs.db)

---

## Perintah Git yang Berguna

### 1. Cek Status
```bash
git status
```
Melihat file yang berubah dan belum di-commit.

### 2. Menambahkan File
```bash
# Tambah semua file yang berubah
git add .

# Tambah file tertentu
git add path/to/file.js
```

### 3. Commit Perubahan
```bash
git commit -m "Deskripsi perubahan"
```

### 4. Melihat History
```bash
# Lihat semua commit
git log

# Lihat commit singkat
git log --oneline

# Lihat 5 commit terakhir
git log --oneline -5
```

### 5. Melihat Perubahan
```bash
# Lihat perubahan yang belum di-stage
git diff

# Lihat perubahan yang sudah di-stage
git diff --staged
```

### 6. Undo Changes
```bash
# Buang perubahan file yang belum di-stage
git checkout -- filename

# Unstage file (batalkan git add)
git reset HEAD filename

# Kembali ke commit sebelumnya (HATI-HATI!)
git reset --hard HEAD~1
```

### 7. Branching
```bash
# Buat branch baru
git branch feature-name

# Pindah ke branch
git checkout feature-name

# Buat dan pindah ke branch baru
git checkout -b feature-name

# Lihat semua branch
git branch

# Merge branch
git checkout master
git merge feature-name
```

---

## Workflow yang Disarankan

### Setiap Kali Selesai Fitur/Perbaikan:

1. **Cek status**
   ```bash
   git status
   ```

2. **Tambahkan file yang berubah**
   ```bash
   git add .
   ```

3. **Commit dengan pesan yang jelas**
   ```bash
   git commit -m "Add: fitur voting otomatis"
   # atau
   git commit -m "Fix: bug pada admin login"
   # atau
   git commit -m "Update: tampilan card kandidat"
   ```

### Format Commit Message yang Baik:
- `Add: ...` - Menambah fitur baru
- `Fix: ...` - Memperbaiki bug
- `Update: ...` - Mengupdate fitur yang sudah ada
- `Remove: ...` - Menghapus fitur/file
- `Refactor: ...` - Refactoring code tanpa mengubah fungsi

---

## Backup & Remote Repository

### Menambahkan Remote (GitHub/GitLab)

1. **Buat repository di GitHub/GitLab**

2. **Tambahkan remote**
   ```bash
   git remote add origin https://github.com/username/pemilu-osis-mpk.git
   ```

3. **Push ke remote**
   ```bash
   git push -u origin master
   ```

4. **Pull dari remote**
   ```bash
   git pull origin master
   ```

---

## Tips Penting

1. **Commit Sering**: Lebih baik commit kecil-kecil daripada satu commit besar
2. **Pesan Jelas**: Tulis commit message yang deskriptif
3. **Jangan Commit File Sensitif**: `.env` sudah di-ignore, jangan pernah commit!
4. **Backup Rutin**: Push ke remote repository secara rutin
5. **Branch untuk Fitur Baru**: Gunakan branch terpisah untuk fitur besar

---

## Troubleshooting

### Salah Commit?
```bash
# Undo commit terakhir tapi keep changes
git reset --soft HEAD~1

# Undo commit dan buang changes (HATI-HATI!)
git reset --hard HEAD~1
```

### Lupa Tambah File di Commit Terakhir?
```bash
git add forgotten-file.js
git commit --amend --no-edit
```

### Conflict saat Merge?
1. Edit file yang conflict
2. Hapus marker `<<<<<<<`, `=======`, `>>>>>>>`
3. `git add` file yang sudah diperbaiki
4. `git commit`

---

## Status Saat Ini

✅ Git repository initialized
✅ Initial commit created
✅ .gitignore configured
✅ All project files committed

**Next Steps:**
- Commit setiap kali selesai fitur/perbaikan
- Consider setup remote repository untuk backup
- Use branching untuk fitur besar
