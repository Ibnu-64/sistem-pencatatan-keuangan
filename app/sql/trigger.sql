USE sistem_pencatatan_keuangan;

-- Perbaharui data financial_summary saat ada transaksi baru
DELIMITER $$
CREATE TRIGGER trg_add
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.type_id = 'income' THEN
        UPDATE financial_summary
        SET total_income = total_income + NEW.amount
        WHERE id = 1;
    ELSE
        UPDATE financial_summary
        SET total_expense = total_expense + NEW.amount
        WHERE id = 1;
    END IF;
END $$
DELIMITER ;

-- Perbaharui data financial_summary saat ada transaksi di hapus
DELIMITER $$
CREATE TRIGGER trg_delete
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    IF OLD.type_id = 'income' THEN
        UPDATE financial_summary
        SET total_income = total_income - OLD.amount
        WHERE id = 1;
    ELSE
        UPDATE financial_summary
        SET total_expense = total_expense - OLD.amount
        WHERE id = 1;
    END IF;
END $$
DELIMITER ;

-- Perbaharui data financial_summary saat ada transaksi di update
DELIMITER $$
CREATE TRIGGER trg_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    -- Jika tipe tidak berubah
    IF NEW.type_id = OLD.type_id THEN
        IF NEW.type_id = 'income' THEN
            UPDATE financial_summary
            SET total_income = total_income + NEW.amount - OLD.amount
            WHERE id = 1;
        ELSE
            UPDATE financial_summary
            SET total_expense = total_expense + NEW.amount - OLD.amount
            WHERE id = 1;
        END IF;
    
    -- Jika tipe berubah
    ELSE
        -- Kurangi dari tipe lama
        IF OLD.type_id = 'income' THEN
            UPDATE financial_summary
            SET total_income = total_income - OLD.amount
            WHERE id = 1;
        ELSE
            UPDATE financial_summary
            SET total_expense = total_expense - OLD.amount
            WHERE id = 1;
        END IF;
        
        -- Tambah ke tipe baru
        IF NEW.type_id = 'income' THEN
            UPDATE financial_summary
            SET total_income = total_income + NEW.amount
            WHERE id = 1;
        ELSE
            UPDATE financial_summary
            SET total_expense = total_expense + NEW.amount
            WHERE id = 1;
        END IF;
    END IF;
END $$
DELIMITER ;

-- Tambahkan data awal ke financial_summary
INSERT INTO financial_summary (id, total_income, total_expense) VALUES (1, 0, 0)
ON DUPLICATE KEY UPDATE id = id;
