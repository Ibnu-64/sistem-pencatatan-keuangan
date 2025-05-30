from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

delete_all_transactions_bp = Blueprint('delete_all_transactions)', __name__)

@delete_all_transactions_bp.route('/api/transactions', methods=['DELETE'])
def delete_all_transactions():
    """Menghapus semua transaksi"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Koneksi database gagal'}), 500
    
    
    try:
        
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM transactions")
            connection.commit()
        
        return jsonify({'message': 'Semua transaksi berhasil dihapus'})
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()