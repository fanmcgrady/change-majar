const echarts = requirePlugin('echarts');
const app = getApp();
//专业统计图
Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  onInstance({detail: instance}) {
    let that = this;
    //读取各专业申请转专业的人数
    wx.cloud.callFunction({
      name: "get_major_data",
      success(res) {
        console.log("读取成功", res.result.list)
        var xAxis = [];
        var yAxis = [];
        for (var index in res.result.list) {
          xAxis.push(res.result.list[index]._id)
          yAxis.push(res.result.list[index].num)
        }
        that.setData({
          option:{
            title: {
              text: "各专业人数统计"
            },
            tooltip: {},
            legend: {
                data:['人数']
            },
            xAxis: {
                data: xAxis
            },
            dataZoom: {
                show :true,
            },
            yAxis: {},
            series: [{
                name: '人数',
                type: 'bar',
                data: yAxis
            }]
          }
        })
        instance.setOption(that.data.option, true);
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  },
  data: {
    //这个地方可以先请求数据然后在返回
    option:{
        title: {
          text: "各学院人数统计"
      },
      tooltip: {},
      legend: {
          data:['人数']
      },
      xAxis: {
          data: []
      },
      dataZoom: {
          show :true,
      },
      yAxis: {},
      series: [{
          name: '人数',
          type: 'bar',
          data: []
      }]
    },
  },
  onReady() {
  },
  onLoad: function (options) {
  }
});
