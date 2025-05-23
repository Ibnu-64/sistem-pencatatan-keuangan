from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection

get_summary_bp = Blueprint('get_summary', __name__)

@get_summary_bp.route('/api/summary', methods=['GET'])
def get_summary():
    """Mengambil ringkasan keuangan"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT total_income, total_expense, balance 
            FROM financial_summary 
            WHERE id = 1
        """)
        summary = cursor.fetchone()
        
        if summary is None:
            # Jika tidak ada record summary, hitung manual
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                FROM transactions
            """)
            result = cursor.fetchone()
            summary = {
                'total_income': float(result['total_income']),
                'total_expense': float(result['total_expense']),
                'balance': float(result['total_income']) - float(result['total_expense'])
            }
        else:
            summary = {
                'total_income': float(summary['total_income']),
                'total_expense': float(summary['total_expense']),
                'balance': float(summary['balance'])
            }
        
        return jsonify(summary)
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()