const axios = require('axios')
const md5 = require('crypto-js/md5')
const moment = require('moment')
const xml2js = require('xml2js')

const xml2json = function (xml) {
  return new Promise((resolve, reject) => {
    const xmlParser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true })
    xmlParser.parseString(xml, function (err, result) {
      if (err) return reject(err)
      if (typeof result === 'string') {
        try {
          const json = JSON.parse(result)
          resolve(json)
        } catch (error) {
          reject(error)
        }
      } else {
        resolve(result)
      }
    })
  })
}

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
// 使用用户access_token
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


const getSign = (args, key) => {
  const keys = Object.keys(args)
  if (!keys || !keys.length || !key) return
  const paramStr = keys
    .filter(key => key && args[key])
    .sort()
    .map(key => `${key}=${(args[key] + '').replace(/\s+/g, '')}`)
    .join('&') + `&key=${key}`

  const sign = md5(paramStr).toString().toUpperCase()
  return sign
}

/**
 * 微信支付预支付下单
 * 暂仅支付所必须参数
 * @param {String} appid 公众号appid
 * @param {String} attach 支付描述
 * @param {String} body 支付内容
 * @param {String} mch_id 商户id
 * @param {String} nonce_str 随机字符串，默认：当前时间戳
 * @param {String} notify_url 回调地址
 * @param {String} openid 用户openid
 * @param {String} out_trade_no 订单号
 * @param {String} spbill_create_ip 创建ip
 * @param {String} total_fee 金额
 * @param {String} trade_type 发起支付方式，默认：JSAPI
 * 
 * @returns {Object} 返回对象可直接由微信jssdk发起支付，注意jssdk相当接口的注册
 */
module.exports.prepay = async (params) => {
  params.nonce_str = params.nonce_str || `${moment().unix()}`
  params.trade_type = params.trade_type || 'JSAPI'
  const authArgs = ['appid', 'attach', 'body', 'mch_id', 'nonce_str', 'notify_url', 'openid', 'out_trade_no', 'spbill_create_ip', 'total_fee', 'trade_type']
  for (let i = 0; i < authArgs.length; i++) {
    const arg = authArgs[i]
    if (!params[arg]) return Promise.reject(`${arg}不能为空`)
  }

  let formData = '<xml>'
  formData += '<appid>' + params.appid + '</appid>' // appid
  formData += '<attach>' + params.attach + '</attach>'
  formData += '<body>' + params.body + '</body>'
  formData += '<mch_id>' + params.mch_id + '</mch_id>' // 商户号
  formData += '<nonce_str>' + params.nonce_str + '</nonce_str>'
  formData += '<notify_url>' + params.notify_url + '</notify_url>'
  formData += '<openid>' + params.openid + '</openid>'
  formData += '<out_trade_no>' + params.out_trade_no + '</out_trade_no>'
  formData += '<spbill_create_ip>' + params.spbill_create_ip + '</spbill_create_ip>'
  formData += '<total_fee>' + params.total_fee + '</total_fee>'
  formData += '<trade_type>' + params.trade_type + '</trade_type>'
  formData += '<sign>' + getSign({ appid: params.appid, attach: params.attach, body: params.body, mch_id: params.mch_id, nonce_str: params.nonce_str, notify_url: params.notify_url, openid: params.openid, out_trade_no: params.out_trade_no, spbill_create_ip: params.spbill_create_ip, total_fee: params.total_fee, trade_type: params.trade_type }, params.key) + '</sign>'
  formData += '</xml>'
  const result = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', formData)

  if (result && result.status === 200) {
    const data = await xml2json(result.data)
    if (data.xml && data.xml.return_code === 'SUCCESS') {
      const r = {
        appId: params.appid,
        timeStamp: `${moment().unix()}`,
        nonceStr: params.nonce_str,
        package: `prepay_id=${data.xml.prepay_id}`,
        signType: 'MD5'
      }
      r.paySign = getSign(r, params.key)
      return Promise.resolve(r)
    } else {
      return Promise.reject(data.xml.return_msg)
    }
  } else {
    return Promise.reject(result.statusText)
  }
}