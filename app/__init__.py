from flask import Flask

# Import routes
from .routes.index import index_bp

def create_app():
    """Buat aplikasi Flask"""
    app = Flask(__name__)
    app.register_blueprint(index_bp, url_prefix='/')
    return app