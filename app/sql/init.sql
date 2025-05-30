CREATE DATABASE IF NOT EXISTS sistem_pencatatan_keuangan;
USE sistem_pencatatan_keuangan;

-- Tabel tipe transaksi income atau expense
CREATE TABLE IF NOT EXISTS transaksi_tipe (
    id_tipe ENUM('income', 'expense') PRIMARY KEY,
    description VARCHAR(50) NOT NULL
);

INSERT INTO transaksi_tipe (id_tipe, description) VALUES 
    ('income', 'Pendapatan'),
    ('expense', 'Pengeluaran');

-- Tabel kategori
CREATE TABLE IF NOT EXISTS kategori (
    kategori INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(50) NOT NULL UNIQUE,
    id_tipe ENUM('income', 'expense') NOT NULL,
    FOREIGN KEY (id_tipe) REFERENCES transaksi_tipe(id_tipe)
);

-- Kategori default
INSERT IGNORE INTO kategori (nama, id_tipe) VALUES
    ('gaji', 'income'),
    ('bonus', 'income'),
    ('investasi', 'income'),
    ('tunai', 'income'),
    ('penjualan', 'income'),
    ('setoran', 'income'),
    ('lainnya', 'income'),
    ('makanan', 'expense'),
    ('minuman', 'expense'),
    ('kesehatan', 'expense'),
    ('transportasi', 'expense'),
    ('hiburan', 'expense'),
    ('game', 'expense'),
    ('peliharaan', 'expense'),
    ('hobi', 'expense'),
    ('belanja', 'expense');

-- Tabel transaksi
CREATE TABLE IF NOT EXISTS transaksi (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    id_tipe ENUM('income', 'expense') NOT NULL,
    amout DECIMAL(15,2) NOT NULL,
    kategori INT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    FOREIGN KEY (id_tipe) REFERENCES transaksi_tipe(id_tipe),
    FOREIGN KEY (kategori) REFERENCES kategori(kategori)
);

-- Tabel ringkasan_transaksi tetap sama
CREATE TABLE IF NOT EXISTS ringkasan_transaksi (
    id INT PRIMARY KEY DEFAULT 1,
    total_pendapatan DECIMAL(15,2) DEFAULT 0,
    total_pengeluaran DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) GENERATED ALWAYS AS (total_pendapatan - total_pengeluaran) STORED
);