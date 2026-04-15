const API_BASE = '/api';

// API请求封装
async function request(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('student_id', studentId);

    const response = await fetch(`${API_BASE}/upload/file`, {
        method: 'POST',
        body: formData
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了非JSON响应');
    }

    const data = await response.json();

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
