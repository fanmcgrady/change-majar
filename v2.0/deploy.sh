#!/bin/bash

# 设置工作目录为脚本所在目录的上一级（如果需要的话，或者直接在当前目录）
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "====================================="
echo "开始部署 转专业系统 v2.0"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "====================================="

# 1. 拉取最新代码
echo "[1/4] 正在从 Git 拉取最新代码..."
git pull origin master
if [ $? -ne 0 ]; then
    echo "❌ Git 拉取失败，请检查网络或冲突"
    exit 1
fi
echo "✅ 代码拉取成功"

# 2. 检查并安装依赖 (可选，如果没有新依赖可以注释掉)
echo "[2/4] 检查 Python 依赖..."
cd backend
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
    echo "✅ 依赖检查完成"
else
    echo "⚠️ 未找到 requirements.txt，跳过依赖安装"
fi

# 3. 确保目录存在
echo "[3/4] 检查必要目录..."
mkdir -p uploads
chmod 755 uploads
echo "✅ 目录检查完成"

# 4. 重启后端服务
echo "[4/4] 重启后端服务..."
# 检查是否使用 supervisor
if command -v supervisorctl &> /dev/null; then
    echo "使用 Supervisor 重启服务..."
    sudo supervisorctl restart change-major
    if [ $? -eq 0 ]; then
        echo "✅ Supervisor 重启成功"
    else
        echo "⚠️ Supervisor 重启失败，尝试直接查杀进程"
        pkill -f "python.*app.py"
        nohup python3 app.py > /var/log/change-major.out.log 2>&1 &
        echo "✅ 已通过 nohup 后台启动"
    fi
else
    # 查找并杀掉旧的 app.py 进程
    echo "查找旧进程..."
    pkill -f "python.*app.py"
    sleep 1
    
    # 使用 nohup 在后台启动
    echo "使用 nohup 后台启动服务..."
    nohup python3 app.py > app.log 2>&1 &
    
    # 检查是否启动成功
    sleep 2
    if pgrep -f "python.*app.py" > /dev/null; then
        echo "✅ 服务启动成功"
    else
        echo "❌ 服务启动失败，请检查 backend/app.log"
        exit 1
    fi
fi

echo "====================================="
echo "🎉 部署完成！"
echo "====================================="
