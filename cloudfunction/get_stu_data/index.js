// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: 'cloud1-6guiwkxn5ce7075f'
  })
// 云函数入口函数
exports.main = async(event, context) => {
  return await cloud.database().collection('student_info').get();
}