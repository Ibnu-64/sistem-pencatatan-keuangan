from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_category_bp = Blueprint('get_category', __name__)

@get_category_bp.route('/api/categories/<string:type_id>', methods=['GET'])
def get_categories(type_id):
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT category_id, name FROM categories WHERE type_id = %s", (type_id,))
            categories = cursor.fetchall()
            if not categories:
                return jsonify({'error': 'No categories found for this type'}), 404
        return jsonify(categories)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()