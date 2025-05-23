from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_transactions_bp = Blueprint('get_transactions', __name__)


@get_transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Mengambil semua data transaksi"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True) # buka koneksi ke database
    
    try:
        cursor.execute("""
            SELECT id, type, amount, category, description, date 
            FROM transactions 
            ORDER BY date DESC, created_at DESC
        """)
        transactions = cursor.fetchall()
        
        # convert date to ISO format
        for transaction in transactions:
            if transaction['date']:
                transaction['date'] = transaction['date'].isoformat()
        return jsonify(transactions)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # setelah selesai, tutup koneksi
        cursor.close()
        connection.close()