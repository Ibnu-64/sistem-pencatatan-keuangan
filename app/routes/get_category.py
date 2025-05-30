from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_category_bp = Blueprint('get_category', __name__)

@get_category_bp.route('/api/categories/<string:tipe_id>', methods=['GET'])
def get_categories(tipe_id):
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Koneksi database gagal'}), 500
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT id_kategori, nama FROM kategori WHERE tipe_id = %s", (tipe_id,))
            categories = cursor.fetchall()
            if not categories:
                return jsonify({'error': 'Kategori tidak ditemukan untuk tipe ini'}), 404
        return jsonify(categories)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()