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
        return jsonify({'error': 'Koneksi database gagal'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT 
                DATE_FORMAT(tanggal, '%Y-%m') as bulan,
                SUM(CASE WHEN tipe_id = 'pendapatan' THEN jumlah ELSE 0 END) as pendapatan,
                SUM(CASE WHEN tipe_id = 'pengeluaran' THEN jumlah ELSE 0 END) as pengeluaran
            FROM transaksi
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
            GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
            ORDER BY bulan;
        """)
        
        monthly_data = cursor.fetchall()
        
        # Format data untuk chart
        bulan_list = []
        pendapatan_data = []
        pengeluaran_data = []
        saldo_data = []
        
        for data in monthly_data:
            month_name = datetime.strptime(data['bulan'], '%Y-%m').strftime('%b')
            bulan_list.append(month_name)
            pendapatan_data.append(float(data['pendapatan']))
            pengeluaran_data.append(float(data['pengeluaran']))
            saldo_data.append(float(data['pendapatan']) - float(data['pengeluaran']))
        
        return jsonify({
            'bulan': bulan_list,
            'pendapatan': pendapatan_data,
            'pengeluaran': pengeluaran_data,
            'saldo': saldo_data
        })
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()