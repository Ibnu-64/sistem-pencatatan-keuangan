from flask import render_template
from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__': # Untuk menjalankan aplikasi
    app.run(debug=True) # Set debug=True untuk mode pengembangan. agar aplikasi dapat dimuat ulang secara otomatis saat ada perubahan pada kode.