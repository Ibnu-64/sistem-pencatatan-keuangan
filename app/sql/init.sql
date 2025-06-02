CREATE DATABASE IF NOT EXISTS sistem_pencatatan_keuangan;
USE sistem_pencatatan_keuangan;

-- Tabel tipe_transaksi
CREATE TABLE IF NOT EXISTS tipe_transaksi (
    tipe_id ENUM('pendapatan', 'pengeluaran') PRIMARY KEY,
    keterangan VARCHAR(50) NOT NULL
);

INSERT INTO tipe_transaksi (tipe_id, keterangan) VALUES 
    ('pendapatan', 'Pemasukan uang'),
    ('pengeluaran', 'Pengeluaran uang');

-- Tabel kategori
CREATE TABLE IF NOT EXISTS kategori (
    id_kategori INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(50) NOT NULL UNIQUE,
    tipe_id ENUM('pendapatan', 'pengeluaran') NOT NULL,
    FOREIGN KEY (tipe_id) REFERENCES tipe_transaksi(tipe_id)
);

-- Kategori default
INSERT IGNORE INTO kategori (nama, tipe_id) VALUES
    ('gaji', 'pendapatan'),
    ('bonus', 'pendapatan'),
    ('investasi', 'pendapatan'),
    ('tunai', 'pendapatan'),
    ('penjualan', 'pendapatan'),
    ('setoran', 'pendapatan'),
    ('lainnya', 'pendapatan'),
    ('makanan', 'pengeluaran'),
    ('minuman', 'pengeluaran'),
    ('kesehatan', 'pengeluaran'),
    ('transportasi', 'pengeluaran'),
    ('hiburan', 'pengeluaran'),
    ('game', 'pengeluaran'),
    ('peliharaan', 'pengeluaran'),
    ('hobi', 'pengeluaran'),
    ('belanja', 'pengeluaran'),
    ('lainnya', 'pengeluaran');

-- Tabel transaksi
CREATE TABLE IF NOT EXISTS transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jumlah DECIMAL(15,2) NOT NULL,
    id_kategori INT NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);

-- Tabel ringkasan_keuangan
CREATE TABLE IF NOT EXISTS ringkasan_keuangan (
    id INT PRIMARY KEY DEFAULT 1,
    total_pendapatan DECIMAL(15,2) DEFAULT 0,
    total_pengeluaran DECIMAL(15,2) DEFAULT 0,
    saldo DECIMAL(15,2) GENERATED ALWAYS AS (total_pendapatan - total_pengeluaran) STORED
);