# 📝Sistem Pencatatan Keuangan

## Deskripsi Proyek
Sistem Pencatatan Keuangan adalah aplikasi berbasis web yang dirancang untuk membantu mencatat, mengelola, dan memantau pemasukan serta pengeluaran mereka secara efisien dan terstruktur. Aplikasi ini ditujukan untuk pengguna individu yang ingin memiliki kontrol lebih terhadap kondisi keuangannya.

Proyek ini dikembangkan untuk memenuhi tugas mata kuliah Basis Data.
Fokus utama proyek adalah pada perancangan dan implementasi sistem basis data.

## Fitur Utama
- Menambahkan, melihat, mengedit, dan menghapus transaksi
- Desain database terstruktur dengan normalisasi hingga 3NF

## 🛠️Tech Stack

### Backend
- Python
- Flask
- MySQL

### Frontend
- HTML
- CSS
- Tailwind CSS
- JavaScript

## Library dan Tools Tambahan
- PyMySQL — untuk koneksi antara Python dan MySQL
- jQuery — untuk manipulasi DOM dan AJAX yang lebih mudah
  
## 🚀Setup Lokal
1. Buat dan Aktifkan Virutal Environment
```bash
python -m venv venv
source venv/bin/activate # Linux/macOs
venv\Scripts\activate    # Windows
```

2. Install Dependency
```bash
pip install -r requirements.txt
```

3. Mulai proses build Tailwind CLI
```bash
npx tailwindcss -i ./static/css/input.css -o ./static/dist/output.css --watch
```

4. Jalankan Aplikasi
```bash
flask --app app  run --debug
```
