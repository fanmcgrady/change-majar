from flask import Blueprint, request, jsonify
from db import get_db
from middleware.auth import admin_required
import csv
import io

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/students', methods=['GET'])
@admin_required
def get_all_students():
    """获取所有学生信息"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    conn = get_db()
    cursor = conn.cursor()

    # 构建查询
    query = 'SELECT * FROM student_info WHERE 1=1'
    params = []

    if search:
        query += ' AND (name LIKE ? OR student_id LIKE ? OR college LIKE ?)'
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param])

    # 获取总数
    count_query = query.replace('SELECT *', 'SELECT COUNT(*)')
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]

    # 分页查询
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

@admin_bp.route('/student/<openid>', methods=['GET'])
@admin_required
def get_student_detail(openid):
    """获取学生详细信息（包括附件和课程调查）"""
    conn = get_db()
    cursor = conn.cursor()

    # 获取学生信息
    cursor.execute('SELECT * FROM student_info WHERE openid = ?', (openid,))
    student = cursor.fetchone()

    if not student:
        conn.close()
        return jsonify({'error': '学生不存在'}), 404

    # 获取附件
    cursor.execute('SELECT * FROM attachments WHERE openid = ?', (openid,))
    attachments = cursor.fetchall()

    # 获取课程调查
    cursor.execute('SELECT * FROM course_survey WHERE openid = ?', (openid,))
    course_survey = cursor.fetchone()

    # 计算课程完成百分比
    course_percentage = 0
    selected_courses_list = []
    if course_survey:
        import json
        selected_courses_list = json.loads(course_survey['selected_courses'])
        # 总学分
        total_credits = 23 + 2 + 1 + 1 + 1 + 5 + 2.5 + 4 + 1 + 2.5 + 2 + 3 + 3 + 2 + 1 + 2 + 4 + 2 + 3 + 1 + 2  # 所有课程学分总和
        # 已选课程学分
        course_credits = {
            1: 3, 2: 2, 3: 1, 4: 1, 5: 1, 6: 5, 7: 2.5, 8: 4, 9: 1, 10: 2.5,
            11: 2, 12: 3, 13: 3, 14: 2, 15: 1, 16: 2, 17: 4, 18: 2, 19: 3, 20: 1, 21: 2
        }
        selected_credits = sum(course_credits.get(cid, 0) for cid in selected_courses_list)
        course_percentage = round((selected_credits / total_credits) * 100, 1)

    conn.close()

    return jsonify({
        'student': dict(student),
        'attachments': [dict(a) for a in attachments],
        'course_survey': {
            'selected_courses': selected_courses_list,
            'percentage': course_percentage
        } if course_survey else None
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

    # 创建CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow(['姓名', '性别', '学号', '电话', '原学院', '原专业',
                     '四级成绩', '必修绩点', '是否降级', '毕业选择', '是否读博',
                     '是否提交', '创建时间', '更新时间'])

    # 写入数据
    for student in students:
        writer.writerow([
            student['name'], student['sex'], student['student_id'],
            student['phone'], student['college'], student['major'],
            student['cet4'], student['gpa'], student['downgrade'],
            student['choice'], student['phd'],
            '是' if student['is_submitted'] else '否',
            student['created_at'], student['updated_at']
        ])

    output.seek(0)
    return output.getvalue(), 200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=students.csv'
    }

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_statistics():
    """获取统计数据"""
    conn = get_db()
    cursor = conn.cursor()

    # 总人数
    cursor.execute('SELECT COUNT(*) FROM student_info')
    total = cursor.fetchone()[0]

    # 已提交人数
    cursor.execute('SELECT COUNT(*) FROM student_info WHERE is_submitted = 1')
    submitted = cursor.fetchone()[0]

    # 按学院统计
    cursor.execute('SELECT college, COUNT(*) as count FROM student_info GROUP BY college')
    by_college = [{'college': row[0], 'count': row[1]} for row in cursor.fetchall()]

    # 按毕业选择统计
    cursor.execute('SELECT choice, COUNT(*) as count FROM student_info GROUP BY choice')
    by_choice = [{'choice': row[0], 'count': row[1]} for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'total': total,
        'submitted': submitted,
        'by_college': by_college,
        'by_choice': by_choice
    })
