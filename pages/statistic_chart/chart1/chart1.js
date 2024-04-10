// 引入 ECharts 插件
const echarts = requirePlugin('echarts');
const app = getApp();
//按学院人数统计图
Page({
  onInstance({detail: instance}) {
    let that = this;
    //读取各学院申请转专业的人数
    wx.cloud.callFunction({
      name: "get_college_data",
      success(res) {
        console.log("读取成功", res.result.list)
        var xAxis = [];
        var yAxis = [];
        for (var index in res.result.list) {
          xAxis.push(res.result.list[index]._id == null ? "未填基本信息": res.result.list[index]._id)
          yAxis.push(res.result.list[index].num)
        }
        that.setData({
          option:{
            title: {
              text: "各学院人数统计"
            },
            tooltip: {},
            legend: {
                data:['人数']
            },
            grid: {y2: 200},
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
    //放到这里就显示不出来，放到里面才行
    // instance.setOption(that.data.option, true);
  },
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
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
    }
  },
});
