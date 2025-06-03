from flask import Blueprint, jsonify, request
from mysql.connector import Error
from app.database.db_connection import db_connection

update_transactions_bp = Blueprint('update_transactions', __name__)


@update_transactions_bp.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transactions(transaction_id):
    """Mengupdate transaksi berdasarkan ID"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    
    try:
        data = request.get_json()
        # Validasi data
        required_fields = ['jumlah', 'id_kategori', 'tanggal']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} wajib diisi'}), 400

        if float(data['jumlah']) <= 0:
            return jsonify({'error': 'Jumlah harus lebih dari 0'}), 400

        # Validasi id_kategori dan ambil tipe_id dari kategori
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT tipe_id FROM kategori WHERE id_kategori = %s", (data['id_kategori'],))
            kategori = cursor.fetchone()
            if not kategori:
                return jsonify({'error': 'Kategori tidak ditemukan'}), 400

        with connection.cursor() as cursor:
            # Cek apakah id transaksi ada
            cursor.execute("SELECT id FROM transaksi WHERE id = %s", (transaction_id,))
            if cursor.fetchone() is None:
                return jsonify({'error': 'Transaksi tidak ditemukan'}), 404

            # Update transaksi
            query = """
                UPDATE transaksi 
                SET jumlah = %s, id_kategori = %s, deskripsi = %s, tanggal = %s
                WHERE id = %s
            """
            values = (
                float(data['jumlah']),
                data['id_kategori'],
                data.get('deskripsi', ''),
                data['tanggal'],
                transaction_id
            )
            cursor.execute(query, values)
            connection.commit()

        return jsonify({'message': 'Transaksi berhasil diupdate'})
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    except ValueError as e:
        return jsonify({'error': 'Invalid amount format'}), 400
    finally:
        connection.close()