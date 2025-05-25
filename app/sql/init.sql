CREATE DATABASE IF NOT EXISTS sistem_pencatatan_keuangan;
USE sistem_pencatatan_keuangan;

-- Tabel tipe transaksi income atau expense
CREATE TABLE IF NOT EXISTS transaction_types (
    type_id ENUM('income', 'expense') PRIMARY KEY,
    description VARCHAR(50) NOT NULL
);

INSERT INTO transaction_types (type_id, description) VALUES 
    ('income', 'Pendapatan'),
    ('expense', 'Pengeluaran');

-- Tabel categories
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type_id ENUM('income', 'expense') NOT NULL,
    FOREIGN KEY (type_id) REFERENCES transaction_types(type_id)
);

-- Kategori default
INSERT IGNORE INTO categories (name, type_id) VALUES
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

-- Tabel transactions
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type_id ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    FOREIGN KEY (type_id) REFERENCES transaction_types(type_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Tabel financial_summary tetap sama
CREATE TABLE IF NOT EXISTS financial_summary (
    id INT PRIMARY KEY DEFAULT 1,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expense DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) GENERATED ALWAYS AS (total_income - total_expense) STORED
);