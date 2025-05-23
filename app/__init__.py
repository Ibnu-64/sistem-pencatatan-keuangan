from flask import Flask
from flask_cors import CORS

# Import routes

def create_app():
    """Buat aplikasi Flask"""
    app = Flask(__name__)
    from .routes.index import index_bp
    from .routes.get_transactions import get_transactions_bp
    app.register_blueprint(index_bp)
    app.register_blueprint(get_transactions_bp)
    return app