from flask import render_template
from flask import Flask
from flask import jsonify
from pymysql import MySQLError, OperationalError
import pymysql
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data') # Endpoint API /api/data
def get_data(): # Fungsi untuk mengembalikan data JSON
    return jsonify({"message": "HELLLLLLL NAHHHH!"}) 

if __name__ == '__main__': # Untuk menjalankan aplikasi
    app.run(debug=True) # Set debug=True untuk mode pengembangan. agar aplikasi dapat dimuat ulang secara otomatis saat ada perubahan pada kode.