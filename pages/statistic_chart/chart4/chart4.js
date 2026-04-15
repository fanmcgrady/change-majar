//这里，只要一个谁谁的未修学分的统计，有没有达到要求等等。。
Page({
  onShareAppMessage: function (res) {
    return {
      title: '',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    //这个地方可以先请求数据然后在返回
    option: {
    },
  },
  onReady() {
  },
  onLoad: function () {
    let that = this;
    //读取各学院申请转专业的人数
    wx.cloud.callFunction({
      name: "get_credits_data",
      success(res) {
        console.log("读取成功", res.result.data)
        for (var index in res.result.data) {
          if(res.result.data[index].credit>32.2) res.result.data[index].judge="是";
          else res.result.data[index]["judge"]="否";
        }
        that.setData({
          stu:res.result.data
        })
        return res.result.data
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  }
});
