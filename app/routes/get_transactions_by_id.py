from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_transactions_by_id_bp = Blueprint('get_transactions_by_id', __name__)

@get_transactions_by_id_bp.route('/api/transactions/<string:transaction_id>', methods=['GET'])
def get_transactions_by_id(transaction_id):
    """Mengambil data transaksi berdasarkan ID"""
    
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT * FROM `transactions` 
                WHERE id = %s
            """, (transaction_id,))
            transaction = cursor.fetchone()
            
            if transaction is None:
                return jsonify({'error': 'Transaction not found'}), 404
            
            if transaction['date']:
                transaction['date'] = transaction['date'].isoformat()
        
        return jsonify(transaction)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()