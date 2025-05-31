import json
import os
from flask import Flask, send_from_directory, session
from src.models.user import db, Bank
from src.routes.user import user_bp
from src.routes.atm import atm_bp
from src.routes.auth import auth_bp
from src.routes.bank import bank_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Aktifkan database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///atm_generator.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(atm_bp, url_prefix='/api/atm')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(bank_bp, url_prefix='/api/bank')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# Inisialisasi database dan data bank
def init_db():
    with app.app_context():
        db.create_all()
        
        # Cek apakah data bank sudah ada
        if Bank.query.count() == 0:
            # Data bank dari seluruh dunia
            banks_data = [
                {"name": "Bank Mandiri", "country": "Indonesia", "code": "BMRI", "color_scheme": "blue"},
                {"name": "BCA", "country": "Indonesia", "code": "BBCA", "color_scheme": "blue"},
                {"name": "BNI", "country": "Indonesia", "code": "BBNI", "color_scheme": "orange"},
                {"name": "BRI", "country": "Indonesia", "code": "BBRI", "color_scheme": "blue"},
                {"name": "CIMB Niaga", "country": "Indonesia", "code": "BNGA", "color_scheme": "red"},
                {"name": "Bank of America", "country": "USA", "code": "BAC", "color_scheme": "red"},
                {"name": "JPMorgan Chase", "country": "USA", "code": "JPM", "color_scheme": "blue"},
                {"name": "Wells Fargo", "country": "USA", "code": "WFC", "color_scheme": "red"},
                {"name": "Citibank", "country": "USA", "code": "C", "color_scheme": "blue"},
                {"name": "HSBC", "country": "UK", "code": "HSBC", "color_scheme": "red"},
                {"name": "Barclays", "country": "UK", "code": "BARC", "color_scheme": "blue"},
                {"name": "Deutsche Bank", "country": "Germany", "code": "DBK", "color_scheme": "blue"},
                {"name": "BNP Paribas", "country": "France", "code": "BNP", "color_scheme": "green"},
                {"name": "Santander", "country": "Spain", "code": "SAN", "color_scheme": "red"},
                {"name": "UBS", "country": "Switzerland", "code": "UBS", "color_scheme": "red"},
                {"name": "Credit Suisse", "country": "Switzerland", "code": "CS", "color_scheme": "blue"},
                {"name": "Mitsubishi UFJ", "country": "Japan", "code": "MUFJ", "color_scheme": "green"},
                {"name": "Industrial and Commercial Bank of China", "country": "China", "code": "ICBC", "color_scheme": "red"},
                {"name": "China Construction Bank", "country": "China", "code": "CCB", "color_scheme": "blue"},
                {"name": "Commonwealth Bank", "country": "Australia", "code": "CBA", "color_scheme": "yellow"},
                {"name": "Royal Bank of Canada", "country": "Canada", "code": "RBC", "color_scheme": "blue"},
                {"name": "Itaú Unibanco", "country": "Brazil", "code": "ITUB", "color_scheme": "blue"},
                {"name": "Sberbank", "country": "Russia", "code": "SBER", "color_scheme": "green"},
                {"name": "State Bank of India", "country": "India", "code": "SBI", "color_scheme": "blue"},
                {"name": "Standard Bank", "country": "South Africa", "code": "SBK", "color_scheme": "blue"}
            ]
            
            # Tambahkan data bank ke database
            for bank_data in banks_data:
                bank = Bank(**bank_data)
                db.session.add(bank)
            
            db.session.commit()
            print("Database initialized with bank data")

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
