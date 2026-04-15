# 生产环境部署指南

## 部署前检查清单

### 1. 环境配置
确保 `.env` 文件配置正确：
```bash
PORT=5000
JWT_SECRET=your_strong_secret_key_here  # 请修改为强密码
WECHAT_APPID=wxa4be31314a5d84be
WECHAT_SECRET=9186255df3567447b7a78c73e406176d
UPLOAD_FOLDER=uploads
DATABASE=database.db
```

### 2. 微信公众平台配置
1. 登录微信公众平台
2. 设置 -> 公众号设置 -> 功能设置
3. 配置网页授权域名为你的服务器域名（如：yourdomain.com）
4. 下载验证文件并放到 `frontend` 目录

### 3. 前端配置
确认 `frontend/js/app.js` 中：
- `DEV_MODE = false` （已设置）
- 微信 appid 已正确配置

### 4. 后端配置
确认 `backend/app.py` 中：
- `debug=False` （已设置）

## 部署步骤

### 方式一：直接运行（适合测试）

```bash
cd v2.0/backend
python app.py
```

### 方式二：使用 Gunicorn（推荐生产环境）

1. 安装 Gunicorn：
```bash
pip install gunicorn
```

2. 启动服务：
```bash
cd v2.0/backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 方式三：使用 Supervisor 守护进程

1. 安装 Supervisor：
```bash
sudo apt-get install supervisor
```

2. 创建配置文件 `/etc/supervisor/conf.d/change-major.conf`：
```ini
[program:change-major]
directory=/path/to/v2.0/backend
command=/usr/bin/python3 app.py
user=your_user
autostart=true
autorestart=true
stderr_logfile=/var/log/change-major.err.log
stdout_logfile=/var/log/change-major.out.log
```

3. 启动服务：
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start change-major
```

### 方式四：使用 Nginx 反向代理

1. 安装 Nginx：
```bash
sudo apt-get install nginx
```

2. 创建 Nginx 配置 `/etc/nginx/sites-available/change-major`：
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 重要：设置上传文件大小限制为 16MB
    client_max_body_size 16M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 上传超时设置
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

3. 启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/change-major /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 安全建议

1. **修改 JWT_SECRET**：使用强随机密码
2. **HTTPS**：使用 Let's Encrypt 配置 SSL 证书
3. **防火墙**：只开放必要端口（80, 443）
4. **备份数据库**：定期备份 `database.db`
5. **日志监控**：监控错误日志和访问日志

## 管理员账号

默认管理员账号：
- 用户名：admin
- 密码：admin123

**重要**：部署后请立即修改管理员密码！

```bash
cd v2.0/backend
sqlite3 database.db "UPDATE admins SET password='new_password' WHERE username='admin';"
```

## 访问地址

- 用户端：http://yourdomain.com/
- 管理端：http://yourdomain.com/admin/login.html

## 故障排查

### 1. 微信登录失败
- 检查 WECHAT_APPID 和 WECHAT_SECRET 是否正确
- 检查微信公众平台的网页授权域名配置
- 查看后端日志

### 2. 文件上传失败
- 检查 uploads 目录是否存在且有写权限：`chmod 755 uploads`
- 检查 Nginx client_max_body_size 配置（需要设置为 16M 或更大）
- 检查 Nginx 错误日志：`tail -f /var/log/nginx/error.log`
- 如果提示"服务器返回了非JSON响应"，通常是 Nginx 配置问题或后端异常
- 确保 Nginx 配置中包含上传超时设置（proxy_read_timeout 等）

### 3. 数据库错误
- 检查 database.db 文件权限
- 确保运行 `python db.py` 初始化数据库

## 维护命令

```bash
# 查看日志
tail -f /var/log/change-major.out.log

# 重启服务
sudo supervisorctl restart change-major

# 备份数据库
cp database.db database.db.backup.$(date +%Y%m%d)

# 导出学生数据
# 访问管理后台，点击"导出"按钮
```
