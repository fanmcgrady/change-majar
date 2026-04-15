const API_BASE = '/api';

// 获取token
function getToken() {
    return localStorage.getItem('token');
}

// 设置token
function setToken(token) {
    localStorage.setItem('token', token);
}

// API请求封装
async function request(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    // 检查响应类型
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

// 微信登录
async function wechatLogin(code) {
    return request('/auth/wechat-login', {
        method: 'POST',
        body: JSON.stringify({ code })
    });
}

// 获取学生信息
async function getStudentInfo() {
    return request('/student/info');
}

// 保存学生信息
async function saveStudentInfo(data) {
    return request('/student/info', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 提交学生信息
async function submitStudentInfo() {
    return request('/student/submit', {
        method: 'POST'
    });
}

// 上传文件
async function uploadFile(file, fileType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    const token = getToken();
    const response = await fetch(`${API_BASE}/upload/file`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了非JSON响应，可能是token失效');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || '上传失败');
    }

    return data;
}

// 获取文件列表
async function getFiles() {
    return request('/upload/files');
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
