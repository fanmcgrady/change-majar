// 管理员API
async function getStudents(page = 1, search = '') {
    const params = new URLSearchParams({ page, per_page: 20 });
    if (search) params.append('search', search);
    return request(`/admin/students?${params}`);
}

async function getStudentDetail(recordId) {
    return request(`/admin/student/${recordId}`);
}

async function getStatistics() {
    return request('/admin/statistics');
}

async function exportData() {
    const token = getToken();
    window.open(`/api/admin/export?token=${token}`, '_blank');
}

let currentPage = 1;
let searchKeyword = '';
let isLoading = false;

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

function showLoading() {
    document.getElementById('loadmore').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadmore').style.display = 'none';
}

// 检查登录状态
function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 加载统计数据
async function loadStatistics() {
    try {
        const stats = await getStatistics();
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('submittedCount').textContent = stats.submitted;
    } catch (err) {
        showToast('加载统计失败: ' + err.message);
    }
}

// 加载学生列表
async function loadStudents(append = false) {
    if (isLoading) return;

    try {
        isLoading = true;
        showLoading();

        const result = await getStudents(currentPage, searchKeyword);
        hideLoading();

        const container = document.getElementById('studentList');
        if (!append) {
            container.innerHTML = '';
        }

        if (result.data.length === 0) {
            if (!append) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">暂无数据</div>';
            }
            isLoading = false;
            return;
        }

        result.data.forEach(student => {
            const item = createStudentItem(student);
            container.appendChild(item);
        });

        isLoading = false;
    } catch (err) {
        hideLoading();
        isLoading = false;
        showToast('加载失败: ' + err.message);
        if (err.message.includes('token')) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// 创建学生列表项
function createStudentItem(student) {
    const div = document.createElement('div');
    div.className = 'student-item';
    div.onclick = () => showStudentDetail(student.id);

    div.innerHTML = `
        <div class="student-name">
            ${student.name} <span class="badge badge-success">已提交</span>
        </div>
        <div class="student-info">
            学号: ${student.student_id}<br>
            学院: ${student.college} | 专业: ${student.major}<br>
            电话: ${student.phone}<br>
            四级: ${student.cet4 || '-'} | 绩点: ${student.gpa || '-'}<br>
            提交时间: ${student.created_at}
        </div>
    `;

    return div;
}

// 显示学生详情
async function showStudentDetail(openid) {
    try {
        showLoading();
        const result = await getStudentDetail(openid);
        hideLoading();

        const student = result.student;
        const attachments = result.attachments;
        const courseSurvey = result.course_survey;

        let attachmentHtml = '';
        if (attachments.length > 0) {
            attachmentHtml = '<div style="margin-top: 10px;"><strong>附件:</strong><br>';
            attachments.forEach(att => {
                const typeNames = {
                    'transcript': '可信电子成绩单',
                    'cet4_certificate': '四级考试成绩单',
                    'other': '其他证明材料'
                };
                const typeName = typeNames[att.file_type] || att.file_type;
                // 使用原始文件名作为下载文件名
                attachmentHtml += `<a href="/uploads/${att.file_path}" target="_blank" download="${att.file_name}" style="display: block; margin: 5px 0;">${typeName}: ${att.file_name}</a>`;
            });
            attachmentHtml += '</div>';
        }

        let courseSurveyHtml = '';
        if (courseSurvey) {
            const courseNames = {
                1: '思想道德与法治', 2: '通用英语I-1/通用英语II-1', 3: '体育-1', 4: '新生研讨课',
                5: '大学生心理健康', 6: '微积分（Ⅰ）-1', 7: '计算机系统及人工智能导论', 8: '程序设计基础',
                9: '国家安全教育', 10: '离散数学', 11: '军事技能', 12: '线性代数（理工）',
                13: '中国近现代史纲要', 14: '通用英语I-2/通用英语II-2', 15: '体育-2', 16: '军事理论',
                17: '微积分（Ⅰ）-2', 18: '工程训练（Ⅰ）', 19: '数据结构与算法', 20: '网络安全管理与法律法规',
                21: '中共党史/社会主义发展史/改革开放史/新中国史/中华民族发展史'
            };

            courseSurveyHtml = '<div style="margin-top: 10px;"><strong>课程修读情况:</strong><br>';
            courseSurveyHtml += `<p style="color: ${courseSurvey.percentage >= 70 ? '#1aad19' : '#e64340'};">完成度: ${courseSurvey.percentage}%</p>`;
            if (courseSurvey.percentage < 70) {
                courseSurveyHtml += '<p style="color: #e64340;">⚠️ 未达70%，需要降级</p>';
            }
            courseSurveyHtml += '<p>已修读课程:</p><ul style="margin: 5px 0; padding-left: 20px;">';
            courseSurvey.selected_courses.forEach(cid => {
                courseSurveyHtml += `<li>${courseNames[cid] || '未知课程'}</li>`;
            });
            courseSurveyHtml += '</ul></div>';
        } else {
            courseSurveyHtml = '<div style="margin-top: 10px; color: #999;"><strong>课程修读情况:</strong> 未填写</div>';
        }

        const content = `
            <div style="text-align: left; padding: 10px;">
                <p><strong>姓名:</strong> ${student.name}</p>
                <p><strong>性别:</strong> ${student.sex || '-'}</p>
                <p><strong>学号:</strong> ${student.student_id}</p>
                <p><strong>电话:</strong> ${student.phone}</p>
                <p><strong>原学院:</strong> ${student.college}</p>
                <p><strong>原专业:</strong> ${student.major}</p>
                <p><strong>四级成绩:</strong> ${student.cet4 || '-'}</p>
                <p><strong>必修绩点:</strong> ${student.gpa || '-'}</p>
                <p><strong>是否降级:</strong> ${student.downgrade || '-'}</p>
                <p><strong>毕业选择:</strong> ${student.choice || '-'}</p>
                <p><strong>是否读博:</strong> ${student.phd || '-'}</p>
                <p><strong>提交状态:</strong> ${student.is_submitted ? '已提交' : '未提交'}</p>
                ${courseSurveyHtml}
                ${attachmentHtml}
            </div>
        `;

        showDialog('学生详情', content);
    } catch (err) {
        hideLoading();
        showToast('加载详情失败: ' + err.message);
    }
}

// 显示对话框
function showDialog(title, content) {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <div class="weui-mask" onclick="this.parentElement.remove()"></div>
        <div class="weui-dialog">
            <div class="weui-dialog__hd"><strong class="weui-dialog__title">${title}</strong></div>
            <div class="weui-dialog__bd">${content}</div>
            <div class="weui-dialog__ft">
                <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" onclick="this.parentElement.parentElement.parentElement.remove()">确定</a>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

// 搜索
let searchTimer;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        searchKeyword = e.target.value.trim();
        currentPage = 1;
        loadStudents(false);
    }, 500);
});

// 导出
document.getElementById('exportBtn').addEventListener('click', () => {
    exportData();
    showToast('开始导出');
});

// 退出登录
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('确认退出登录吗？')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});

// 滚动加载更多
window.addEventListener('scroll', () => {
    if (isLoading) return;

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
        currentPage++;
        loadStudents(true);
    }
});

// 初始化
if (checkAuth()) {
    loadStatistics();
    loadStudents();
}
