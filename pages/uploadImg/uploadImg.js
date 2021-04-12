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
  wx.cloud.uploadFile({
    cloudPath: this.data.ID+"-"+this.data.name + "-可信电子成绩单" + ".pdf",
    filePath: this.data.filepath,
    success: res => {
      //存储fileID，之后用的到
      that.setData({
        fileid:res.fileID,
      })
      wx.hideLoading();
      wx.showToast({
       title: "上传成功",
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
       title: "上传失败",
      })
    },
  })
},
 //选择图片
 addPic: function (e) {
  var id = e.currentTarget.dataset.id;
  var imgbox = this.data.imgkind[id].imgbox;
  this.setData({
    sequence: id
  })
  var that = this;
  // var n = 5;
  // if (5 > imgbox.length > 0) {
  //  n = 5 - imgbox.length;
  // } else if (imgbox.length == 5) {
  //  n = 1;
  // }
  wx.chooseImage({
   count: 4, // 默认9，设置图片张数
   sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
   sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
   success: function (res) {
    // console.log(res.tempFilePaths)
    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
    var tempFilePaths = res.tempFilePaths
    if (imgbox.length == 0) {
     imgbox = tempFilePaths
    } else if (5 > imgbox.length) {
     imgbox = imgbox.concat(tempFilePaths);
    }
    // console.log(that.data.imgkind[id].imgbox)
    var tmp1 = "imgkind[" + id + "].imgbox";
    that.setData({
     [tmp1]: imgbox
    });
   }
  })
 },
//预览图片
 ViewImage(e) {
  wx.previewImage({
    urls: this.data.imgkind[this.data.sequence].imgbox,
    current: e.currentTarget.dataset.url
  });
},
//删除图片
DelImg(e) {
  wx.showModal({
    title: '同学',
    content: '确定要删除这张照片吗？',
    cancelText: '否',
    confirmText: '是',
    success: res => {
      if (res.confirm) {
        this.data.imgkind[this.data.sequence].imgbox.splice(e.currentTarget.dataset.index,1)
        var tmp2 = "imgkind[" + this.data.sequence + "].imgbox";
        this.setData({
         [tmp2]: this.data.imgkind[this.data.sequence].imgbox
        });
      }
    }
  })
},
 //上传图片
 fb: function (e) {
  if (!this.data.imgkind[0].imgbox.length&&!this.data.imgkind[1].imgbox.length&&!this.data.imgkind[2].imgbox.length) {
   wx.showToast({
    icon: 'none',
    title: '内容为空'
   });
  } else {
    //上传图片到云存储
    wx.showLoading({
     title: '上传中',
    })
    let promiseArr = [];
    var pathname;
    for (let i = 0; i < this.data.imgkind.length; i++) {
      if(i==0){
        pathname="四级成绩单"
      }else if(i==1){
        pathname="其他证明材料"
      }else if(i==2){
        pathname="特长证明材料"
      }
      for(let j=0;j <this.data.imgkind[i].imgbox.length;j++){
        promiseArr.push(new Promise((reslove, reject) => {
          let item = this.data.imgkind[i].imgbox[j];
          let suffix = /\.\w+$/.exec(item)[0];//正则表达式返回文件的扩展名
          let k = j + 1;
          let root = this.data.ID+'-'+this.data.name+'/'
          wx.cloud.uploadFile({
          //  cloudPath: this.data.ID+"-"+this.data.name+"-"+pathname+k+suffix, // 上传至云端的路径
          cloudPath:root + pathname+k+suffix, // 上传至云端的路径
           filePath: item, // 小程序临时文件路径
           success: res => {
            this.setData({
             fileIDs: this.data.fileIDs.concat(res.fileID),
            });
            reslove();
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
           },
           fail: res=>{
            wx.hideLoading();
            wx.showToast({
             title: "上传失败",
            })
           }
    
          })
         }));
      }
      Promise.all(promiseArr).then(res => {//等数组都做完后做then方法
        // console.log("图片上传完成后再执行")
        var tmp3 = "imgkind[" + i + "].imgbox";
        // console.log(this.data.fileIDs)
        this.setData({
          [tmp3]:[],
          filename: [],
        })
        db.collection('student_info').doc(this.data.openid).update({
          // data 传入需要局部更新的数据
          data: {
            // 表示将 done 字段置为 true
            fileIDs: this.data.fileIDs
          },
          success: function(res) {
            // console.log(res.data)
          }
        })
        // console.log(app.globalData.urls)
        });
    }
   }
 },

})