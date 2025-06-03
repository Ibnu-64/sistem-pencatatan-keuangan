from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_transactions_bp = Blueprint('get_transactions', __name__)


@get_transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Mengambil semua data transaksi"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Koneksi database gagal'}), 500
    
    
    try:
        
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT 
                    t.id,
                    t.jumlah,
                    t.tanggal,
                    k.nama AS nama_kategori,
                    k.tipe_id AS tipe_id,
                    t.deskripsi,
                    k.id_kategori
                FROM 
                    transaksi t
                JOIN 
                    kategori k ON t.id_kategori = k.id_kategori
                ORDER BY 
                    t.tanggal DESC
            """)
            transactions = cursor.fetchall()
        
        # convert date to ISO format
        for transaction in transactions:
            if transaction['tanggal']:
                transaction['tanggal'] = transaction['tanggal'].isoformat()
        return jsonify(transactions)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()