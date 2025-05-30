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
cursor.execute("SELECT category_id, type_id FROM categories")
categories = cursor.fetchall()

# Group kategori berdasarkan type_id
category_map = {
    'income': [c['category_id'] for c in categories if c['type_id'] == 'income'],
    'expense': [c['category_id'] for c in categories if c['type_id'] == 'expense']
}

# Fungsi untuk generate tanggal acak
def random_date(start, end):
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

# Generate dan insert data transaksi dummy
jumlah_data = 50  # Jumlah transaksi yang ingin dibuat

for _ in range(jumlah_data):
    type_id = random.choice(['income', 'expense'])
    category_id = random.choice(category_map[type_id])
    amount = round(random.uniform(10000, 1000000))
    description = random.choice([
        'Lorem ipsum dolor sit amet',
        '',
        '',
        '',
        'adipiscing elit',
        '',
        'sit amet'
    ])
    date = random_date(datetime(2025, 1, 1), datetime(2025, 12, 31)).date()

    query = """
    INSERT INTO transactions ( type_id, amount, category_id, description, date)
    VALUES ( %s, %s, %s, %s, %s)
    """
    values = ( type_id, amount, category_id, description, date)
    print(f"Menambahkan transaksi: {type_id}, {amount}, {category_id}, {description}, {date}")
    cursor.execute(query, values)

conn.commit()
print(f"{jumlah_data} transaksi berhasil ditambahkan.")
cursor.close()
conn.close()
