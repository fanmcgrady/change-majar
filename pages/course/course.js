// pages/query/query.js
const app = getApp()
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [], //从course_info读来的课程信息
        openid: [], //用户的opneid
        click: [], //判断是否每个课程都选择了
        credit: 0 //修读的学分
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //数据库单次最多取20个数据（小程序端）
        for (var i = 0; i < 2; i++) {
            db.collection('course_info').orderBy('_id', 'asc')
                .skip(i*10)
                .limit(10)
                .get()
                .then(res => {
                    console.log(res.data)
                    for (var j = 0; j < res.data.length; j++)
                        res.data[j].finish = -1;
                    this.setData({
                        list: this.data.list.concat(res.data)
                    })
                    
                })
                .catch(err => {
                    console.error(err)
                })
        }

        wx.cloud.callFunction({ //调用云函数获取openid
            name: "getOpenid",
            complete: res => {
                this.setData({
                    openid: res.result.openid
                })
                // console.log(this.data.openid)
            }
        })
    },
    //yesClick和noClick都在list添加一个"finish"的字段，如果修读，置为1，否则置为0
    //选择"是"
    yesClick(e) {
        //变量一定要用小写且不能有下划线
        var lessonno = e.currentTarget.dataset.lessonno

        this.data.list[lessonno - 1].finish = 1
        this.data.click[lessonno - 1] = 1

        //console.log(this.data.list[lessonno-1])
    },
    //选择否
    noClick(e) {
        var lessonno = e.currentTarget.dataset.lessonno
        this.data.list[lessonno - 1].finish = 0
        this.data.click[lessonno - 1] = 1
        // console.log(this.data.click)
        //console.log(this.data.list[lessonno-1])
    },
    //从表单中获取数据
    courseFrom: function (e) {
        if (this.data.click.length != this.data.list.length) {
            wx.showToast({
                title: '所有课程都勾选后才能提交！',
                icon: 'none',
                duration: 3000 //持续的时间
            })
            return;
        }

        this.setData({
            credit: 0
        })
        console.log(this.data.list);

        db.collection('student_info').doc(this.data.openid).update({
            // data 传入需要局部更新的数据
            data: {
                //给学生添加course字段，并将list写入
                courses: this.data.list
            },
            success: function (res) {
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
            }
        })

        for (var i = 0; i < this.data.list.length; i++) {
            if (this.data.list[i].finish == 1) {
                this.data.credit += this.data.list[i].credits
            }
        }
        //更新修读的学分
        db.collection('student_info').doc(this.data.openid).update({
            data: {
                //给学生添加course字段，并将list写入
                credit: this.data.credit
            },
            success: function (res) {}
        })
    }
})