// // 云函数入口文件
// const cloud = require('wx-server-sdk')
// cloud.init()
// // 云函数入口函数
// exports.main = async(event, context) => {
//   return await cloud.database().collection('course_info').get();
// }

const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init({
    env: 'cloud1-6guiwkxn5ce7075f'
  })
//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    let {userdata} = event
    //1,定义excel表格名
    let dataCVS = '申请学生信息.xlsx'
    //2，定义存储数据的
    let alldata = [];
    // let row = ['ID', 'name','sex', 'college','major']; //表属性
    let row = ['学号', '姓名','电话','性别', '学院','专业','绩点','四级成绩','是否同意降级','是否攻读研究生','是否攻读博士']; //表属性
    alldata.push(row);

    for (let key in userdata) {
      let arr = [];
      arr.push(userdata[key].ID);
      arr.push(userdata[key].name);
      arr.push(userdata[key].phone);
      arr.push(userdata[key].sex);
      arr.push(userdata[key].college);
      arr.push(userdata[key].major);
      arr.push(userdata[key].GPA);
      arr.push(userdata[key].CET4);
      arr.push(userdata[key].downgrade);
      arr.push(userdata[key].choice);
      arr.push(userdata[key].PHD);
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}