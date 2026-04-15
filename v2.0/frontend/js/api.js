const API_BASE = '/api';

// Token 管理（仅用于管理员）
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

// API请求封装
async function request(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // 如果有token，添加到请求头（用于管理员接口）
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了非JSON响应');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || '请求失败');
    }

    return data;
}

// 提交学生信息
async function saveStudentInfo(data) {
    return request('/student/info', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 上传文件
async function uploadFile(file, fileType, studentId) {
    console.log('开始上传文件:', { fileName: file.name, fileType, studentId, fileSize: file.size });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('student_id', studentId);

    console.log('发送请求到:', `${API_BASE}/upload/file`);

    const response = await fetch(`${API_BASE}/upload/file`, {
        method: 'POST',
        body: formData
    });

    console.log('收到响应:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        // 尝试读取响应文本以获取更多错误信息
        const text = await response.text();
        console.error('服务器返回非JSON响应:', text);
        throw new Error(`服务器返回了非JSON响应 (状态码: ${response.status})`);
    }

    const data = await response.json();
    console.log('解析JSON成功:', data);

    if (!response.ok) {
        throw new Error(data.error || '上传失败');
    }

    return data;
}

// 获取文件列表
async function getFiles(studentId) {
    return request(`/upload/files?student_id=${studentId}`);
}

// 删除文件
async function deleteFile(fileId) {
    return request(`/upload/file/${fileId}`, {
        method: 'DELETE'
    });
}

// 管理员登录
async function adminLogin(username, password) {
    return request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}
