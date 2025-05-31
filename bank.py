from flask import Blueprint, jsonify, request
from src.models.user import db, Bank

bank_bp = Blueprint('bank', __name__)

@bank_bp.route('/list', methods=['GET'])
def get_banks():
    """Mendapatkan daftar bank dari seluruh dunia"""
    banks = Bank.query.all()
    return jsonify({
        'banks': [bank.to_dict() for bank in banks]
    }), 200

@bank_bp.route('/<int:bank_id>', methods=['GET'])
def get_bank(bank_id):
    """Mendapatkan detail bank berdasarkan ID"""
    bank = Bank.query.get(bank_id)
    
    if not bank:
        return jsonify({'error': 'Bank tidak ditemukan'}), 404
    
    return jsonify({
        'bank': bank.to_dict()
    }), 200

@bank_bp.route('/search', methods=['GET'])
def search_banks():
    """Mencari bank berdasarkan nama atau negara"""
    query = request.args.get('q', '')
    country = request.args.get('country', '')
    
    if not query and not country:
        return jsonify({'error': 'Parameter pencarian diperlukan'}), 400
    
    # Pencarian berdasarkan nama dan/atau negara
    banks_query = Bank.query
    
    if query:
        banks_query = banks_query.filter(Bank.name.ilike(f'%{query}%'))
    
    if country:
        banks_query = banks_query.filter(Bank.country.ilike(f'%{country}%'))
    
    banks = banks_query.all()
    
    return jsonify({
        'banks': [bank.to_dict() for bank in banks]
    }), 200
