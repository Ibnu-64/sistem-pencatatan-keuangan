from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_category_bp = Blueprint('get_category', __name__)

@get_category_bp('/api/categories', methods=['GET'])
def get_categories():
    connection = db_connection()
    cursor = connection.cursor(dictionary=True)
    with connection.cursor() as cursor:
        try:
            cursor.execute("SELECT name FROM categories")
            categories = [row['name'] for row in cursor.fetchall()]
        except Error as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify(categories)