# 转专业信息填报系统 v2.0

基于微信网页的转专业信息填报系统，支持用户填报和管理端查看。

## 技术栈

### 后端
- Python 3.8+
- Flask
- SQLite

### 前端
- 原生 HTML/CSS/JavaScript
- WeUI (微信原生UI框架)

## 功能特性

### 用户端
- 微信 OpenID 登录
- 学生信息填报（姓名、学号、学院、专业等）
- 附件上传（图片、PDF）
- 信息修改和提交
- 已填写信息自动回显

### 管理端
- 管理员登录
- 学生信息列表查看
- 搜索功能
- 学生详情查看（包括附件）
- 数据导出（CSV格式）
- 统计数据展示

## 安装部署

### 1. 安装依赖

```bash
cd v2.0/backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
UPLOAD_FOLDER=uploads
DATABASE=database.db
```

### 3. 初始化数据库

```bash
python db.py
```

### 4. 创建管理员账号

```bash
python init_admin.py
```

### 5. 启动服务

```bash
python app.py
```

服务将运行在 `http://localhost:5000`

## 微信配置

1. 在微信公众平台配置网页授权域名
2. 修改 `frontend/js/app.js` 中的 `YOUR_APPID` 为实际的 AppID
3. 配置 `.env` 中的 `WECHAT_APPID` 和 `WECHAT_SECRET`

## 访问地址

- 用户端: `http://your-domain/`
- 管理端: `http://your-domain/admin/login.html`

## 数据库结构

### users 表
- id: 主键
- openid: 微信 OpenID
- created_at: 创建时间

### student_info 表
- id: 主键
- openid: 微信 OpenID
- name: 姓名
- sex: 性别
- student_id: 学号
- phone: 电话
- college: 原学院
- major: 原专业
- cet4: 四级成绩
- gpa: 必修绩点
- downgrade: 是否降级
- choice: 毕业选择
- phd: 是否读博
- is_submitted: 是否提交
- created_at: 创建时间
- updated_at: 更新时间

### attachments 表
- id: 主键
- openid: 微信 OpenID
- file_type: 文件类型
- file_name: 文件名
- file_path: 文件路径
- file_size: 文件大小
- created_at: 创建时间

### admins 表
- id: 主键
- username: 用户名
- password: 密码
- created_at: 创建时间

## 注意事项

1. 生产环境请修改 `JWT_SECRET` 为强密码
2. 管理员密码建议使用加密存储（当前为明文）
3. 上传文件大小限制为 16MB
4. 支持的文件格式：jpg, jpeg, png, pdf
5. 每个用户最多上传 9 个附件

## 开发说明

### API 接口

#### 认证相关
- POST `/api/auth/wechat-login` - 微信登录
- POST `/api/auth/admin-login` - 管理员登录

#### 学生相关
- GET `/api/student/info` - 获取学生信息
- POST `/api/student/info` - 保存学生信息
- POST `/api/student/submit` - 提交学生信息

#### 文件上传
- POST `/api/upload/file` - 上传文件
- GET `/api/upload/files` - 获取文件列表
- DELETE `/api/upload/file/:id` - 删除文件

#### 管理员相关
- GET `/api/admin/students` - 获取学生列表
- GET `/api/admin/student/:openid` - 获取学生详情
- GET `/api/admin/export` - 导出数据
- GET `/api/admin/statistics` - 获取统计数据

## License

MIT
