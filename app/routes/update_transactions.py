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
        
        # Cek apakah transaksi ada
        cursor.execute("SELECT id FROM transactions WHERE id = %s", (transaction_id,))
        if cursor.fetchone() is None:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Update transaksi
        query = """
            UPDATE transactions 
            SET type = %s, amount = %s, category = %s, description = %s, date = %s
            WHERE id = %s
        """
        values = (
            data['type'],
            float(data['amount']),
            data['category'],
            data.get('description', ''),
            data['date'],
            transaction_id
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        return jsonify({'message': 'Transaction updated successfully'})
        
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    except ValueError as e:
        return jsonify({'error': 'Invalid amount format'}), 400
    finally:
        cursor.close()
        connection.close()