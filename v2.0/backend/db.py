import sqlite3
import os
from datetime import datetime

DATABASE = os.getenv('DATABASE', 'database.db')

def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化数据库表"""
    conn = get_db()
    cursor = conn.cursor()

    # 用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            openid TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 学生信息表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS student_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            openid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            sex TEXT,
            student_id TEXT NOT NULL,
            phone TEXT,
            college TEXT,
            major TEXT,
            cet4 INTEGER,
            gpa REAL,
            downgrade TEXT,
            choice TEXT,
            phd TEXT,
            is_submitted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (openid) REFERENCES users(openid)
        )
    ''')

    # 附件表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            openid TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (openid) REFERENCES users(openid)
        )
    ''')

    # 管理员表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 课程调查表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS course_survey (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            openid TEXT UNIQUE NOT NULL,
            selected_courses TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (openid) REFERENCES users(openid)
        )
    ''')

    conn.commit()
    conn.close()
    print('数据库初始化完成')

if __name__ == '__main__':
    init_db()
