const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        openid: null,
        isSubmit: false,
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        //学生信息
        indexSex: null,
        indexPHD: null,
        indexChoice: null,
        indexDowngrade: null,
        //单项选择
        index: null,
        name: null,
        ID: null,
        phone: null,
        college: null,
        major: null,
        downgrade: null,
        choice: null,
        PHD: null,
        CET4: null,
        GPA: null,
        picker1: ['男', '女'],
        picker2: ['是', '否'],
        picker3: ['国外深造', '国内读研', '就业', '待定'],
        picker4: ['是', '否', '待定'],
        multiArray: [
            ['学院1', '学院2', '学院3'],
            ['专业11', '专业12', '专业13', '专业14', '专业15'],
        ],
        objectMultiArray: [
            [{
                    id: 0,
                    name: '学院1'
                },
                {
                    id: 1,
                    name: '学院2'
                },
                {
                    id: 2,
                    name: '学院3'
                }
            ],
            [{
                    id: 0,
                    name: '专业11'
                },
                {
                    id: 1,
                    name: '专业12'
                },
                {
                    id: 2,
                    name: '专业13'
                },
                {
                    id: 3,
                    name: '专业14'
                },
                {
                    id: 4,
                    name: '专业15'
                }
            ],
        ],
        multiIndex: [0, 0],
        time: '12:01',
        date: '2018-12-25',
        region: ['广东省', '广州市', '海珠区'],
        imgList: [],
        modalName: null,
        textareaAValue: '',
        textareaBValue: ''
    },
    onLoad: function () {
        wx.cloud.callFunction({ //调用云函数获取openid
                name: "getOpenid",
                complete: res => {
                    console.log(res);
                    this.setData({
                        openid: res.result.openid //进行筛选
                    })
                }
            }),
            console.log(app.globalData);
        // this.setData({
        //   ID: app.globalData.studentid,
        //   name: app.globalData.name
        // })
    },
    Picker1Change(e) {
        console.log(e);
        this.setData({
            indexSex: e.detail.value
        })
    },
    Picker2Change(e) {
        console.log(e);
        this.setData({
            indexDowngrade: e.detail.value
        })
    },
    Picker3Change(e) {
        console.log(e);
        this.setData({
            indexChoice: e.detail.value
        })
    },
    Picker4Change(e) {
        console.log(e);
        this.setData({
            indexPHD: e.detail.value
        })
    },
    MultiChange(e) {
        this.setData({
            multiIndex: e.detail.value
        })
    },
    MultiColumnChange(e) {
        let data = {
            multiArray: this.data.multiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        switch (e.detail.column) {
            case 0:
                switch (data.multiIndex[0]) {
                    case 0:
                        data.multiArray[1] = ['专业11', '专业12', '专业13', '专业14', '专业15'];
                        break;
                    case 1:
                        data.multiArray[1] = ['专业21', '专业22', '专业23'];
                        break;
                    case 2:
                        data.multiArray[1] = ['专业31', '专业32', '专业33'];
                        break;
                }
                data.multiIndex[1] = 0;
                break;
        }
        this.setData(data);
    },

    //从表单中获取数据
    studentFrom: function (data) {
        console.log(data.detail.value)
        this.setData({
            phone: data.detail.value.phone,
            CET4: parseInt(data.detail.value.CET4),
            GPA: Number(data.detail.value.GPA),
            sex: this.data.picker1[this.data.indexSex],
            downgrade: this.data.picker2[this.data.indexDowngrade],
            choice: this.data.picker3[this.data.indexChoice],
            PHD: this.data.picker4[this.data.indexPHD],
            // college: this.data.multiArray[0][this.data.multiIndex[0]],
            // major: this.data.multiArray[1][this.data.multiIndex[1]]
            college: data.detail.value.college,
            major: data.detail.value.major,
            name: data.detail.value.name,
            ID: data.detail.value.ID
        })
        var flag = this.data.name != null && this.data.ID != null && this.data.phone != "" && this.data.CET4 != "" && this.data.GPA != "" && this.data.sex && this.data.downgrade && this.data.choice && this.data.PHD
        // &&this.data.sex!=null &&this.data.downgrade!=null &&this.data.choice!=null &&this.data.PHD!=undefined

        if (flag && !this.data.isSubmit) {

            db.collection('student_info').add({
                // data 字段表示需新增的 JSON 数据
                data: {
                    // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                    _id: this.data.openid,
                    phone: this.data.phone,
                    CET4: this.data.CET4,
                    GPA: this.data.GPA,
                    sex: this.data.sex,
                    downgrade: this.data.downgrade,
                    choice: this.data.choice,
                    PHD: this.data.PHD,
                    college: this.data.college,
                    major: this.data.major,
                    name: this.data.name,
                    ID: this.data.ID
                },
                success: function (res) {
                    // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                    console.log(res)
                    wx.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 2000, //持续的时间
                        mask: true,
                        success: function () {
                            setTimeout(function () {
                                wx.switchTab({
                                    url: '/pages/index/indexs',
                                    success() {
                                        let page = getCurrentPages().pop(); //跳转页面成功之后
                                        if (!page) return;
                                        page.onLoad(); //如果页面存在，则重新刷新页面
                                    }
                                })
                            }, 2000);
                        }
                    })
                },
                fail: function (res) {
                    console.log(res)
                    wx.showToast({
                        title: '你已经提交过了',
                        icon: 'none',
                        duration: 3000 //持续的时间
                    })
                }
            })
        } else {
            wx.showToast({
                title: '失败，检查信息是否填写正确或是否已经提交',
                icon: 'none',
                duration: 3000 //持续的时间
            })
        }
    },
})