from flask import Blueprint, request, jsonify
import requests
import jwt
import os
from datetime import datetime, timedelta
from db import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/wechat-login', methods=['POST'])
def wechat_login():
    """微信登录获取openid"""
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({'error': '缺少code参数'}), 400

    # 开发模式：直接使用传入的 openid
    if code == 'dev_mode' and data.get('openid'):
        openid = data.get('openid')

        # 保存或更新用户
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT OR IGNORE INTO users (openid) VALUES (?)', (openid,))
        conn.commit()
        conn.close()

        # 生成JWT token
        token = jwt.encode({
            'openid': openid,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, os.getenv('JWT_SECRET', 'dev-secret-key'), algorithm='HS256')

        return jsonify({
            'token': token,
            'openid': openid
        })

    # 调用微信API获取openid
    appid = os.getenv('WECHAT_APPID')
    secret = os.getenv('WECHAT_SECRET')

    url = f'https://api.weixin.qq.com/sns/jscode2session'
    params = {
        'appid': appid,
        'secret': secret,
        'js_code': code,
        'grant_type': 'authorization_code'
    }

    try:
        response = requests.get(url, params=params)
        result = response.json()

        if 'openid' not in result:
            return jsonify({'error': '获取openid失败', 'detail': result}), 400

        openid = result['openid']

        # 保存或更新用户
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT OR IGNORE INTO users (openid) VALUES (?)', (openid,))
        conn.commit()
        conn.close()

        # 生成JWT token
        token = jwt.encode({
            'openid': openid,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, os.getenv('JWT_SECRET', 'dev-secret-key'), algorithm='HS256')

        return jsonify({
            'token': token,
            'openid': openid
        })

    except Exception as e:
        return jsonify({'error': '登录失败', 'detail': str(e)}), 500

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    """管理员登录"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM admins WHERE username = ? AND password = ?',
                   (username, password))
    admin = cursor.fetchone()
    conn.close()

    if not admin:
        return jsonify({'error': '用户名或密码错误'}), 401

    # 生成JWT token
    token = jwt.encode({
        'admin_id': admin['id'],
        'username': admin['username'],
        'role': 'admin',
        'exp': datetime.utcnow() + timedelta(days=1)
    }, os.getenv('JWT_SECRET', 'dev-secret-key'), algorithm='HS256')

    return jsonify({
        'token': token,
        'username': admin['username']
    })
