//app.js

App({
    onLaunch: function () {
        //云环境初始化
        wx.cloud.init({
            env: 'cloud1-6guiwkxn5ce7075f',
            traceUser: true
        });
        let that = this;
        let temp_userInfo = wx.getStorageSync('userInfo') || null;
        if (that.isJson(temp_userInfo) || temp_userInfo == null) {} else {
            temp_userInfo = JSON.parse(temp_userInfo);
        }
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        // wx.login({
        //   success: res => {
        //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //   }
        // })
        console.log(temp_userInfo);
        if ((temp_userInfo == null)) { //读取缓存失效
            wx.redirectTo({
                url: '/pages/auth/index',
            });
        } else {
            this.globalData.userInfo = temp_userInfo;
        }
        // 获取用户信息
        // wx.getSetting({
        //   success: res => {
        //     if (res.authSetting['scope.userInfo']) {
        //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        //       wx.getUserInfo({
        //         success: res => {
        //           // 可以将 res 发送给后台解码出 unionId
        //           this.globalData.userInfo = res.userInfo
        //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //           // 所以此处加入 callback 以防止这种情况
        //           if (this.userInfoReadyCallback) {
        //             this.userInfoReadyCallback(res)
        //           }
        //         }
        //       })
        //     }
        //   }
        // })
        // 获取系统状态栏信息
        wx.getSystemInfo({
            success: e => {
                this.globalData.StatusBar = e.statusBarHeight;
                let capsule = wx.getMenuButtonBoundingClientRect();
                if (capsule) {
                    this.globalData.Custom = capsule;
                    this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
                } else {
                    this.globalData.CustomBar = e.statusBarHeight + 50;
                }
            }
        })

    },

    isJson(obj) {
        var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
        return isjson;
    },
    globalData: {
        userInfo: null
    }
})