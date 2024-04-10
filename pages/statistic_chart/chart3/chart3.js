
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
    //读取男女比例
    wx.cloud.callFunction({
      name: "get_sex_data",
      success(res) {
        console.log("读取成功", res.result.list)
        var xAxis = {value:"",name:""};
        var yAxis = {value:"",name:""};
        xAxis.name = res.result.list[0]._id;
        xAxis.value= res.result.list[0].value;
        yAxis.name = res.result.list[1]._id;
        yAxis.value= res.result.list[1].value;

        that.setData({
          option: {
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 10,
              data: ['男', '女']
            },
            series: [
              {
                  name: '男女比例',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center',
                      normal: {
                        show: true,
                        formatter: '{b}: {c}({d}%)'
                    }
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: [
                    xAxis,
                    yAxis,
                  ]
              }
            ]
          },
        })
        console.log("读取成功", that.data.option);
        instance.setOption(that.data.option, true);
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  },
  data: {
    //这个地方可以先请求数据然后在返回
    option: {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: ['男', '女']
      },
      series: [
        {
            name: '男女比例',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '30',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
            ]
        }
      ]
    },
  },
});
