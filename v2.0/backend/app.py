import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from db import init_db
from routes.auth import auth_bp
from routes.student import student_bp
from routes.admin import admin_bp
from routes.upload import upload_bp

load_dotenv()

app = Flask(__name__, static_folder='../frontend')
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-secret-key')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

CORS(app)

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 初始化数据库
init_db()

# 注册蓝图
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(upload_bp, url_prefix='/api/upload')

# 静态文件路由
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../frontend', path)

# 健康检查
@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': '服务运行正常'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
