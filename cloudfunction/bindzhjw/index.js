// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require("axios");
const cheerio = require('cheerio');
const md5 = require('md5-node');
const querystring = require('querystring');
cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
// 为给定 ID 的 user 创建请求
// global.username = '2018141501071'
// global.password = 'zj200002030539..'
// global.Cookie = null
// return{
//   username: event.username,
//   password: event.password
// }
let username = event.username;
let password = event.password;
let res1 = await axios.get("http://zhjw.scu.edu.cn/login");
let cookie = res1.headers['set-cookie'][0];
let res2 = await axios.post('http://zhjw.scu.edu.cn/login/j_spring_security_check', querystring.stringify({
  j_username: username,
  j_password: md5(password),
  j_captcha: 'error',
}), {
  headers: {
    "Host": "zhjw.scu.edu.cn",
    'Referer': 'http://zhjw.scu.edu.cn/',
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    'Cookie': cookie,
  }
})
//正则
var realname = null
var reg = new RegExp(/<small>欢迎您，<\/small>([\S\s]*?)<\/span>/)
if(res2['data'].match(reg) == null){
  return{
    realname: null
  }
}
else{
  // console.log(res2['data'].match(reg)[1].trim())
  var realname = res2['data'].match(reg)[1].trim()
  return{
    realname: realname
  }
}
}