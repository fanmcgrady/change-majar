let uploadedFiles = {
    transcript: [],
    cet4_certificate: [],
    other: []
};

// 课程数据
const courses = [
    { id: 1, name: '思想道德与法治', code: '107421030', credit: 3, college: '马克思主义学院', semester: '1秋' },
    { id: 2, name: '通用英语I-1/通用英语II-1', code: '105799020/105801020', credit: 2, college: '外国语学院', semester: '1秋' },
    { id: 3, name: '体育-1', code: '888004010', credit: 1, college: '体育学院', semester: '1秋' },
    { id: 4, name: '新生研讨课', code: '314030010', credit: 1, college: '网络空间安全学院', semester: '1秋' },
    { id: 5, name: '大学生心理健康', code: '912002010', credit: 1, college: '心理健康中心', semester: '1秋' },
    { id: 6, name: '微积分（Ⅰ）-1', code: '201137050', credit: 5, college: '数学学院', semester: '1秋' },
    { id: 7, name: '计算机系统及人工智能导论', code: '314102025', credit: 2.5, college: '网络空间安全学院', semester: '1秋' },
    { id: 8, name: '程序设计基础', code: '314031040', credit: 4, college: '网络空间安全学院', semester: '1秋' },
    { id: 9, name: '国家安全教育', code: '107482010', credit: 1, college: '马克思主义学院', semester: '1秋' },
    { id: 10, name: '离散数学', code: '314090025', credit: 2.5, college: '网络空间安全学院', semester: '1秋' },
    { id: 11, name: '军事技能', code: '900005020', credit: 2, college: '武装部', semester: '1秋' },
    { id: 12, name: '线性代数（理工）', code: '201080030', credit: 3, college: '数学学院', semester: '1春' },
    { id: 13, name: '中国近现代史纲要', code: '107060030', credit: 3, college: '马克思主义学院', semester: '1春' },
    { id: 14, name: '通用英语I-2/通用英语II-2', code: '105800020/105802020', credit: 2, college: '外国语学院', semester: '1春' },
    { id: 15, name: '体育-2', code: '888005010', credit: 1, college: '体育学院', semester: '1春' },
    { id: 16, name: '军事理论', code: '900004020', credit: 2, college: '武装部', semester: '1春' },
    { id: 17, name: '微积分（Ⅰ）-2', code: '201138040', credit: 4, college: '数学学院', semester: '1春' },
    { id: 18, name: '工程训练（Ⅰ）', code: '905006020', credit: 2, college: '工程训练中心', semester: '1春' },
    { id: 19, name: '数据结构与算法', code: '314092030', credit: 3, college: '网络空间安全学院', semester: '1春' },
    { id: 20, name: '网络安全管理与法律法规', code: '314034010', credit: 1, college: '网络空间安全学院', semester: '1春' },
    { id: 21, name: '中共党史/社会主义发展史/改革开放史/新中国史/中华民族发展史', code: '107418020/107419020/102620020/106812020/106844020', credit: 2, college: '马克思主义学院/马克思主义学院/经济学院/历史文化学院/历史文化学院', semester: '1春' }
];

let selectedCourses = [];
let isSubmitted = false;

// 显示提示
function showToast(msg, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

// 显示加载中
function showLoading() {
    document.getElementById('loadingToast').style.display = 'block';
}

// 隐藏加载中
function hideLoading() {
    document.getElementById('loadingToast').style.display = 'none';
}

// 开发模式配置
const DEV_MODE = false; // 开发环境设为 true，生产环境设为 false
const DEV_OPENID = 'test_openid_123'; // 测试用的 openid

// 初始化微信JS-SDK
function initWechat() {
    // 开发模式：跳过微信登录
    if (DEV_MODE) {
        if (!getToken()) {
            // 模拟登录，生成测试 token
            showLoading();
            // 直接调用后端登录接口，使用测试 openid
            fetch('/api/auth/wechat-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: 'dev_mode', openid: DEV_OPENID })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    setToken(data.token);
                    hideLoading();
                    loadStudentInfo();
                } else {
                    throw new Error('登录失败');
                }
            })
            .catch(err => {
                hideLoading();
                showToast('开发模式登录失败: ' + err.message);
            });
        } else {
            loadStudentInfo();
        }
        return;
    }

    // 生产模式：正常微信登录流程
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !getToken()) {
        // 使用code登录
        showLoading();
        wechatLogin(code)
            .then(data => {
                setToken(data.token);
                hideLoading();
                loadStudentInfo();
                // 清除URL中的code参数
                window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch(err => {
                hideLoading();
                showToast('登录失败: ' + err.message);
            });
    } else if (getToken()) {
        // 已有token，直接加载数据
        loadStudentInfo();
    } else {
        // 跳转到微信授权页面
        const appid = 'wxa4be31314a5d84be'; // 微信appid
        const redirect_uri = encodeURIComponent(window.location.href);
        const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`;
        window.location.href = authUrl;
    }
}

// 加载学生信息
async function loadStudentInfo() {
    try {
        showLoading();
        const result = await getStudentInfo();

        if (result.exists) {
            fillForm(result.data);
            isSubmitted = result.data.is_submitted === 1;
        }

        // 加载课程调查
        await loadCourseSurvey();

        // 加载已上传的文件
        loadFiles();

        // 更新按钮文字
        updateSubmitButton();

        hideLoading();
    } catch (err) {
        hideLoading();
        // 如果是token错误，在开发模式下重新登录
        if (DEV_MODE && (err.message.includes('token') || err.message.includes('非JSON'))) {
            localStorage.removeItem('token');
            location.reload();
            return;
        }
        showToast('加载失败: ' + err.message);
    }
}

// 加载课程调查
async function loadCourseSurvey() {
    try {
        const response = await fetch('/api/student/course-survey', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.exists && result.data.selected_courses) {
                selectedCourses = JSON.parse(result.data.selected_courses);
            }
        }

        renderCourses();
    } catch (err) {
        console.error('加载课程调查失败:', err);
        renderCourses();
    }
}

// 渲染课程列表
function renderCourses() {
    const container = document.getElementById('courseList');
    container.innerHTML = '';

    courses.forEach(course => {
        const isChecked = selectedCourses.includes(course.id);

        const div = document.createElement('div');
        div.className = 'weui-cell weui-cell_switch';
        div.innerHTML = `
            <div class="weui-cell__bd">
                <div class="course-header">
                    <span class="course-name">${course.name}</span>
                </div>
                <div class="course-info">
                    课程号: ${course.code} | 学分: ${course.credit} | ${course.semester}
                </div>
            </div>
            <div class="weui-cell__ft">
                <input class="weui-switch" type="checkbox" ${isChecked ? 'checked' : ''} data-course-id="${course.id}">
            </div>
        `;

        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!selectedCourses.includes(course.id)) {
                    selectedCourses.push(course.id);
                }
            } else {
                selectedCourses = selectedCourses.filter(id => id !== course.id);
            }
            updateCourseProgress();
        });

        container.appendChild(div);
    });

    updateCourseProgress();
}

// 更新课程完成进度
function updateCourseProgress() {
    const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);
    const selectedCredits = courses
        .filter(c => selectedCourses.includes(c.id))
        .reduce((sum, c) => sum + c.credit, 0);
    const percentage = Math.round((selectedCredits / totalCredits) * 100);

    // 更新进度条
    const progressBar = document.getElementById('courseProgressBar');
    const percentageText = document.getElementById('coursePercentage');

    if (progressBar && percentageText) {
        progressBar.style.width = percentage + '%';
        percentageText.textContent = percentage + '%';

        // 根据百分比改变颜色
        let color;
        if (percentage < 50) {
            color = '#e64340'; // 红色
        } else if (percentage < 70) {
            color = '#ffa500'; // 橙色
        } else {
            color = '#1aad19'; // 绿色
        }

        progressBar.style.background = color;
        percentageText.style.color = color;
    }
}

// 更新提交按钮文字
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    if (isSubmitted) {
        submitBtn.textContent = '修改';
        submitBtn.className = 'weui-btn weui-btn_warn';
    } else {
        submitBtn.textContent = '提交';
        submitBtn.className = 'weui-btn weui-btn_primary';
    }
}

// 填充表单
function fillForm(data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('sex').value = data.sex || '';
    document.getElementById('student_id').value = data.student_id || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('college').value = data.college || '';
    document.getElementById('major').value = data.major || '';
    document.getElementById('cet4').value = data.cet4 || '';
    document.getElementById('gpa').value = data.gpa || '';
    document.getElementById('downgrade').value = data.downgrade || '';
    document.getElementById('choice').value = data.choice || '';
    document.getElementById('phd').value = data.phd || '';
}

// 获取表单数据
function getFormData() {
    return {
        name: document.getElementById('name').value.trim(),
        sex: document.getElementById('sex').value,
        student_id: document.getElementById('student_id').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        college: document.getElementById('college').value.trim(),
        major: document.getElementById('major').value.trim(),
        cet4: document.getElementById('cet4').value || null,
        gpa: document.getElementById('gpa').value || null,
        downgrade: document.getElementById('downgrade').value,
        choice: document.getElementById('choice').value,
        phd: document.getElementById('phd').value
    };
}

// 验证表单
function validateForm(data) {
    if (!data.name) {
        showToast('请输入姓名');
        return false;
    }
    if (!data.sex) {
        showToast('请选择性别');
        return false;
    }
    if (!data.student_id) {
        showToast('请输入学号');
        return false;
    }
    if (!data.phone) {
        showToast('请输入电话');
        return false;
    }
    if (!data.college) {
        showToast('请输入原学院');
        return false;
    }
    if (!data.major) {
        showToast('请输入原专业');
        return false;
    }
    if (!data.cet4) {
        showToast('请输入四级成绩');
        return false;
    }
    if (!data.gpa) {
        showToast('请输入必修绩点');
        return false;
    }
    if (!data.downgrade) {
        showToast('请选择是否同意降级');
        return false;
    }
    if (!data.choice) {
        showToast('请选择毕业选择');
        return false;
    }
    if (!data.phd) {
        showToast('请选择是否攻读博士');
        return false;
    }
    return true;
}

// 提交
document.getElementById('submitBtn').addEventListener('click', async () => {
    const data = getFormData();
    if (!validateForm(data)) return;

    // 验证必填附件
    if (uploadedFiles.transcript.length === 0) {
        showToast('请上传可信电子成绩单');
        return;
    }

    if (uploadedFiles.cet4_certificate.length === 0) {
        showToast('请上传四级考试成绩单');
        return;
    }

    if (selectedCourses.length === 0) {
        showToast('请至少选择一门课程');
        return;
    }

    const confirmMsg = isSubmitted ? '确认修改信息吗？' : '确认提交吗？';
    if (!confirm(confirmMsg)) return;

    try {
        showLoading();
        // 保存基本信息
        await saveStudentInfo(data);
        // 保存课程调查
        const response = await fetch('/api/student/course-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                selected_courses: JSON.stringify(selectedCourses)
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '提交失败');
        }

        hideLoading();
        showToast(isSubmitted ? '修改成功' : '提交成功');
        isSubmitted = true;
        updateSubmitButton();
    } catch (err) {
        hideLoading();
        showToast('操作失败: ' + err.message);
    }
});

// 文件上传 - 可信电子成绩单
document.getElementById('transcriptInput').addEventListener('change', async (e) => {
    await handleFileUpload(e, 'transcript', 'transcriptFiles', 'transcript-count', 1);
});

// 文件上传 - 四级考试成绩单
document.getElementById('cet4Input').addEventListener('change', async (e) => {
    await handleFileUpload(e, 'cet4_certificate', 'cet4Files', 'cet4-count', 1);
});

// 文件上传 - 其他证明材料
document.getElementById('otherInput').addEventListener('change', async (e) => {
    await handleFileUpload(e, 'other', 'otherFiles', 'other-count', 1);
});

// 统一的文件上传处理函数
async function handleFileUpload(e, fileType, containerId, countId, maxFiles) {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // 检查是否已达到上传限制
    if (uploadedFiles[fileType].length >= maxFiles) {
        showToast(`${getFileTypeName(fileType)}最多上传${maxFiles}个文件，请先删除已有文件`);
        e.target.value = '';
        return;
    }

    const file = files[0]; // 只取第一个文件

    // 验证文件格式
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showToast('只能上传PDF格式文件');
        e.target.value = '';
        return;
    }

    try {
        showLoading();
        const result = await uploadFile(file, fileType);
        hideLoading();

        uploadedFiles[fileType].push({
            id: result.file_id,
            name: file.name,
            path: result.file_path
        });

        renderFiles(fileType, containerId, countId);
        showToast('上传成功');
    } catch (err) {
        hideLoading();
        // 如果是token错误，在开发模式下重新登录
        if (DEV_MODE && (err.message.includes('token') || err.message.includes('非JSON'))) {
            showToast('登录已过期，正在重新登录...');
            localStorage.removeItem('token');
            setTimeout(() => location.reload(), 1500);
            return;
        }
        showToast('上传失败: ' + err.message);
    }

    e.target.value = '';
}

// 获取文件类型名称
function getFileTypeName(fileType) {
    const names = {
        'transcript': '可信电子成绩单',
        'cet4_certificate': '四级考试成绩单',
        'other': '其他证明材料'
    };
    return names[fileType] || '文件';
}

// 加载文件列表
async function loadFiles() {
    try {
        const result = await getFiles();

        // 按类型分组
        uploadedFiles = {
            transcript: [],
            cet4_certificate: [],
            other: []
        };

        result.files.forEach(f => {
            const fileType = f.file_type || 'other';
            if (uploadedFiles[fileType]) {
                uploadedFiles[fileType].push({
                    id: f.id,
                    name: f.file_name,
                    path: `/uploads/${f.file_path}`
                });
            }
        });

        renderFiles('transcript', 'transcriptFiles', 'transcript-count');
        renderFiles('cet4_certificate', 'cet4Files', 'cet4-count');
        renderFiles('other', 'otherFiles', 'other-count');
    } catch (err) {
        console.error('加载文件失败:', err);
    }
}

// 渲染文件列表
function renderFiles(fileType, containerId, countId) {
    const container = document.getElementById(containerId);
    const files = uploadedFiles[fileType] || [];
    container.innerHTML = '';

    files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'weui-uploader__file';
        li.style.backgroundSize = 'contain';
        li.style.backgroundRepeat = 'no-repeat';
        li.style.backgroundPosition = 'center';
        li.innerHTML = '<div style="padding: 10px; font-size: 12px; text-align: center;">PDF</div>';

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'weui-uploader__file-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => deleteFileHandler(file.id, fileType, containerId, countId);

        li.appendChild(deleteBtn);
        container.appendChild(li);
    });

    document.getElementById(countId).textContent = files.length;
}

// 删除文件
async function deleteFileHandler(fileId, fileType, containerId, countId) {
    if (!confirm('确认删除该文件吗？')) return;

    try {
        showLoading();
        await deleteFile(fileId);
        hideLoading();
        uploadedFiles[fileType] = uploadedFiles[fileType].filter(f => f.id !== fileId);
        renderFiles(fileType, containerId, countId);
        showToast('删除成功');
    } catch (err) {
        hideLoading();
        showToast('删除失败: ' + err.message);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initWechat();
});
