/**
 * 微信参数签名
 */

const assert = require('assert')

const signature = ({ wechatapi }) => {
  return async (req, res, next) => {
    try {
      assert(req.body.url, 'url required!')

      const config = await wechatapi.getJsConfigAsync({
        debug: req.body.debug,
        url: req.body.url,
        jsApiList: req.body.jsApiList,
        beta: req.body.beta  
      })
      res.status(200).send(config).end()
    } catch(e) {
      return res.status(500).send({ message: e.message})
    }
  }
}

module.exports = ({ wechatapi, cache }) => {
  return {
    signature: signature({ wechatapi, cache })
  }
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
