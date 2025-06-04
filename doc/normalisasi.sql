-- 1NF: Pecah multi-value menjadi atomik
CREATE TABLE transaksi_1nf (
  id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
  jumlah DECIMAL(20,2) NOT NULL,
  nama_kategori VARCHAR(50) NOT NULL,
  tipe_kategori ENUM('pendapatan','pengeluaran') NOT NULL,
  keterangan_tipe VARCHAR(50) NOT NULL,
  deskripsi VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL
);
INSERT INTO transaksi_1nf (jumlah, nama_kategori, tipe_kategori, keterangan_tipe, deskripsi, tanggal) VALUES
  (5000000.00,'Gaji','pendapatan','Pemasukan uang','Gaji bulan April','2025-04-30'),
  (500000.00,'Saham','pendapatan','Pemasukan uang','Dividen saham','2025-05-01'),
  (20000.00,'Transportasi','pengeluaran','Pengeluaran uang','Beli bensin','2025-05-05');

-- 2NF: Hilangkan partial dependency ke tabel kategori
CREATE TABLE kategori (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL UNIQUE,
  tipe_kategori ENUM('pendapatan','pengeluaran') NOT NULL,
  keterangan_tipe VARCHAR(50) NOT NULL
);
INSERT INTO kategori (nama_kategori, tipe_kategori, keterangan_tipe)
SELECT DISTINCT nama_kategori, tipe_kategori, keterangan_tipe FROM transaksi_1nf;
CREATE TABLE transaksi_2nf (
  id_transaksi INT PRIMARY KEY,
  id_kategori INT NOT NULL,
  jumlah DECIMAL(20,2) NOT NULL,
  deskripsi VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);


-- 3NF: Hilangkan transitive dependency ke tabel tipe_transaksi
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
