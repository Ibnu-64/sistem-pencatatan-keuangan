USE sistem_pencatatan_keuangan;

-- Perbaharui data ringkasan_transaksi saat ada transaksi baru
DELIMITER $$
CREATE TRIGGER trg_add
AFTER INSERT ON transaksi
FOR EACH ROW
BEGIN
    IF NEW.id_tipe = 'income' THEN
        UPDATE ringkasan_transaksi
        SET total_pendapatan = total_pendapatan + NEW.jumlah
        WHERE id = 1;
    ELSE
        UPDATE ringkasan_transaksi
        SET total_pengeluaran = total_pengeluaran + NEW.jumlah
        WHERE id = 1;
    END IF;
END $$
DELIMITER ;

-- Perbaharui data ringkasan_transaksi saat ada transaksi di hapus
DELIMITER $$
CREATE TRIGGER trg_delete
AFTER DELETE ON transaksi
FOR EACH ROW
BEGIN
    IF OLD.id_tipe = 'income' THEN
        UPDATE ringkasan_transaksi
        SET total_pendapatan = total_pendapatan - OLD.jumlah
        WHERE id = 1;
    ELSE
        UPDATE ringkasan_transaksi
        SET total_pengeluaran = total_pengeluaran - OLD.jumlah
        WHERE id = 1;
    END IF;
END $$
DELIMITER ;

-- Perbaharui data ringkasan_transaksi saat ada transaksi di update
DELIMITER $$
CREATE TRIGGER trg_update
AFTER UPDATE ON transaksi
FOR EACH ROW
BEGIN
    -- Jika tipe tidak berubah
    IF NEW.id_tipe = OLD.id_tipe THEN
        IF NEW.id_tipe = 'income' THEN
            UPDATE ringkasan_transaksi
            SET total_pendapatan = total_pendapatan + NEW.jumlah - OLD.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_transaksi
            SET total_pengeluaran = total_pengeluaran + NEW.jumlah - OLD.jumlah
            WHERE id = 1;
        END IF;
    
    -- Jika tipe berubah
    ELSE
        -- Kurangi dari tipe lama
        IF OLD.id_tipe = 'income' THEN
            UPDATE ringkasan_transaksi
            SET total_pendapatan = total_pendapatan - OLD.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_transaksi
            SET total_pengeluaran = total_pengeluaran - OLD.jumlah
            WHERE id = 1;
        END IF;
        
        -- Tambah ke tipe baru
        IF NEW.id_tipe = 'income' THEN
            UPDATE ringkasan_transaksi
            SET total_pendapatan = total_pendapatan + NEW.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_transaksi
            SET total_pengeluaran = total_pengeluaran + NEW.jumlah
            WHERE id = 1;
        END IF;
    END IF;
END $$
DELIMITER ;

-- Tambahkan data awal ke ringkasan_transaksi
INSERT INTO ringkasan_transaksi (id, total_pendapatan, total_pengeluaran) VALUES (1, 0, 0)
ON DUPLICATE KEY UPDATE id = id;
