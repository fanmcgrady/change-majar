import sqlite3
import os
from getpass import getpass

DATABASE = os.getenv('DATABASE', 'database.db')

def create_admin():
    """创建管理员账号"""
    print("=== 创建管理员账号 ===")
    username = input("请输入管理员用户名: ").strip()

    if not username:
        print("用户名不能为空")
        return

    password = getpass("请输入密码: ")
    password_confirm = getpass("请再次输入密码: ")

    if password != password_confirm:
        print("两次密码不一致")
        return

    if not password:
        print("密码不能为空")
        return

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:
        cursor.execute('INSERT INTO admins (username, password) VALUES (?, ?)',
                      (username, password))
        conn.commit()
        print(f"管理员账号 '{username}' 创建成功！")
    except sqlite3.IntegrityError:
        print(f"用户名 '{username}' 已存在")
    except Exception as e:
        print(f"创建失败: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    create_admin()
