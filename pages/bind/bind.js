// pages/bind/bind.js
let name = null;//变量，用于存放用户输入的账号
let password = null;//变量，用于存放用户输入的密码
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    scuer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({    //调用云函数获取openid
      name:"getOpenid",
      complete:res=>{
        this.setData({
          openid:res.result.openid   //进行筛选
        })
      }
    })
  },
  inputName: function (event) {
    name = event.detail.value//将用户输入的账号放到变量里面
  },
  //输入密码
  inputPassword(event) {
    password = event.detail.value//将用户输入的密码放到变量里面
  },
  login(){
    wx.showLoading({
      title: '身份认证中',
     })
    wx.cloud.callFunction({
      name:"bindzhjw",
      data: {
        username: name,
        password: password,
      },
    }).then(res=>{
      console.log(res.result.realname)
      this.setData({
        scuer: res.result.realname
      })
      if(res.result.realname != null){
        db.collection('student_info').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            _id: this.data.openid
          }
        })
        .then(res => {
          wx.hideLoading();
          wx.showToast({
            title: "欢迎你！"+this.data.scuer,      
            icon: 'success',  
            duration: 2000,//持续的时间
            mask: true,
            success: function () {
              setTimeout(function() {
                wx.switchTab({
                  url: '/pages/index/indexs',
                  success(){
                    let page = getCurrentPages().pop(); //跳转页面成功之后
                    if (!page) return;
                    page.onLoad(); //如果页面存在，则重新刷新页面
                    }
                })
              }, 2000);
            }
          })
        })
      }
      else{
        wx.hideLoading();
        wx.showToast({
         icon: 'none',
         title: "身份认证失败",
        })
      }
    });
  }
})