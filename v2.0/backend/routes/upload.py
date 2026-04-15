from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from db import get_db

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/file', methods=['POST'])
def upload_file():
    """上传文件"""
    student_id = request.form.get('student_id')
    if not student_id:
        return jsonify({'error': '缺少学号'}), 400

    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400

    file = request.files['file']
    file_type = request.form.get('file_type', 'other')

    if file.filename == '':
        return jsonify({'error': '文件名为空'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': '只支持PDF格式'}), 400

    filename = secure_filename(file.filename)
    timestamp = int(datetime.now().timestamp())
    new_filename = f"{student_id}_{timestamp}_{filename}"

    upload_folder = os.getenv('UPLOAD_FOLDER', 'uploads')
    filepath = os.path.join(upload_folder, new_filename)

    file.save(filepath)
    file_size = os.path.getsize(filepath)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO attachments (student_id, file_type, file_name, file_path, file_size)
        VALUES (?, ?, ?, ?, ?)
    ''', (student_id, file_type, filename, new_filename, file_size))
    conn.commit()
    file_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': '上传成功',
        'file_id': file_id,
        'file_path': f'/uploads/{new_filename}'
    })

@upload_bp.route('/files', methods=['GET'])
def get_files():
    """获取学生上传的文件列表"""
    student_id = request.args.get('student_id')
    if not student_id:
        return jsonify({'files': []})

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM attachments WHERE student_id = ? ORDER BY created_at DESC', (student_id,))
    files = cursor.fetchall()
    conn.close()

    return jsonify({'files': [dict(f) for f in files]})

@upload_bp.route('/file/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """删除文件"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM attachments WHERE id = ?', (file_id,))
    file = cursor.fetchone()

    if not file:
        conn.close()
        return jsonify({'error': '文件不存在'}), 404

    upload_folder = os.getenv('UPLOAD_FOLDER', 'uploads')
    filepath = os.path.join(upload_folder, file['file_path'])
    if os.path.exists(filepath):
        os.remove(filepath)

    cursor.execute('DELETE FROM attachments WHERE id = ?', (file_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': '删除成功'})
