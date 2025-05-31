from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validasi data
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Data tidak lengkap'}), 400
    
    # Cek apakah email sudah terdaftar
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email sudah terdaftar'}), 400
    
    # Buat user baru
    new_user = User(
        name=data.get('name'),
        email=data.get('email')
    )
    new_user.set_password(data.get('password'))
    
    # Simpan ke database
    db.session.add(new_user)
    db.session.commit()
    
    # Simpan user_id ke session
    session['user_id'] = new_user.id
    
    return jsonify({
        'message': 'Pendaftaran berhasil',
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validasi data
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Data tidak lengkap'}), 400
    
    # Cari user berdasarkan email
    user = User.query.filter_by(email=data.get('email')).first()
    
    # Cek apakah user ada dan password benar
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Email atau password salah'}), 401
    
    # Simpan user_id ke session
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'Login berhasil',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Hapus user_id dari session
    session.pop('user_id', None)
    
    return jsonify({'message': 'Logout berhasil'}), 200

@auth_bp.route('/user', methods=['GET'])
def get_user():
    # Cek apakah user sudah login
    if 'user_id' not in session:
        return jsonify({'error': 'Belum login'}), 401
    
    # Cari user berdasarkan id
    user = User.query.get(session['user_id'])
    
    if not user:
        session.pop('user_id', None)
        return jsonify({'error': 'User tidak ditemukan'}), 404
    
    return jsonify({'user': user.to_dict()}), 200
