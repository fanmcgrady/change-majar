// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  return db.collection('student_info').where(
    _.or([
      {
        GPA: _.lt(3.4)
      },
      {
        CET4: _.lt(525)
      }
    ]))
    .field({
        ID: true,
        name: true,
        fileIDs: true,
    }).get()
}