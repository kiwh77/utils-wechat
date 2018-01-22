/**
 * 微信参数签名
 */
const sha1 = require('sha1')
const cache = require('./cache')

// 随机字符串
const randomString = (length) => {
  const words = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const result = []
  for (let i = 0; i < length; i++) {
    let word = words[Math.floor(Math.random() * words.length)]
    word = Math.random() * 10 > 5 ? word.toUpperCase() : word
    result.push(word)
  }
  return result.join('')
}
// 签名
const countSignature = (params) => {
  // key按顺序排列，以&拼接进字符串
  const signatureString = Object.keys(params).sort((a, b) => a > b).map(key => `${key}=${params[key]}`).join('&')
  // 再进行sha1签名
  const signature = sha1(signatureString)
  return signature
}

module.exports = (req, res, next) => {
  if (!req.body.url) return res.status(500).send({ data: { message: 'url required!' } })
  const signature = {}
  signature.appId = process.env.WXAPPID

  const timestamp = Math.floor(Date.now() / 1000)
  signature.timestamp = timestamp

  signature.nonceStr = randomString(16)
  signature.signature = countSignature({
    jsapi_ticket: cache.wxinfo.jsapi.ticket,
    noncestr: signature.nonceStr,
    timestamp: timestamp,
    url: req.body.url
  })

  res.status(200).send(signature).end()
}

/*
传播类
发送给朋友: "menuItem:share:appMessage"
分享到朋友圈: "menuItem:share:timeline"
分享到QQ: "menuItem:share:qq"
分享到Weibo: "menuItem:share:weiboApp"
收藏: "menuItem:favorite"
分享到FB: "menuItem:share:facebook"
分享到 QQ 空间/menuItem:share:QZone
*/
