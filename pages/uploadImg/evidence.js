// pages/uploadImg/evidence.js
const app = getApp()
const db = wx.cloud.database();//初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    downloadURL: "",
    httpfile: "",
    urls:[],
    url1:[],
    url2:[],
    url3:[],
    pdf:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({    //调用云函数获取openid
      name:"getOpenid",
      complete:res=>{
        this.setData({
          openid: res.result.openid
        })
        let that = this;
        db.collection('student_info').doc(this.data.openid).get({
          success: function(res) {
            // res.data 包含该记录的数据
            // console.log(res.data)
            that.setData({
              urls: res.data.fileIDs,
              pdf: res.data.pdf
            })
            for(var i = 0;i<that.data.urls.length;i++){
              var s1 = "四级成绩单"
              var s2 = "其他证明材料"
              var s3 = "特长证明材料"
              // console.log(that.data.urls[i])
              if(that.data.urls[i].indexOf(s1)!=-1){
                that.setData({
                  url1: that.data.url1.concat(that.data.urls[i])
                })
              }
              else if(that.data.urls[i].indexOf(s2)!=-1){
                that.setData({
                  url2: that.data.url2.concat(that.data.urls[i])
                })
              }
              else if(that.data.urls[i].indexOf(s3)!=-1){
                that.setData({
                  url3: that.data.url3.concat(that.data.urls[i])
                })
              }
          }
          // console.log(that.data.pdf)
          // console.log(that.data.url1)
          // console.log(that.data.url2)
          // console.log(that.data.url3)
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  openFile:function(){
    if(this.data.pdf.length!=0){
      let that = this;
      wx.showLoading({
        title: '正在打开',
       })
      wx.cloud.downloadFile({
        fileID: that.data.pdf, 
        success: res => {
          // 返回临时文件路径
          console.log(res.tempFilePath)
          wx.openDocument({
            filePath: res.tempFilePath,
          })
          wx.hideLoading();
          wx.showToast({
           title: "打开成功",
          })
        },
        fail: console.error
      })
    }
    else{
      wx.showToast({
        title: '失败，检查pdf是否已经提交',  
        icon: 'none',
        duration: 3000//持续的时间
      })
    }
  }
})    
  