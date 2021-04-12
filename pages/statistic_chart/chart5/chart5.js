
Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  onLoad: function () {
    let that = this;
    //读取不符合要求的学生但是上传了其他的证明材料
    wx.cloud.callFunction({
      name: "get_notstu_data",
      success(res) {
        var urls={}
        for(var index in res.result.data){
          urls = res.result.data[index].fileIDs
          var urls1=[]
          var s3 = "特长证明材料"
          for (var index1 in urls) {
              if(urls[index1].indexOf(s3)!=-1){
                urls1.push(urls[index1])
              }
          }
          res.result.data[index]["specialty"] = urls1
          //按道理来说应该是要获取临时的http地址的这样就可以预览了，但是我没解决异步转换为同步的问题
          //另一种解决方法，可以是试一下在云函数端调用这个函数获得tempurl然后再组合josn数据后返回
          // wx.cloud.getTempFileURL({
          //   fileList: that.data.urls1,
          //   success(res1,res){  
          //     // get temp file URL
          //     var tempurl = []
          //     console.log(res1.fileList)
          //     for(var index in res1.fileList){
          //       tempurl.push(res1.fileList[index].tempFileURL)
          //     }
          //     that.setData({
          //       tempurl : tempurl
          //     })
          //     for(var index in stu){
          //       stu[index].specialty = tempurl
          //     }
          //   },
          //   fail: err => {
          //     // handle error
          //   }
          // })
        }
        for(var index in res.result.data){
          if(res.result.data[index].specialty.length==0)  
           res.result.data.splice(index, 1);
        }
        that.setData({
          stu:res.result.data,
        })
        console.log("读取成功", that.data.stu)
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  },

});
