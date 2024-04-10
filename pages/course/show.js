//云数据库初始化
const db = wx.cloud.database();
const app = getApp();
Page({
   data:{
        listdata:[],  //这是一个空的数组，等下获取到云数据库的数据将存放在其中
        id:"",
        sex:"",
        name:"",
        finishCredit:0,
        unfinishCredit:0
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this
    wx.cloud.callFunction({    //调用云函数获取openid
      name:"getOpenid",
      complete:res=>{
        db.collection("student_info").where({
          _openid:res.result.openid   //进行筛选
        }).get({
          success:res=>{
            // console.log(res.data[0].courses)
            that.setData({
              listdata: res.data[0].courses,
              id:res.data[0].ID,
              sex:res.data[0].sex,
              name:res.data[0].name,
              finishCredit: res.data[0].credit,
              unfinishCredit: 43 - res.data[0].credit
            })
            // console.log(that.data.listdata[0].finish)
          }
        })
      }
    })
  },    
  menuArrow: function (e) {
    this.setData({
      menuArrow: e.detail.value
    });
  },
})