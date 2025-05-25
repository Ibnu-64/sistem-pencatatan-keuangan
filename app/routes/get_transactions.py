from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_transactions_bp = Blueprint('get_transactions', __name__)


@get_transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Mengambil semua data transaksi"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    
    try:
        
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT 
                    t.id,
                    t.type_id,
                    t.amount,
                    t.date,
                    c.name AS category_name,
                    tt.description AS type_description,
                    t.description
                FROM 
                    transactions t
                JOIN 
                    categories c ON t.category_id = c.category_id
                JOIN 
                    transaction_types tt ON t.type_id = tt.type_id
                ORDER BY 
                    t.date DESC
            """)
            transactions = cursor.fetchall()
        
        # convert date to ISO format
        for transaction in transactions:
            if transaction['date']:
                transaction['date'] = transaction['date'].isoformat()
        return jsonify(transactions)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()