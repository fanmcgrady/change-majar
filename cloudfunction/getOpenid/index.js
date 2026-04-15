const cloud = require('wx-server-sdk')
cloud.init({
    env: 'cloud1-6guiwkxn5ce7075f'
  })
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}
