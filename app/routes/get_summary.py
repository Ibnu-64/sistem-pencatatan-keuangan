from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_summary_bp = Blueprint('get_summary', __name__)

@get_summary_bp.route('/api/summary', methods=['GET'])
def get_summary():
    """Mengambil ringkasan keuangan"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Koneksi database gagal'}), 500
    
    try:
        
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT total_pendapatan, total_pengeluaran, saldo
                FROM ringkasan_keuangan
                WHERE id = 1
            """)
            summary = cursor.fetchone()
            
            if summary is None:
                return jsonify({'error': 'Ringkasan tidak ditemukan'}), 404
        
        
        return jsonify(summary)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()