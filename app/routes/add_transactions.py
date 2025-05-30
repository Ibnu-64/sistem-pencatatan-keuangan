from flask import Blueprint, jsonify, request
from mysql.connector import Error
from app.database.db_connection import db_connection
from datetime import datetime

add_transactions_bp = Blueprint('add_transactions', __name__)

@add_transactions_bp.route('/api/transactions', methods=['POST'])
def add_transactions():
    """Menambah transaksi baru"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Koneksi database gagal'}), 500

    try:
        data = request.get_json()
        
        # Validasi field yang diperlukan
        required_fields = ['type', 'amount', 'category', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} wajib diisi'}), 422

        # Validasi type
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Tipe harus income atau expense'}), 422

        # Validasi amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Jumlah harus lebih dari 0'}), 422
        except ValueError:
            return jsonify({'error': 'Format jumlah tidak valid'}), 422

        # Validasi date format
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Format tanggal tidak valid. Gunakan YYYY-MM-DD'}), 422

        with connection.cursor() as cursor:
            query = """
                INSERT INTO transactions (type_id, amount, category_id, description, date)
                VALUES (%s, %s, %s, %s, %s)
            """
            values = (
                data['type'],
                amount,
                data['category'],
                data.get('description', ''),
                data['date']
            )
            cursor.execute(query, values)
            connection.commit()

        return jsonify({
            'message': 'Transaksi berhasil ditambahkan',
        }), 201

    except Error as e:
        connection.rollback()
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500
    finally:
        connection.close()
