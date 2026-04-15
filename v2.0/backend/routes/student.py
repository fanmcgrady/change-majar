from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from db import get_db
from middleware.auth import token_required

student_bp = Blueprint('student', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@student_bp.route('/info', methods=['GET'])
@token_required
def get_student_info():
    """获取学生信息"""
    openid = request.openid

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM student_info WHERE openid = ?', (openid,))
    info = cursor.fetchone()
    conn.close()

    if not info:
        return jsonify({'exists': False})

    return jsonify({
        'exists': True,
        'data': dict(info)
    })

@student_bp.route('/info', methods=['POST'])
@token_required
def save_student_info():
    """保存或更新学生信息"""
    openid = request.openid
    data = request.get_json()

    required_fields = ['name', 'student_id', 'phone', 'college', 'major']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'缺少必填字段: {field}'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 检查是否已存在
    cursor.execute('SELECT id FROM student_info WHERE openid = ?', (openid,))
    existing = cursor.fetchone()

    if existing:
        # 更新
        cursor.execute('''
            UPDATE student_info SET
                name = ?, sex = ?, student_id = ?, phone = ?,
                college = ?, major = ?, cet4 = ?, gpa = ?,
                downgrade = ?, choice = ?, phd = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE openid = ?
        ''', (
            data['name'], data.get('sex'), data['student_id'], data['phone'],
            data['college'], data['major'], data.get('cet4'), data.get('gpa'),
            data.get('downgrade'), data.get('choice'), data.get('phd'),
            openid
        ))
    else:
        # 插入
        cursor.execute('''
            INSERT INTO student_info (
                openid, name, sex, student_id, phone,
                college, major, cet4, gpa,
                downgrade, choice, phd
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            openid, data['name'], data.get('sex'), data['student_id'], data['phone'],
            data['college'], data['major'], data.get('cet4'), data.get('gpa'),
            data.get('downgrade'), data.get('choice'), data.get('phd')
        ))

    conn.commit()
    conn.close()

    return jsonify({'message': '保存成功'})

@student_bp.route('/submit', methods=['POST'])
@token_required
def submit_info():
    """提交学生信息"""
    openid = request.openid

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE student_info SET is_submitted = 1 WHERE openid = ?', (openid,))
    conn.commit()
    conn.close()

    return jsonify({'message': '提交成功'})

@student_bp.route('/course-survey', methods=['GET'])
@token_required
def get_course_survey():
    """获取课程调查信息"""
    openid = request.openid

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM course_survey WHERE openid = ?', (openid,))
    survey = cursor.fetchone()
    conn.close()

    if not survey:
        return jsonify({'exists': False})

    return jsonify({
        'exists': True,
        'data': dict(survey)
    })

@student_bp.route('/course-survey', methods=['POST'])
@token_required
def save_course_survey():
    """保存或更新课程调查"""
    openid = request.openid
    data = request.get_json()

    selected_courses = data.get('selected_courses')
    if not selected_courses:
        return jsonify({'error': '请选择至少一门课程'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 检查是否已存在
    cursor.execute('SELECT id FROM course_survey WHERE openid = ?', (openid,))
    existing = cursor.fetchone()

    if existing:
        # 更新
        cursor.execute('''
            UPDATE course_survey SET
                selected_courses = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE openid = ?
        ''', (selected_courses, openid))
    else:
        # 插入
        cursor.execute('''
            INSERT INTO course_survey (openid, selected_courses)
            VALUES (?, ?)
        ''', (openid, selected_courses))

    # 同时更新学生信息的提交状态
    cursor.execute('UPDATE student_info SET is_submitted = 1 WHERE openid = ?', (openid,))

    conn.commit()
    conn.close()

    return jsonify({'message': '保存成功'})
