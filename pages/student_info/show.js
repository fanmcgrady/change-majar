//云数据库初始化
const db = wx.cloud.database();
const app = getApp();
Page({
   data:{
        isSubmit: false,
        listdata:[],  //这是一个空的数组，等下获取到云数据库的数据将存放在其中
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      isSubmit: app.globalData.submit
    })
    wx.cloud.callFunction({    //调用云函数获取openid
      name:"getOpenid",
      complete:res=>{
        db.collection("student_info").where({
          _openid:res.result.openid   //进行筛选
        }).get({
          success:res=>{
            if(res.data.length==1){
              var studentInfo = res.data[0]
              this.setData({
                listdata: studentInfo
              })
              //通过判断data数组长度是否为0来进行下一步的逻辑处理
            }
          }
        })
      }
    })
    //1、引用数据库   
    //2、开始查询数据了  news对应的是集合的名称   
    // wx.cloud.callFunction({    //调用云函数获取openid
    //   name:"getOpenid",
    //   complete:res=>{
    //     db.collection("student_info").where({
    //       _openid:res.result.openid   //进行筛选
    //     }).get({
    //       success:res=>{
    //         if(res.data.length==1){
    //           var data = res.data
    //           console.log(data[0])
    //           //通过判断data数组长度是否为0来进行下一步的逻辑处理
    //           this.setData({
    //             listdata: data[0]
    //           })
    //         }
    //       }
    //     })
    //   }
    // })
  },    
  menuArrow: function (e) {
    this.setData({
      menuArrow: e.detail.value
    });
  },
})