from flask import Flask

# Import routes
from .routes.index import index_bp
from .routes.get_transactions import get_transactions_bp
from .routes.get_transactions_by_id import get_transactions_by_id_bp
from .routes.add_transactions import add_transactions_bp
from .routes.update_transactions import update_transactions_bp
from .routes.delete_transactions import delete_transactions_bp
from .routes.delete_all_transactions import delete_all_transactions_bp
from .routes.get_summary import get_summary_bp
from .routes.get_monthly_summary import get_monthly_summary_bp
from .routes.get_category import get_category_bp

def create_app():
    """Buat aplikasi Flask"""
    app = Flask(__name__)
    
    # Daftarkan blueprint untuk setiap route
    app.register_blueprint(index_bp)
    app.register_blueprint(get_transactions_bp)
    app.register_blueprint(get_transactions_by_id_bp)
    app.register_blueprint(add_transactions_bp)
    app.register_blueprint(update_transactions_bp)
    app.register_blueprint(delete_transactions_bp)
    app.register_blueprint(delete_all_transactions_bp)
    app.register_blueprint(get_summary_bp)
    app.register_blueprint(get_monthly_summary_bp)
    app.register_blueprint(get_category_bp)
    
    return app