Page({
  data: {
    fileList: [],
    fileurlhttp: []
  },
  onLoad: function (options) {
    let that = this;
    //读取users表数据
    wx.cloud.callFunction({
      name: "get_all_img",
      success(res) {
        var url = []
        for (var index in res.result.data) {
          var urltemp = res.result.data[index].fileIDs
          for (var index1 in urltemp) {
            if (urltemp[index1] != undefined)
              url.push(urltemp[index1])
          }
          if (res.result.data[index].pdf != undefined)
            url.push(res.result.data[index].pdf)
        }

        that.setData({
          fileList: url
        })

        var length = that.data.fileList.length;
        console.log("附件共：" + length + "条");
        // 每次取50，concat
        for (var i = 0; i < length; i += 50) {
          console.log(that.data.fileList.slice(i, i + 50));
          wx.cloud.getTempFileURL({
            fileList: that.data.fileList.slice(i, i + 50),
            success: res => {
              that.setData({
                fileurlhttp: that.data.fileurlhttp.concat(res.fileList)
              })
              console.log("已获取" + that.data.fileurlhttp.length);
            },
            fail: res => {
              console.log(res)
            }
          })
        }  
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  },

  //把数据保存到excel里，并把excel保存到云存储
  savaExcel() {
    let that = this
    console.log(that.data.fileurlhttp);
    wx.cloud.callFunction({
      name: "get_all_url_excel",
      data: {
        userdata: that.data.fileurlhttp
      },
      success(res) {
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
          success(res) {
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
    let that = this
    wx.setClipboardData({
      data: that.data.fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功", res.data) // data
          }
        })
      }
    })
  },
})