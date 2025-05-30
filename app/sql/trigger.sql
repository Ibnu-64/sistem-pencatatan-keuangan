USE sistem_pencatatan_keuangan;

-- Perbaharui data ringkasan_keuangan saat ada transaksi baru
DELIMITER $$
CREATE TRIGGER trg_add
AFTER INSERT ON transaksi
FOR EACH ROW
BEGIN
    IF NEW.tipe_id = 'pendapatan' THEN
        UPDATE ringkasan_keuangan
        SET total_pendapatan = total_pendapatan + NEW.jumlah
        WHERE id = 1;
    ELSE
        UPDATE ringkasan_keuangan
        SET total_pengeluaran = total_pengeluaran + NEW.jumlah
        WHERE id = 1;
    END IF;
END $$
DELIMITER ;

-- Perbaharui data ringkasan_keuangan saat ada transaksi dihapus
DELIMITER $$
CREATE TRIGGER trg_delete
AFTER DELETE ON transaksi
FOR EACH ROW
BEGIN
    IF OLD.tipe_id = 'pendapatan' THEN
        UPDATE ringkasan_keuangan
        SET total_pendapatan = total_pendapatan - OLD.jumlah
        WHERE id = 1;
    ELSE
        UPDATE ringkasan_keuangan
        SET total_pengeluaran = total_pengeluaran - OLD.jumlah
        WHERE id = 1;
    END IF;
END $$
DELIMITER ;

-- Perbaharui data ringkasan_keuangan saat ada transaksi diupdate
DELIMITER $$
CREATE TRIGGER trg_update
AFTER UPDATE ON transaksi
FOR EACH ROW
BEGIN
    -- Jika tipe tidak berubah
    IF NEW.tipe_id = OLD.tipe_id THEN
        IF NEW.tipe_id = 'pendapatan' THEN
            UPDATE ringkasan_keuangan
            SET total_pendapatan = total_pendapatan + NEW.jumlah - OLD.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_keuangan
            SET total_pengeluaran = total_pengeluaran + NEW.jumlah - OLD.jumlah
            WHERE id = 1;
        END IF;
    
    -- Jika tipe berubah
    ELSE
        -- Kurangi dari tipe lama
        IF OLD.tipe_id = 'pendapatan' THEN
            UPDATE ringkasan_keuangan
            SET total_pendapatan = total_pendapatan - OLD.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_keuangan
            SET total_pengeluaran = total_pengeluaran - OLD.jumlah
            WHERE id = 1;
        END IF;
        
        -- Tambah ke tipe baru
        IF NEW.tipe_id = 'pendapatan' THEN
            UPDATE ringkasan_keuangan
            SET total_pendapatan = total_pendapatan + NEW.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_keuangan
            SET total_pengeluaran = total_pengeluaran + NEW.jumlah
            WHERE id = 1;
        END IF;
    END IF;
END $$
DELIMITER ;

-- Tambahkan data awal ke ringkasan_keuangan
INSERT INTO ringkasan_keuangan (id, total_pendapatan, total_pengeluaran) VALUES (1, 0, 0)
ON DUPLICATE KEY UPDATE id = id;
