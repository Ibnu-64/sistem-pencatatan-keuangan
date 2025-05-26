from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_category_bp = Blueprint('get_category', __name__)

@get_category_bp.route('/api/categories', methods=['GET'])
def get_categories():
    connection = db_connection()
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT name FROM categories")
            categories = [row['name'] for row in cursor.fetchall()]
        return jsonify(categories)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()