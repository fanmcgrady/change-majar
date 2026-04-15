#!/bin/bash

# 设置工作目录为脚本所在目录的上一级
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "====================================="
echo "开始部署 转专业系统 v2.0"
echo "工作目录: $DIR"
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

# 2. 检查并安装依赖
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
# 检查是否使用 supervisor 并且配置了 change-major
if command -v supervisorctl &> /dev/null && supervisorctl status change-major &> /dev/null; then
    echo "使用 Supervisor 重启 change-major 服务..."
    sudo supervisorctl restart change-major
    if [ $? -eq 0 ]; then
        echo "✅ Supervisor 重启成功"
    else
        echo "❌ Supervisor 重启失败"
        exit 1
    fi
else
    # 查找并杀掉只属于当前项目的 app.py 进程
    # 使用包含完整路径的正则来精确匹配
    BACKEND_DIR=$(pwd)
    echo "查找属于目录 $BACKEND_DIR 的旧进程..."
    
    # 找到运行当前目录下 app.py 的进程并杀掉
    # ps aux | grep "[p]ython.*$BACKEND_DIR/app.py" 
    # 为了兼容可能在当前目录直接运行 'python app.py' 的情况：
    PIDS=$(pgrep -f "python.*app.py" | while read pid; do
        # 检查进程的当前工作目录 (cwd) 是否是我们的 backend 目录
        if [ "$(readlink /proc/$pid/cwd 2>/dev/null)" = "$BACKEND_DIR" ]; then
            echo $pid
        fi
    done)
    
    if [ ! -z "$PIDS" ]; then
        echo "找到旧进程: $PIDS，正在终止..."
        kill $PIDS
        sleep 2
        # 如果还在运行，强制杀掉
        for pid in $PIDS; do
            if kill -0 $pid 2>/dev/null; then
                echo "强制终止进程 $pid..."
                kill -9 $pid
            fi
        done
    else
        echo "未找到运行中的旧进程"
    fi
    
    # 使用 nohup 在后台启动
    echo "使用 nohup 后台启动服务..."
    nohup python3 app.py > app.log 2>&1 &
    NEW_PID=$!
    
    # 检查是否启动成功
    sleep 2
    if kill -0 $NEW_PID 2>/dev/null; then
        echo "✅ 服务启动成功 (PID: $NEW_PID)"
    else
        echo "❌ 服务启动失败，请检查 backend/app.log"
        cat app.log
        exit 1
    fi
fi

echo "====================================="
echo "🎉 部署完成！"
echo "====================================="
