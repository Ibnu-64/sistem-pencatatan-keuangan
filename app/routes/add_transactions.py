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
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        data = request.get_json()
        

        # Validasi field yang diperlukan
        required_fields = ['type', 'amount', 'category', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} is required'}), 422
            

        # Validasi type
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be income or expense'}), 422

        # Validasi amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 422
        except ValueError:
            return jsonify({'error': 'Invalid amount format'}), 422

        # Validasi date format
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 422

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
            'message': 'Transaction added successfully',
        }), 201

    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()
