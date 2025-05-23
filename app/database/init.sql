CREATE DATABASE IF NOT EXISTS financial_tracker;

USE financial_tracker;


-- TABLES transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS financial_summary (
    id INT PRIMARY KEY DEFAULT 1,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expense DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TRIGGER IF NOT EXISTS update_summary_after_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE new_income DECIMAL(15,2) DEFAULT 0;
    DECLARE new_expense DECIMAL(15,2) DEFAULT 0;
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO new_income, new_expense
    FROM transactions;
    
    UPDATE financial_summary 
    SET 
        total_income = new_income,
        total_expense = new_expense,
        balance = new_income - new_expense
    WHERE id = 1;
END

CREATE TRIGGER IF NOT EXISTS update_summary_after_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    DECLARE new_income DECIMAL(15,2) DEFAULT 0;
    DECLARE new_expense DECIMAL(15,2) DEFAULT 0;
    
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO new_income, new_expense
    FROM transactions;
    
    UPDATE financial_summary 
    SET 
        total_income = new_income,
        total_expense = new_expense,
        balance = new_income - new_expense
    WHERE id = 1;
END

CREATE TRIGGER IF NOT EXISTS update_summary_after_delete
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    DECLARE new_income DECIMAL(15,2) DEFAULT 0;
    DECLARE new_expense DECIMAL(15,2) DEFAULT 0;
            
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO new_income, new_expense
    FROM transactions;
            
    UPDATE financial_summary 
    SET 
        total_income = new_income,
        total_expense = new_expense,
        balance = new_income - new_expense
    WHERE id = 1;
END