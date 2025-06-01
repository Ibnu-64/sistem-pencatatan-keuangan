USE sistem_pencatatan_keuangan;

-- Perbaharui data ringkasan_keuangan saat ada transaksi baru
DELIMITER $$
CREATE TRIGGER trg_add
AFTER INSERT ON transaksi
FOR EACH ROW
BEGIN
    DECLARE v_tipe_id ENUM('pendapatan','pengeluaran');
    SELECT tipe_id INTO v_tipe_id FROM kategori WHERE id_kategori = NEW.id_kategori;
    IF v_tipe_id = 'pendapatan' THEN
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
    DECLARE v_tipe_id ENUM('pendapatan','pengeluaran');
    SELECT tipe_id INTO v_tipe_id FROM kategori WHERE id_kategori = OLD.id_kategori;
    IF v_tipe_id = 'pendapatan' THEN
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
    DECLARE v_tipe_id_new ENUM('pendapatan','pengeluaran');
    DECLARE v_tipe_id_old ENUM('pendapatan','pengeluaran');
    SELECT tipe_id INTO v_tipe_id_new FROM kategori WHERE id_kategori = NEW.id_kategori;
    SELECT tipe_id INTO v_tipe_id_old FROM kategori WHERE id_kategori = OLD.id_kategori;
    IF v_tipe_id_new = v_tipe_id_old THEN
        IF v_tipe_id_new = 'pendapatan' THEN
            UPDATE ringkasan_keuangan
            SET total_pendapatan = total_pendapatan + NEW.jumlah - OLD.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_keuangan
            SET total_pengeluaran = total_pengeluaran + NEW.jumlah - OLD.jumlah
            WHERE id = 1;
        END IF;
    ELSE
        -- Kurangi dari tipe lama
        IF v_tipe_id_old = 'pendapatan' THEN
            UPDATE ringkasan_keuangan
            SET total_pendapatan = total_pendapatan - OLD.jumlah
            WHERE id = 1;
        ELSE
            UPDATE ringkasan_keuangan
            SET total_pengeluaran = total_pengeluaran - OLD.jumlah
            WHERE id = 1;
        END IF;
        -- Tambah ke tipe baru
        IF v_tipe_id_new = 'pendapatan' THEN
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
