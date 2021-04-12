// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const data= db.collection('student_info')
    .field({
        ID: true,
        name: true,
        fileIDs: true,
        pdf:true
    }).get()
    return data

}