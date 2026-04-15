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
            updateStatistics();
        });

        container.appendChild(div);
    });
}

// 更新统计信息
function updateStatistics() {
    const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);
    const selectedCredits = courses
        .filter(c => selectedCourses.includes(c.id))
        .reduce((sum, c) => sum + c.credit, 0);
    const percentage = ((selectedCredits / totalCredits) * 100).toFixed(1);

    console.log(`已选课程学分: ${selectedCredits}/${totalCredits} (${percentage}%)`);
}

// 加载已保存的数据
async function loadCourseSurvey() {
    try {
        showLoading();
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

        hideLoading();
        renderCourses();
        updateStatistics();
    } catch (err) {
        hideLoading();
        console.error('加载失败:', err);
        renderCourses();
    }
}

// 返回按钮
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/';
});

// 提交课程调查
document.getElementById('submitBtn').addEventListener('click', async () => {
    if (selectedCourses.length === 0) {
        showToast('请至少选择一门课程');
        return;
    }

    if (!confirm('确认提交课程修读情况吗？提交后仍可修改。')) return;

    try {
        showLoading();
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

        hideLoading();

        if (response.ok) {
            showToast('提交成功');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            const error = await response.json();
            showToast('提交失败: ' + (error.error || '未知错误'));
        }
    } catch (err) {
        hideLoading();
        showToast('提交失败: ' + err.message);
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        showToast('请先登录');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        return;
    }
    loadCourseSurvey();
});
