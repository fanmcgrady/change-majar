from flask import Blueprint, request, jsonify
from db import get_db
import json

student_bp = Blueprint('student', __name__)

@student_bp.route('/info', methods=['GET'])
def get_student_info():
    """根据学号获取学生信息（取最新一条）"""
    student_id = request.args.get('student_id')
    if not student_id:
        return jsonify({'exists': False})

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM student_info WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', (student_id,))
    info = cursor.fetchone()

    survey = None
    if info:
        cursor.execute('SELECT * FROM course_survey WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', (student_id,))
        survey = cursor.fetchone()

    conn.close()

    if not info:
        return jsonify({'exists': False})

    return jsonify({
        'exists': True,
        'data': dict(info),
        'survey': dict(survey) if survey else None
    })

@student_bp.route('/info', methods=['POST'])
def save_student_info():
    """保存学生信息（每次都新增一条记录）"""
    data = request.get_json()

    required_fields = ['name', 'student_id', 'phone', 'college', 'major']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'缺少必填字段: {field}'}), 400

    selected_courses = data.get('selected_courses')

    conn = get_db()
    cursor = conn.cursor()

    # 每次都插入新记录
    cursor.execute('''
        INSERT INTO student_info (
            student_id, name, sex, phone,
            college, major, cet4, gpa,
            downgrade, choice, phd, is_submitted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ''', (
        data['student_id'], data['name'], data.get('sex'), data['phone'],
        data['college'], data['major'], data.get('cet4'), data.get('gpa'),
        data.get('downgrade'), data.get('choice'), data.get('phd')
    ))
    record_id = cursor.lastrowid

    # 保存课程调查
    if selected_courses:
        cursor.execute('''
            INSERT INTO course_survey (student_id, record_id, selected_courses)
            VALUES (?, ?, ?)
        ''', (data['student_id'], record_id, selected_courses))

    conn.commit()
    conn.close()

    return jsonify({'message': '提交成功', 'record_id': record_id})
