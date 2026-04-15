from functools import wraps
from flask import request, jsonify
import jwt
import os

def token_required(f):
    """验证JWT token的装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': '缺少token'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, os.getenv('JWT_SECRET', 'dev-secret-key'), algorithms=['HS256'])
            request.openid = data['openid']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'token已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': '无效的token'}), 401

        return f(*args, **kwargs)

    return decorated

def admin_required(f):
    """验证管理员token的装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # 优先从 Header 获取，其次从 URL 参数获取（用于导出等场景）
        token = request.headers.get('Authorization')
        if not token:
            token = request.args.get('token')

        if not token:
            return jsonify({'error': '缺少token'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, os.getenv('JWT_SECRET', 'dev-secret-key'), algorithms=['HS256'])
            if data.get('role') != 'admin':
                return jsonify({'error': '需要管理员权限'}), 403
            request.admin_id = data['admin_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'token已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': '无效的token'}), 401

        return f(*args, **kwargs)

    return decorated
