// index.js
// 获取应用实例
const app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    isHide: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },  
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function() {
    var that = this;
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    that.setData({
      isHide: true
  });
    // 查看是否授权
    // wx.getSetting({
    //     success: function(res) {
    //       console.log(res);
    //         if (res.authSetting['scope.userInfo']) {
    //             wx.getUserInfo({
    //                 success: function(res) {
    //                     // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
    //                     // 根据自己的需求有其他操作再补充
    //                     // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
    //                     console.log(res);
    //                     wx.login({
    //                         success: res => {
    //                             // 获取到用户的 code 之后：res.code
    //                             console.log("用户的code:" + res.code);
    //                         }
    //                     });
    //                 }
    //             });
    //         } 
    //         else {
    //             // 用户没有授权
    //             // 改变 isHide 的值，显示授权页面
    //             that.setData({
    //                 isHide: true
    //             });
    //         }
    //     }
    // });
},
getUserProfile(e) {
  console.log(e)
  // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
  // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  wx.getUserProfile({
    desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    success: (res) => {
      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true,
        isHide:true
      });
      app.globalData.userInfo = res.userInfo;
      wx.setStorageSync('userInfo', res.userInfo);
      wx.redirectTo({
        url: '/pages/login_stu_or_teacher/login_stu_or_teacher',
      });
    }
  })
},
bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
        //用户按了允许授权按钮
        var that = this;
        // 获取到用户的信息了，打印到控制台上看下
        console.log("用户的信息如下：");
        console.log(e.detail.userInfo);
        //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
        that.setData({
            isHide: false
        });
        wx.switchTab({
          url: '/pages/login_stu_or_teacher/login_stu_or_teacher',
        });
    } else {
        //用户按了拒绝按钮
        wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!',
            showCancel: false,
            confirmText: '返回授权',
            success: function(res) {
                // 用户没有授权成功，不需要改变 isHide 的值
                if (res.confirm) {
                    console.log('用户点击了“返回授权”');
                }
            }
        });
    }
},

  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
