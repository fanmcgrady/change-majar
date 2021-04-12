const app = getApp()
const db = wx.cloud.database();//初始化数据库
Page({
 /**
  * 页面的初始数据
  */
 data: {
  filename:[],
  filepath:[],
  fileid:[],
  sequence: [],
  openid: "",
  ID:"",
  name:"",
  imgkind:[
    {
      num:1,
      id:0,
      kind:"四级成绩单（必填）",
      imgbox:[]
    },
    {
      num:2,
      id:1,
      kind:"其他证明材料（选填）",
      imgbox:[]},
    {
      num:2,
      id:2,
      kind:"特长证明材料（选填）",
      imgbox:[]
    }
  ],
  fileIDs: [],//上传云存储后的返回值
 },
 onLoad: function () {
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
            ID: res.data.ID,
            name: res.data.name
          })
          // console.log(that.data.ID)
        }
      })
    }
  })
},
//选择文件
addFile: function(){
  var that = this;
  wx.chooseMessageFile({
    count: 1,  //能选择文件的数量
    type: 'file', //能选择文件的类型,我这里只允许上传文件.还有视频,图片,或者都可以
    success(res) { 
    var size = res.tempFiles[0].size;
    // console.log(res.tempFiles[0].path)
    // console.log(res.tempFiles[0])
    if (size > 4194304||res.tempFiles[0].name.indexOf(".pdf")==-1){ //我还限制了文件的大小和具体文件类型
    wx.showToast({
      title: '文件大小不能超过4MB,格式必须为pdf！',
      icon: "none",
      duration: 2000,
      mask: true
    })
    }
    else{
      that.setData({
      filepath: res.tempFiles[0].path, //将文件的路径保存在页面的变量上,方便 wx.uploadFile调用
      filename: res.tempFiles[0].name    //渲染到wxml方便用户知道自己选择了什么文件
      })
    }
    }
  })
},
//上传文件
uploadFile:function(e){
  wx.showLoading({
    title: '上传中',
   })
  let that =this;
  let root = this.data.ID+'-'+this.data.name+'/'
  wx.cloud.uploadFile({
    cloudPath: root+"可信电子成绩单" + ".pdf",
    filePath: this.data.filepath,
    success: res => {
      //存储fileID，之后用的到
      that.setData({
        fileid:res.fileID,
      })
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',      
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
      db.collection('student_info').doc(this.data.openid).update({
        // data 传入需要局部更新的数据
        data: {
          // 表示将 done 字段置为 true
          pdf: this.data.fileid
        },
        success: function(res) {
          console.log(res.data)
        }
      })
    },
    fail: err => {
      console.log(err);
      wx.hideLoading();
      wx.showToast({
      icoon:none,
       title: "上传失败",
      })
    },
  })
},

})