from flask import Blueprint, jsonify
from mysql.connector import Error
from app.database.db_connection import db_connection
from datetime import datetime


get_monthly_summary_bp = Blueprint('get_monthly_summary', __name__)

@get_monthly_summary_bp.route('/api/monthly-summary', methods=['GET'])
def get_monthly_summary():
    """Mengambil ringkasan keuangan per bulan untuk chart"""
    connection = db_connection()
    if connection is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Ambil data 6 bulan terakhir
        cursor.execute("""
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions 
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month
        """)
        
        monthly_data = cursor.fetchall()
        
        # Format data untuk chart
        months = []
        income_data = []
        expense_data = []
        balance_data = []
        
        for data in monthly_data:
            month_name = datetime.strptime(data['month'], '%Y-%m').strftime('%b')
            months.append(month_name)
            income_data.append(float(data['income']))
            expense_data.append(float(data['expense']))
            balance_data.append(float(data['income']) - float(data['expense']))
        
        return jsonify({
            'months': months,
            'income': income_data,
            'expense': expense_data,
            'balance': balance_data
        })
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()