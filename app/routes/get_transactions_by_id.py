from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_transactions_by_id_bp = Blueprint('get_transactions_by_id', __name__)

@get_transactions_by_id_bp.route('/api/transactions/<string:transaction_id>', methods=['GET'])
def get_transactions_by_id(transaction_id):
    """Mengambil data transaksi berdasarkan ID"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Koneksi database gagal'}), 500
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT t.*, k.tipe_id, k.nama AS nama_kategori
                FROM transaksi t
                JOIN kategori k ON t.id_kategori = k.id_kategori
                WHERE t.id = %s
            """, (transaction_id,))
            transaction = cursor.fetchone()
            if transaction is None:
                return jsonify({'error': 'Transaksi tidak ditemukan'}), 404
            if transaction['tanggal']:
                transaction['tanggal'] = transaction['tanggal'].isoformat()
        return jsonify(transaction)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()