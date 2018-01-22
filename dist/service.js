const axios = require('axios')

module.exports.getJsApiTicket = (params) => {
  if (params.accesstoken) {
    return axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${params.accesstoken}&type=jsapi`)
  } else {
    return Promise.reject('accesstoken required!')
  }
}

// 基本支持access_token
module.exports.getAccessToken = (params) => {
  if (params.appid && params.appsecret) {
    return axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${params.appid}&secret=${params.appsecret}`)
  } else {
    return Promise.reject('appid and appsecret required!')
  }
}

module.exports.refreshAccessToken = (params) => {
  if (params.appid && params.refreshToken) {
    return axios.get(`https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${params.appid}&grant_type=refresh_token&refresh_token=${params.refreshToken}`)
  } else {
    return Promise.reject('appid or refreshToken not found!')
  }
}

// 获得网页授权接口调用凭证access_token
module.exports.getUserAccessToken = (params) => {
  if (params.appid && params.appsecret && params.code) {
    return axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${params.appid}&secret=${params.appsecret}&code=${params.code}&grant_type=authorization_code`)
  } else {
    return Promise.reject('appid or appsecret or code not found!')
  }
}

// 获取用户基本信息
module.exports.getUserWXBaseInfo = (params) => {
  if (params.accesstoken && params.openid) {
    return axios.get(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${params.accesstoken}&openid=${params.openid}&lang=zh_CN`)
  } else {
    return Promise.reject('accesstoken and openid required!')
  }
}
// {
//   "subscribe": 1,
//   "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
//   "nickname": "Band",
//   "sex": 1,
//   "language": "zh_CN",
//   "city": "广州",
//   "province": "广东",
//   "country": "中国",
//   "headimgurl":  "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
//  "subscribe_time": 1382694957,
//  "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"
//  "remark": "",
//  "groupid": 0,

//  "tagid_list":[128,2]
// }

module.exports.getUserWxInfo = (params) => {
  if (params.accesstoken && params.openid) {
    return axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${params.accesstoken}&openid=${params.openid}&lang=zh_CN`)
  } else {
    return Promise.reject('accesstoken or openid not found!')
  }
}

// 验证用户accesstoken是否有效
module.exports.authAccesstoken = (params) => {
  if (params.accesstoken && params.openid) {
    return axios.get(`https://api.weixin.qq.com/sns/auth?access_token=${params.accesstoken}&openid=${params.openid}`)
  } else {
    return Promise.reject('accesstoken or openid not found!')
  }
}

