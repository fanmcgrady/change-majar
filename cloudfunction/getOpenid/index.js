const cloud = require('wx-server-sdk')
cloud.init({
    env: 'ccs2024-6g6fcfmm79adc132'
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
