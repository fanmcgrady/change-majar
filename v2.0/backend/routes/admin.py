from flask import Blueprint, request, jsonify
from db import get_db
from middleware.auth import admin_required
import csv
import io
import json

admin_bp = Blueprint('admin', __name__)

COURSE_NAMES = {
    1: '思想道德与法治', 2: '通用英语I-1/通用英语II-1', 3: '体育-1', 4: '新生研讨课',
    5: '大学生心理健康', 6: '微积分（Ⅰ）-1', 7: '计算机系统及人工智能导论', 8: '程序设计基础',
    9: '国家安全教育', 10: '离散数学', 11: '军事技能', 12: '线性代数（理工）',
    13: '中国近现代史纲要', 14: '通用英语I-2/通用英语II-2', 15: '体育-2', 16: '军事理论',
    17: '微积分（Ⅰ）-2', 18: '工程训练（Ⅰ）', 19: '数据结构与算法', 20: '网络安全管理与法律法规',
    21: '中共党史/社会主义发展史/改革开放史/新中国史/中华民族发展史'
}

COURSE_CREDITS = {
    1: 3, 2: 2, 3: 1, 4: 1, 5: 1, 6: 5, 7: 2.5, 8: 4, 9: 1, 10: 2.5,
    11: 2, 12: 3, 13: 3, 14: 2, 15: 1, 16: 2, 17: 4, 18: 2, 19: 3, 20: 1, 21: 2
}

TOTAL_CREDITS = sum(COURSE_CREDITS.values())

def calc_percentage(selected_courses_json):
    try:
        selected = json.loads(selected_courses_json)
        selected_credits = sum(COURSE_CREDITS.get(cid, 0) for cid in selected)
        return round((selected_credits / TOTAL_CREDITS) * 100, 1)
    except:
        return 0

@admin_bp.route('/students', methods=['GET'])
@admin_required
def get_all_students():
    """获取所有学生信息列表（每条记录独立显示）"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    conn = get_db()
    cursor = conn.cursor()

    query = 'SELECT * FROM student_info WHERE 1=1'
    params = []

    if search:
        query += ' AND (name LIKE ? OR student_id LIKE ? OR college LIKE ?)'
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param])

    count_query = query.replace('SELECT *', 'SELECT COUNT(*)')
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.extend([per_page, (page - 1) * per_page])

    cursor.execute(query, params)
    students = cursor.fetchall()
    conn.close()

    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'data': [dict(s) for s in students]
    })

@admin_bp.route('/student/<int:record_id>', methods=['GET'])
@admin_required
def get_student_detail(record_id):
    """获取单条提交记录详情"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM student_info WHERE id = ?', (record_id,))
    student = cursor.fetchone()

    if not student:
        conn.close()
        return jsonify({'error': '记录不存在'}), 404

    student_id = student['student_id']

    # 获取该条记录对应的课程调查
    cursor.execute('SELECT * FROM course_survey WHERE record_id = ?', (record_id,))
    survey = cursor.fetchone()

    # 获取该学号所有附件
    cursor.execute('SELECT * FROM attachments WHERE student_id = ? ORDER BY created_at DESC', (student_id,))
    attachments = cursor.fetchall()

    conn.close()

    course_survey_data = None
    if survey:
        selected_courses = json.loads(survey['selected_courses'])
        percentage = calc_percentage(survey['selected_courses'])
        course_survey_data = {
            'selected_courses': selected_courses,
            'percentage': percentage
        }

    return jsonify({
        'student': dict(student),
        'attachments': [dict(a) for a in attachments],
        'course_survey': course_survey_data
    })

@admin_bp.route('/export', methods=['GET'])
@admin_required
def export_students():
    """导出学生信息为CSV"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM student_info ORDER BY created_at DESC')
    students = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(['姓名', '性别', '学号', '电话', '原学院', '原专业',
                     '四级成绩', '必修绩点', '是否降级', '毕业选择', '是否读博', '提交时间'])

    for student in students:
        writer.writerow([
            student['name'], student['sex'], student['student_id'],
            student['phone'], student['college'], student['major'],
            student['cet4'], student['gpa'], student['downgrade'],
            student['choice'], student['phd'], student['created_at']
        ])

    output.seek(0)
    return output.getvalue(), 200, {
        'Content-Type': 'text/csv; charset=utf-8-sig',
        'Content-Disposition': 'attachment; filename=students.csv'
    }

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_statistics():
    """获取统计数据"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM student_info')
    total = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(DISTINCT student_id) FROM student_info')
    unique_students = cursor.fetchone()[0]

    cursor.execute('SELECT college, COUNT(*) as count FROM student_info GROUP BY college')
    by_college = [{'college': row[0], 'count': row[1]} for row in cursor.fetchall()]

    cursor.execute('SELECT choice, COUNT(*) as count FROM student_info GROUP BY choice')
    by_choice = [{'choice': row[0], 'count': row[1]} for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'total': total,
        'submitted': total,
        'unique_students': unique_students,
        'by_college': by_college,
        'by_choice': by_choice
    })
