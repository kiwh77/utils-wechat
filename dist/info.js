// const cache = require('./cache')
const service = require('./service')
// const axios = require('../fetch')
// const passport = require('passport')

const checkUserAccessToken = function (access) {
  const currDate = Date.now()
  return access && access.expires_in > currDate
}

/**
 * 判断是否有微信信息，如没有则进入绑定页面
 */
module.exports = (req, res, next) => {
  // 前端静态资源
  if (req.url.indexOf('/static/') > -1) return next()

  if (req.query.code && req.query.state) {
    // 判断是否有access_token则是否过期
    (function () {
      return new Promise((resolve, reject) => {
        if (checkUserAccessToken(req.session.userAccessToken)) {
          return resolve({
            accesstoken: req.session.userAccessToken.access_token,
            openid: req.session.userAccessToken.openid
          })
        } else {
          return service.getUserAccessToken({
            appid: process.env.WXAPPID,
            appsecret: process.env.WXAPPSECRET,
            code: req.query.code
          })
            .then(userAccessToken => {
              const access = userAccessToken.data
              if (access.openid && access.access_token) {
                // 缓存用户access_token
                req.session.userAccessToken = userAccessToken.data
                req.session.userAccessToken.expires_in = Date.now() + (parseInt(access.expires_in) - 200) * 1000
                // resolve({
                //   accesstoken: req.session.userAccessToken.access_token,
                //   openid: req.session.userAccessToken.openid
                // })
                next()
              } else {
                return reject(`微信用户查询access_token失败:${userAccessToken.data}`)
              }
            })
        }
      })
    })()
      // .then(access => {
      //   // 查询用户信息，有则绑定，无则进入注册页面
      //   return axios.instance.servers['customer_Customer_findCustomerByOpenId']({openId: access.openid})
      // })
      // .then(userInfo => {
      //   // 缓存用户token、信息
      //   if (userInfo.token && userInfo.Rows && userInfo.Rows.length) {
      //     const user = {
      //       token: userInfo.token,
      //       info: userInfo.Rows[0],
      //       cookie: userInfo.cookie
      //     }
      //     req.session.customer = user
      //     req.login(user.info, (error, result) => {
      //       if (error) {
      //         console.error(`>> 缓存用户信息失败:${error}`)
      //       }
      //       return next()
      //     })
      //   } else {
      //     // 没有查到用户信息，记录openid，进入登录绑定页面
      //     next()
      //   }
      // })
      .catch(error => {
        console.error(`>> 查询用户信息失败:${error}`)
        next()
      })
  } else if (!req.session || !req.session.userAccessToken || !req.session.userAccessToken.openid) {
    //   // 拼装重定向
    const currentUrl = process.env.HOST + req.url
    const redirectUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.WXAPPID}&redirect_uri=${currentUrl}&response_type=code&scope=snsapi_base&state=redirect#wechat_redirect`
    res.redirect(redirectUrl)
  } else {
    next()
  }
}
