# Sistem-Pencatatan-Keuangan

## Deskripsi Proyek
Sistem Pencatatan Keuangan adalah aplikasi berbasis web yang dirancang untuk membantu mencatat, mengelola, dan memantau pemasukan serta pengeluaran mereka secara efisien dan terstruktur. Aplikasi ini ditujukan untuk pengguna individu yang ingin memiliki kontrol lebih terhadap kondisi keuangannya.

Proyek ini dikembangkan untuk memenuhi tugas mata kuliah Basis Data.
Fokus utama proyek adalah pada perancangan dan implementasi sistem basis data.


## Fitur Utama
- **Tambah, lihat, edit, dan hapus data transaksi**
- **Database dirancang dengan normalisasi hingga 3NF**


## Tech Stack

### Backend
- <a href="https://www.python.org/about/gettingstarted/" target="_blank">Python</a>
- <a href="https://flask.palletsprojects.com/en/stable/" target="_blank">Flask</a>
- <a href="https://www.w3schools.com/html/" target="_blank">MySQL</a>

### Frontend
- <a href="https://www.w3schools.com/html/" target="_blank">HTML</a>
- <a href="https://www.w3schools.com/css/" target="_blank">CSS</a>
- <a href="https://tailwindcss.com/docs/installation/tailwind-cli" target="_blank">Tailwind</a>
- <a href="https://www.w3schools.com/js/DEFAULT.asp" target="_blank">JavaScript</a>

## Library dan Tools Tambahan
- Flask-MySQL Connector

- # Setup Lokal
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


