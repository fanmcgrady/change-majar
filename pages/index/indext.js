const app = getApp();

Page({
  data: {
    charts: [{
      id: 'chart1',
      name: '各学院人数'
    }, {
      id: 'chart2',
      name: '各专业人数'
    }, {
      id: 'chart3',
      name: '男女比例'
    },{
      id: 'down',
      name: '下载表格'
    },{
      id: 'downpic',
      name: '下载图片'
    }],
  },

  //这样，我不在前端构造，就在后端构造，构造好了直接赋值就完了。
  //那这样的话，必须要构造数据库返回的json数据的格式
  readoption() {
    let that = this
    // 1. 获取数据库引用
    const db = wx.cloud.database()
    // 2. 构造查询语句
    // collection 方法获取一个集合的引用
    // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
    // get 方法会触发网络请求，往数据库取数据
    db.collection('course_info').get({
      success: function(res) {
      // 输出 [{ "title": "The Catcher in the Rye", ... }]
        console.log(res)
        that.setData({
          option: {  
            title: {
              text: "各学院人数统计"
            },
            legend: {
              data:['人数']
            },
            xAxis: {
              data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
          }
        })
    }
    })
  },

  open: function (e) {
    wx.navigateTo({
      url: '../statistic_chart/' + e.target.dataset.chart.id  +'/'+e.target.dataset.chart.id
    });
  }
});
