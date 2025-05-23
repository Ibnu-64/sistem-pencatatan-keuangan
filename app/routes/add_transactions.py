from flask import Blueprint, jsonify, request
from mysql.connector import Error
from app.database.db_connection import db_connection

add_transactions_bp = Blueprint('add_transactions', __name__)

@add_transactions_bp.route('/api/transactions', methods=['POST'])
def add_transactions():
    """Menambah transaksi baru"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    try:
        data = request.get_json()
        
        # Validasi data
        required_fields = ['type', 'amount', 'category', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} is required'}), 400
        
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be income or expense'}), 400
        
        if float(data['amount']) <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Insert transaksi baru
        query = """
            INSERT INTO transactions (type, amount, category, description, date)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            data['type'],
            float(data['amount']),
            data['category'],
            data.get('description', ''),
            data['date']
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        transaction_id = cursor.lastrowid
        
        return jsonify({
            'message': 'Transaction added successfully',
            'id': transaction_id
        }), 201
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    except ValueError as e:
        return jsonify({'error': 'Invalid amount format'}), 400
    finally:
        cursor.close()
        connection.close()