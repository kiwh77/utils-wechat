const cache = require('./cache')
const service = require('./service')

const checkAccessToken = function () {
  const currTimestamp = Date.now()
  // 判断微信信息是否存在、expires_in是否过期
  return cache.wxinfo.access && cache.wxinfo.access.access_token && currTimestamp < cache.wxinfo.access.expires_in
}

const checkJsApiTicket = function () {
  const currTimestamp = Date.now()
  return cache.wxinfo.jsapi && cache.wxinfo.jsapi.ticket && cache.wxinfo.jsapi.expires_in > currTimestamp
}

const cacheAccessToken = function (params) {
  return new Promise((resolve, reject) => {
    service.getAccessToken(params)
    .then(response => {
      if (!response.data.errcode || response.data.errcode === 0) {
        return resolve(response.data)
      } else if (response.data.errcode) {
        return reject('更新accesstoken 失败, ' + response.data.errmsg)
      }
    }, reject)
  })
}

const cacheJsApiTicket = function (accesstoken) {
  return new Promise((resolve, reject) => {
    service.getJsApiTicket({accesstoken})
    .then(response => {
      if (response.data.errcode === 0) {
        return resolve(response.data)
      } else {
        return reject(response.data.errmsg)
      }
    })
  })
}

// 微信配置，进入时获取并保存access_token
module.exports = function (req, res, next) {
  // 判断微信信息是否存在、expires_in是否过期
  if (checkAccessToken()) {
    if (checkJsApiTicket()) {
      req.wxinfo = cache.wxinfo
      next()
    } else {
      cacheJsApiTicket(cache.wxinfo.access.access_token)
      .then(jsapi => {
        jsapi.expires_in = Date.now() + (parseInt(jsapi.expires_in) - 200) * 1000
        cache.wxinfo.jsapi = jsapi
        req.wxinfo = cache.wxinfo
        next()
      }).catch(error => {
        console.error('>> 更新JsApi失败,', error)
        next()
      })
    }
  } else {
    cacheAccessToken({
      appid: process.env.WXAPPID, appsecret: process.env.WXAPPSECRET
    }).then(access => {
      access.expires_in = Date.now() + (parseInt(access.expires_in) - 200) * 1000
      cache.wxinfo.access = access
      req.wxinfo = cache.wxinfo
      return access.access_token
    }).then(token => {
      if (checkJsApiTicket()) {
        return next()
      } else {
        cacheJsApiTicket(token).then(jsapi => {
          jsapi.expires_in = Date.now() + (parseInt(jsapi.expires_in) - 200) * 1000
          cache.wxinfo.jsapi = jsapi
          req.wxinfo = cache.wxinfo
          next()
        }).catch(error => {
          console.error('>> 更新JsApi失败,', error)
          next()
        })
      }
    }).catch(error => {
      console.error('>> 更新token、jsApiTicket出错' + JSON.stringify(error))
      next()
    })
  }
}
