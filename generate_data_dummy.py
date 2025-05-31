import mysql.connector
import random
from datetime import datetime, timedelta

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='sistem_pencatatan_keuangan'
)
cursor = conn.cursor(dictionary=True)

# Ambil semua kategori yang tersedia
cursor.execute("SELECT id_kategori, tipe_id FROM kategori")
kategori = cursor.fetchall()

# Group kategori berdasarkan tipe_id
kategori_map = {
    'pendapatan': [k['id_kategori'] for k in kategori if k['tipe_id'] == 'pendapatan'],
    'pengeluaran': [k['id_kategori'] for k in kategori if k['tipe_id'] == 'pengeluaran']
}

# Fungsi untuk generate tanggal acak
def random_date(start, end):
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

# Generate dan insert data transaksi dummy
jumlah_data = 50  # Jumlah transaksi yang ingin dibuat

for _ in range(jumlah_data):
    tipe_id = random.choice(['pendapatan', 'pengeluaran'])
    id_kategori = random.choice(kategori_map[tipe_id])
    jumlah = round(random.uniform(10000, 1000000))
    deskripsi = random.choice([
        'Lorem ipsum dolor sit amet',
        '',
        '',
        '',
        'adipiscing elit',
        '',
        'sit amet'
    ])
    tanggal = random_date(datetime(2025, 1, 1), datetime(2025, 12, 31)).date()

    query = """
    INSERT INTO transaksi (tipe_id, jumlah, id_kategori, deskripsi, tanggal)
    VALUES (%s, %s, %s, %s, %s)
    """
    values = (tipe_id, jumlah, id_kategori, deskripsi, tanggal)
    print(f"Menambahkan transaksi: {tipe_id}, {jumlah}, {id_kategori}, {deskripsi}, {tanggal}")
    cursor.execute(query, values)

conn.commit()
print(f"{jumlah_data} transaksi berhasil ditambahkan.")
cursor.close()
conn.close()
