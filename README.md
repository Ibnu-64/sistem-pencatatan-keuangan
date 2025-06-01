# 📝 Sistem Pencatatan Keuangan
<div align="center">
  <img src="https://github.com/user-attachments/assets/7340d832-b09e-4fc2-8f00-0a6bcf086eb8" alt="Dashboard Screenshot" width="600"/>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.10-blue?logo=python" />
  <img src="https://img.shields.io/badge/Flask-3.1.0-green?logo=flask" />
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-38bdf8?logo=tailwindcss" />
</div>

---

## ✨ Deskripsi Proyek

**Sistem Pencatatan Keuangan** adalah aplikasi web untuk mencatat, mengelola, dan memantau pemasukan serta pengeluaran secara efisien dan terstruktur. Aplikasi ini dirancang untuk pengguna individu yang ingin mengontrol keuangan pribadi dengan mudah, lengkap dengan tampilan antarmuka yang modern dan responsif.

> Proyek ini dikembangkan sebagai bagian dari tugas mata kuliah **Basis Data**, dengan fokus pada perancangan dan implementasi sistem basis data yang terstruktur dan ternormalisasi.

---

## 🚩 Fitur Utama

* ✅ Tambah, lihat, edit, dan hapus transaksi keuangan
* ✅ Dashboard ringkasan keuangan real-time
* ✅ Visualisasi grafik pemasukan & pengeluaran (Chart.js)
* ✅ Database ternormalisasi hingga 3NF
* ✅ Antarmuka modern & responsif (Tailwind CSS)

---

## 🛠️ Tech Stack

### Backend

* ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python\&logoColor=white)
* ![Flask](https://img.shields.io/badge/-Flask-000?logo=flask)
* ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql\&logoColor=white)

### Frontend

* ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5\&logoColor=white)
* ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3\&logoColor=white)
* ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38BDF8?logo=tailwindcss\&logoColor=white)
* ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript\&logoColor=black)

### Library & Tools

* **PyMySQL** — untuk koneksi Python ke MySQL
* **Chart.js** — untuk visualisasi data keuangan

---

## 🚀 Setup Lokal

### 1. Clone Repository

```bash
git clone https://github.com/IbnuSabilGitHub/sistem-pencatatan-keuangan.git
cd sistem-pencatatan-keuangan
```

### 2. Buat & Aktifkan Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Konfigurasi Database

* Pastikan MySQL atau XAMPP sudah terpasang dan berjalan.
* Buat database baru, lalu jalankan perintah berikut:

```bash
mysql -u <user> -p < ./app/sql/init.sql
mysql -u <user> -p < ./app/sql/trigger.sql
```

> [!NOTE]
> Pastikan `mysql` sudah tersedia di PATH environment.

### 5. Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i ./app/static/css/input.css -o ./app/static/dist/output.css --watch
```
> [!NOTE]
> Pastikan sudah menginstal [Node.js](https://nodejs.org/) dan [npm](https://www.npmjs.com/).

### 6. Jalankan Aplikasi

```bash
flask --app app run --debug
```

Aplikasi akan tersedia di [http://localhost:5000](http://localhost:5000)

---

## 📄 Catatan Tambahan

* Jika terjadi error dependensi, pastikan seluruh library telah terinstall dengan benar.
* Untuk pengembangan lokal, disarankan menggunakan mode debug.

---

<div align="center">
  <strong>Happy coding & kelola keuanganmu dengan mudah! 🚀</strong>
</div>

