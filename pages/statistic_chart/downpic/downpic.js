
Page({
  onLoad: function(options) {
    let that = this;
    //读取users表数据
    wx.cloud.callFunction({
      name: "get_all_img",
      success(res) {
        console.log("读取成功", res.result.data)
        var url  = []
        for(var index in res.result.data){
          var urltemp = res.result.data[index].fileIDs
          for (var index1 in urltemp) {
            url.push(urltemp[index1])
          }
          url.push(res.result.data[index].pdf)
        }
        that.setData({
          fileList:url
        })
        wx.cloud.getTempFileURL({
          fileList: that.data.fileList,
          success: res => {
            // get temp file URL
            console.log("文件下载链接", res.fileList)
            that.setData({
              fileurlhttp: res.fileList
            })
            console.log("that data", that.data.fileurlhttp)
            that.savaExcel(that.data.fileurlhttp)
          },
        })
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  },
    //把数据保存到excel里，并把excel保存到云存储
    savaExcel(userdata) {
      let that = this
      wx.cloud.callFunction({
        name: "get_all_url_excel",
        data: {
          userdata: userdata
        },
        success(res) {
          console.log("保存成功", res)
          that.getFileUrl(res.result.fileID)
        },
        fail(res) {
          console.log("保存失败", res)
        }
      })
    },
  
    //获取云存储文件下载地址，这个地址有效期一天
    getFileUrl(fileID) {
      let that = this;
      wx.cloud.getTempFileURL({
        fileList: [fileID],
        success: res => {
          // get temp file URL
          console.log("文件下载链接", res.fileList[0].tempFileURL)
          that.setData({
            fileUrl: res.fileList[0].tempFileURL
          })
          wx.downloadFile({
            url: res.fileList[0].tempFileURL, //仅为示例，并非真实的资源
            success (res) {
              console.log("下载文件成功")
            }
          })
        },
        fail: err => {
          // handle error
        }
      })
    },
    //复制excel文件下载链接
    copyFileUrl() {
      let that=this
      wx.setClipboardData({
        data: that.data.fileUrl,
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log("复制成功",res.data) // data
            }
          })
        }
      })
    },
})

