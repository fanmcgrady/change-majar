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
        var xAxis = [];
        var yAxis = [];
        for (var index in res.result.list) {
          xAxis.push(res.result.list[index]._id == null ? "未填基本信息": res.result.list[index]._id)
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
                data: xAxis,
                axisLabel:{
                  interval: 0,
                  formatter: function (value) {
                    //x轴的文字改为竖版显示
                    var str = value.split("");
                    return str.join("\n");
                  }
                }
            },
            grid: {
                y2: 200
            },
            yAxis: {},
            series: [{
                name: '人数',
                type: 'bar',
                data: yAxis,
                itemStyle: {
                  normal: {
                    label: {
                      show: true, //开启显示
                      position: 'top', //在上方显示
                      textStyle: { //数值样式
                        color: 'black',
                        fontSize: 16
                      }
                    }
                  }
                },
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
