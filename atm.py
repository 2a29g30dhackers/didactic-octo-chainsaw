from flask import Blueprint, jsonify, request, render_template
import random
import string
import datetime

atm_bp = Blueprint('atm', __name__)

# Fungsi untuk menghasilkan nomor kartu ATM acak
def generate_card_number():
    # Format: 16 digit
    prefix = "4219"  # Prefix untuk kartu Bang Dunia
    middle = ''.join(random.choices(string.digits, k=10))
    # Digit terakhir sebagai checksum (implementasi sederhana)
    last_digit = str(random.randint(0, 9))
    return prefix + middle + last_digit

# Fungsi untuk menghasilkan tanggal kedaluwarsa
def generate_expiry_date():
    current_year = datetime.datetime.now().year
    expiry_year = current_year + random.randint(3, 5)
    expiry_month = random.randint(1, 12)
    return f"{expiry_month:02d}/{str(expiry_year)[2:]}"

# Fungsi untuk menghasilkan CVV
def generate_cvv():
    return ''.join(random.choices(string.digits, k=3))

@atm_bp.route('/generate', methods=['POST'])
def generate_atm_card():
    data = request.get_json()
    
    # Mengambil data dari request
    name = data.get('name', 'KARTU BANG DUNIA')
    balance = data.get('balance', 0)
    card_type = data.get('card_type', 'STANDARD')
    
    # Menghasilkan data kartu
    card_data = {
        'card_number': generate_card_number(),
        'name': name.upper(),
        'expiry_date': generate_expiry_date(),
        'cvv': generate_cvv(),
        'balance': float(balance),
        'card_type': card_type.upper(),
        'issue_date': datetime.datetime.now().strftime("%d/%m/%Y")
    }
    
    return jsonify(card_data)

@atm_bp.route('/update-balance', methods=['POST'])
def update_balance():
    data = request.get_json()
    
    # Dalam implementasi nyata, ini akan terhubung ke database
    # Untuk demo, kita hanya mengembalikan nilai yang diperbarui
    card_number = data.get('card_number', '')
    new_balance = data.get('balance', 0)
    
    return jsonify({
        'card_number': card_number,
        'balance': float(new_balance),
        'updated_at': datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    })
