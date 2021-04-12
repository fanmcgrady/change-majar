// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async(event, context) => {
  const db = cloud.database()
  const $ = db.command.aggregate
  return db.collection('student_info').aggregate()
            .group({
              _id: '$sex',
              value: $.sum(1)
            })
            .end()
}