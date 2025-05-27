from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

delete_transactions_bp = Blueprint('delete_transactions', __name__)

@delete_transactions_bp.route('/api/transactions/<string:transaction_id>', methods=['DELETE'])
def delete_transactions(transaction_id):
    """Menghapus transaksi berdasarkan ID"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    
    try:
        with connection.cursor() as cursor:
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
        connection.close()