
// 自定义服务器事件
const incept = ({ wechatapi, cache }) => {
  return async (req, res, next) => {
    const query = req.query, body = req.body;
    if (query.signature && query.timestamp && query.nonce) {
      // 验证服务器，按要求返回字符串
      if (query.echostr) {
        return res.send(query.echostr).end()
      }

      // 根据注册处理相应事件
      if (body.xml && body.xml.event && body.xml.event.length) {
        const eventType = body.xml.event[0].toLowerCase()
        const event = cache.eventRegister[eventType]
        // 配置的函数，则调用函数处理
        if (typeof event === 'function') await event(req.query.openid, body.xml)
        if (typeof event === 'string') {   //配置的字符串，则直接发送
          const eventFunc = require(event)()
          await eventFunc(req.query.openid, body.xml)
        }
      }
    }
    res.send('').end()
  }
}

/**
 * 用户access_token信息
 */
const authAccess = ({ wechatapi, service, cache }) => {
  const checkUserAccessToken = function (access) {
    const currDate = Date.now()
    return access && access.expires_in > currDate
  }

  return async (req, res, next) => {
    // 开发环境不运行
    if (process.env.NODE_ENV !== 'production') return next()
    // 前端静态资源
    if (/\w*.js|\w*.css|\w*.html|\w*.png|\w*.jpg|\w*.jpeg/.test(req.url)) return next()

    const redirectFunc = () => {
      // 拼装重定向
      const currentUrl = encodeURI(cache.config.HOST + req.originalUrl)
      const redirectUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${cache.config.WXAPPID}&redirect_uri=${currentUrl}&response_type=code&scope=snsapi_base&state=redirect#wechat_redirect`
      res.redirect(redirectUrl)
    }

    if (req.query.code && req.query.state && req.isUnauthenticated()) {
      // 判断是否有access_token则是否过期
      const authAccessToken = checkUserAccessToken(req.session.userAccessToken)
      // 未过期
      if (authAccessToken) return next()
      let userAccessToken
      try {
        const userAccessTokenResponse = await service.getUserAccessToken({
          appid: cache.config.WXAPPID,
          appsecret: cache.config.WXAPPSECRET,
          code: req.query.code
        })
        userAccessToken = userAccessTokenResponse.data
      } catch (e) {
        console.log(e)
      }
      if (userAccessToken.openid && userAccessToken.access_token) {
        req.session.userAccessToken = userAccessToken
        req.session.userAccessToken.expires_in = Date.now() + (parseInt(userAccessToken.expires_in, 10) - 200) * 1000
        next()
      } else {
        redirectFunc()
      }

    } else if (!req.session || !req.session.userAccessToken || !req.session.userAccessToken.openid) {
      redirectFunc()
    } else {
      next()
    }
  }
}

/**
 * 用户微信信息
 */
const authWxInfo = ({ wechatapi, service, cache }) => {
  return async (req, res, next) => {
    if (/\w*.js|\w*.css|\w*.html|\w*.png|\w*.jpg|\w*.jpeg/.test(req.url)) return next()

    if (req.isAuthenticated()) return next()

    const redirectFunc = () => {
      // 拼装重定向
      const currentUrl = encodeURI(cache.config.HOST + req.originalUrl)
      const redirectUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${cache.config.WXAPPID}&redirect_uri=${currentUrl}&response_type=code&scope=snsapi_base&state=redirect#wechat_redirect`
      res.redirect(redirectUrl)
    }

    const getUserInfo = async () => {
      return new Promise((resolve, reject) => {
        wechatapi.getUserAsync(req.session.userAccessToken.openid).then(resolve, error => {
          console.log('获取用户微信信息错误：', error)
          if (error && error.code === 40001) {
            wechatapi.getAccessToken((err) => {
              if (err) {
                return reject(error)
              } else {
                wechatapi.getUserAsync(req.session.userAccessToken.openid).then(resolve, reject)
              }
            })
          } else {
            reject(error)
          }
        })
      })
    }


    if (!req.query.code) {
      console.log('【INFO】url中没有code，重定向')
      redirectFunc()
    }
    // 获取openid
    if (!req.session.userAccessToken || !req.session.userAccessToken.access_token) {
      console.error('【ERROR】查询用户信息失败, access_token为空')
      redirectFunc()
    }
    let userinfo
    try {
      userinfo = await getUserInfo()
    } catch (e) {
      console.error('【ERROR】查询用户信息失败 :', e)
      redirectFunc()
    }

    if (userinfo && userinfo.errcode) {
      console.error(`【ERROR】查询用户信息失败，错误码${userinfo.errcode}`)
      redirectFunc()
    }
    if (!userinfo || !userinfo.openid) {
      console.error(`【ERROR】查询用户信息失败，没有用户openid`)
      redirectFunc()
    }
    if (!req.login) {
      console.error(`【ERROR】查询用户信息失败，平台没有req.login`)
      redirectFunc()
    }
    req.login({ wxinfo: userinfo }, (err) => {
      err ? console.error(`【ERROR】查询用户信息失败,${err.message}`) : console.log(`【INFO】查询用户成功,${JSON.stringify(userinfo)}`)
      redirectFunc()
    })
  }
}

module.exports = ({ wechatapi, service, cache }) => {
  return {
    incept: incept({ wechatapi, cache }),
    authAccess: authAccess({ wechatapi, service, cache }),
    authWxInfo: authWxInfo({ wechatapi, service, cache })
  }
}