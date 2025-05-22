from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'financial_tracker',
    'user': 'root',
    'password': ''  # Ganti dengan password MySQL Anda
}

def get_db_connection():
    """Membuat koneksi ke database MySQL"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def init_database():
    """Inisialisasi database dan tabel"""
    connection = get_db_connection()
    if connection is None:
        return False
    
    cursor = connection.cursor()
    
    try:
        # Membuat tabel transactions
        create_transactions_table = """
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
        """
        
        # Membuat tabel summary untuk menyimpan ringkasan keuangan
        create_summary_table = """
        CREATE TABLE IF NOT EXISTS financial_summary (
            id INT PRIMARY KEY DEFAULT 1,
            total_income DECIMAL(15,2) DEFAULT 0,
            total_expense DECIMAL(15,2) DEFAULT 0,
            balance DECIMAL(15,2) DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
        
        cursor.execute(create_transactions_table)
        cursor.execute(create_summary_table)
        
        # Insert initial record untuk summary jika belum ada
        cursor.execute("SELECT COUNT(*) FROM financial_summary")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO financial_summary (id) VALUES (1)")
        
        # Membuat trigger untuk UPDATE otomatis summary setelah INSERT transaksi
        create_trigger_after_insert = """
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
        """
        
        # Membuat trigger untuk UPDATE otomatis summary setelah UPDATE transaksi
        create_trigger_after_update = """
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
        """
        
        # Membuat trigger untuk UPDATE otomatis summary setelah DELETE transaksi
        create_trigger_after_delete = """
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
        """
        
        cursor.execute(create_trigger_after_insert)
        cursor.execute(create_trigger_after_update)
        cursor.execute(create_trigger_after_delete)
        
        connection.commit()
        print("Database dan triggers berhasil diinisialisasi!")
        return True
        
    except Error as e:
        print(f"Error initializing database: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

# Routes untuk API

@app.route('/')
def index():
    """Menampilkan halaman utama Financial Tracker"""
    return render_template('index.html')

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Mengambil semua data transaksi"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT id, type, amount, category, description, date 
            FROM transactions 
            ORDER BY date DESC, created_at DESC
        """)
        transactions = cursor.fetchall()
        
        # Convert date to string for JSON serialization
        for transaction in transactions:
            if transaction['date']:
                transaction['date'] = transaction['date'].isoformat()
        
        return jsonify(transactions)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Mengambil data transaksi berdasarkan ID"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT id, type, amount, category, description, date 
            FROM transactions 
            WHERE id = %s
        """, (transaction_id,))
        transaction = cursor.fetchone()
        
        if transaction is None:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Convert date to string for JSON serialization
        if transaction['date']:
            transaction['date'] = transaction['date'].isoformat()
        
        return jsonify(transaction)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Menambah transaksi baru"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    try:
        data = request.get_json()
        
        # Validasi data
        required_fields = ['type', 'amount', 'category', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} is required'}), 400
        
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be income or expense'}), 400
        
        if float(data['amount']) <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Insert transaksi baru
        query = """
            INSERT INTO transactions (type, amount, category, description, date)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            data['type'],
            float(data['amount']),
            data['category'],
            data.get('description', ''),
            data['date']
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        transaction_id = cursor.lastrowid
        
        return jsonify({
            'message': 'Transaction added successfully',
            'id': transaction_id
        }), 201
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    except ValueError as e:
        return jsonify({'error': 'Invalid amount format'}), 400
    finally:
        cursor.close()
        connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Mengupdate transaksi berdasarkan ID"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    try:
        data = request.get_json()
        
        # Validasi data
        required_fields = ['type', 'amount', 'category', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} is required'}), 400
        
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be income or expense'}), 400
        
        if float(data['amount']) <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Cek apakah transaksi ada
        cursor.execute("SELECT id FROM transactions WHERE id = %s", (transaction_id,))
        if cursor.fetchone() is None:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Update transaksi
        query = """
            UPDATE transactions 
            SET type = %s, amount = %s, category = %s, description = %s, date = %s
            WHERE id = %s
        """
        values = (
            data['type'],
            float(data['amount']),
            data['category'],
            data.get('description', ''),
            data['date'],
            transaction_id
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        return jsonify({'message': 'Transaction updated successfully'})
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    except ValueError as e:
        return jsonify({'error': 'Invalid amount format'}), 400
    finally:
        cursor.close()
        connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Menghapus transaksi berdasarkan ID"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    try:
        # Cek apakah transaksi ada
        cursor.execute("SELECT id FROM transactions WHERE id = %s", (transaction_id,))
        if cursor.fetchone() is None:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Hapus transaksi
        cursor.execute("DELETE FROM transactions WHERE id = %s", (transaction_id,))
        connection.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'})
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/transactions', methods=['DELETE'])
def delete_all_transactions():
    """Menghapus semua transaksi"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    try:
        cursor.execute("DELETE FROM transactions")
        connection.commit()
        
        return jsonify({'message': 'All transactions deleted successfully'})
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Mengambil ringkasan keuangan"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT total_income, total_expense, balance 
            FROM financial_summary 
            WHERE id = 1
        """)
        summary = cursor.fetchone()
        
        if summary is None:
            # Jika tidak ada record summary, hitung manual
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                FROM transactions
            """)
            result = cursor.fetchone()
            summary = {
                'total_income': float(result['total_income']),
                'total_expense': float(result['total_expense']),
                'balance': float(result['total_income']) - float(result['total_expense'])
            }
        else:
            summary = {
                'total_income': float(summary['total_income']),
                'total_expense': float(summary['total_expense']),
                'balance': float(summary['balance'])
            }
        
        return jsonify(summary)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/monthly-summary', methods=['GET'])
def get_monthly_summary():
    """Mengambil ringkasan keuangan per bulan untuk chart"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Ambil data 6 bulan terakhir
        cursor.execute("""
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions 
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month
        """)
        
        monthly_data = cursor.fetchall()
        
        # Format data untuk chart
        months = []
        income_data = []
        expense_data = []
        balance_data = []
        
        for data in monthly_data:
            month_name = datetime.strptime(data['month'], '%Y-%m').strftime('%b')
            months.append(month_name)
            income_data.append(float(data['income']))
            expense_data.append(float(data['expense']))
            balance_data.append(float(data['income']) - float(data['expense']))
        
        return jsonify({
            'months': months,
            'income': income_data,
            'expense': expense_data,
            'balance': balance_data
        })
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    # Inisialisasi database saat aplikasi dimulai
    if init_database():
        print("Starting Financial Tracker application...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to initialize database. Please check your MySQL configuration.")