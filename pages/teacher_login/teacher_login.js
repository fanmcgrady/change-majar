//index.js
//获取应用实例
let app = getApp();
// 获取云数据库引用
const db = wx.cloud.database({
env:'fangzhiyang-vaot3'
});
const admin = db.collection('teacher_user');//注意，这里就是刚才的集合的名字——user
admin.get({
  success:function(res){
    // console.log(res);
  }
})
let name = null;//变量，用于存放用户输入的账号
let password = null;//变量，用于存放用户输入的密码

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  //输入用户名
inputName: function (event) {
  name = event.detail.value//将用户输入的账号放到变量里面
},
//输入密码
inputPassword(event) {
  password = event.detail.value//将用户输入的密码放到变量里面
},
  //登录函数
  bindViewTap_login: function() {
    let that = this;
    let flag = 0;
    //登陆获取用户信息
    admin.get({
      success: (res) => {
        let user = res.data;
         console.log(res.data);
        for (let i = 0; i < user.length; i++) {  //遍历数据库对象集合
          if (name === user[i].account) { //用户名存在
            flag = flag +1;
            if (password !== user[i].password) {  //判断密码是否正确
              wx.showToast({
                title: '密码错误！！',
                icon: 'none',
                duration: 2500
              })
            } else {
              console.log('登录成功！');
              wx.navigateTo({
                url: '/pages/index/indext',//这里是成功登录后跳转的页面
              })
              wx.showToast({
                title: '登录成功！！',
                icon: 'success',
                duration: 2500
              })
            }
          } 
        }
        if (flag == 0) {   //不存在
          wx.showToast({
            title: '无此用户名!',
            icon: 'none',
            duration: 2500
          })
        }
      }
    })
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  changeText: function(){
    this.setData({
      motto:app.globalData.data
    })
}
})
