// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: 'ccs2024-6g6fcfmm79adc132'
  })
// 云函数入口函数
exports.main = async(event, context) => {
  return await cloud.database().collection('student_info').get();
}