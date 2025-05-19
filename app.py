from flask import render_template
from flask import Flask
from flask import jsonify
from pymysql import MySQLError, OperationalError
import pymysql
from datetime import datetime
import locale
app = Flask(__name__)


locale.setlocale(locale.LC_TIME, 'id_ID.UTF-8')


@app.route('/')
def index():
    transactions_by_date = {
        "2025-05-18": [
            {
                "type": "expense",
                "category": "Makanan",
                "amount": 55000,
                "item": datetime(2025, 5, 18, 20, 15),
                "icon": "fa-solid fa-burger",
            },
            {
                "type": "income",
                "category": "Tunai",
                "amount": 20000,
                "item": datetime(2025, 5, 18, 14, 35),
                "icon": "fa-solid fa-wallet",
            },
        ],
        "2025-05-17": [
            {
                "type": "expense",
                "category": "Minum",
                "amount": 10000,
                "item": datetime(2025, 5, 17, 1, 15),
                "icon": "fa-solid fa-mug-hot",
            }
        ],
        "2025-05-16": [
            {
                "type": "expense",
                "category": "Makan",
                "amount": 15000,
                "item": datetime(2025, 5, 16, 1, 15),
                "icon": "fa-solid fa-burger",
            },
            {
                "type": "income",
                "category": "Tunai",
                "amount": 3245,
                "item": datetime(2025, 5, 16, 20, 55),
                "icon": "fa-solid fa-wallet",
                
            },
            {
                "type": "income",
                "category": "Tunai",
                "amount": 200000,
                "item": datetime(2025, 5, 16, 10, 12),
                "icon": "fa-solid fa-wallet",
                
            },
            {
                "type": "expense",
                "category": "Minum",
                "amount": 10000,
                "item": datetime(2025, 5, 16, 7, 40),
                "icon": "fa-solid fa-mug-hot",
                
            }
        ],
    }
    return render_template("index.html", transactions_by_date=transactions_by_date)

BULAN_INDONESIA = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

@app.context_processor
def inject_functions():
    def format_tanggal(tanggal_str):
        tanggal_dt = datetime.strptime(tanggal_str, "%Y-%m-%d")
        nama_bulan = BULAN_INDONESIA[tanggal_dt.month - 1]
        return f"{nama_bulan} {tanggal_dt.day}"

    def get_day_label(date_input):
        if isinstance(date_input, str):
            date_input = datetime.strptime(date_input, "%Y-%m-%d")
        return date_input.strftime("%A")

    return dict(format_tanggal=format_tanggal, get_day_label=get_day_label)

@app.route('/api/data') # Endpoint API /api/data
def get_data(): # Fungsi untuk mengembalikan data JSON
    return jsonify({"message": "HELLLLLLL NAHHHH!"}) 

if __name__ == '__main__': # Untuk menjalankan aplikasi
    app.run(debug=True) # Set debug=True untuk mode pengembangan. agar aplikasi dapat dimuat ulang secara otomatis saat ada perubahan pada kode.