import mysql.connector
from mysql.connector import Error

def db_connection():
    """Membuat koneksi ke database MySQL"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='financial_tracker'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None