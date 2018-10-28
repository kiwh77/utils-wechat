
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
const authAccess = ({wechatapi, service, cache}) => {
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
      let currentUrl
      if (/\?\w*code=\w/.test(req.url)) {
        currentUrl = cache.config.HOST + req.originalUrl.split('?')[0]
      } else {
        currentUrl = encodeURI(cache.config.HOST + req.originalUrl)
      }
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

    // const redirectFunc = () => {
    //   // 拼装重定向
    //   let currentUrl
    //   const HOST = cache && cache.config ? cache.config.HOST : ''
    //   if (/\?\w*code=\w/.test(req.url)) {
    //     currentUrl = encodeURI(HOST + req.originalUrl.split('?')[0])
    //   } else {
    //     currentUrl = encodeURI(HOST + req.originalUrl)
    //   }
    //   const redirectUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${cache.config.WXAPPID}&redirect_uri=${currentUrl}&response_type=code&scope=snsapi_base&state=redirect#wechat_redirect`
    //   res.redirect(redirectUrl)
    // }

    const getUserInfo = async () => {
      return new Promise((resolve, reject) => {
        wechatapi.getUserAsync(req.session.userAccessToken.openid).then(resolve, error => {
          if (error && error.code === 40001 ) {
            wechatapi.getAccessToken((err, token) => {
              console.log(err, token)
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

    if (req.query.code && req.query.state && req.isUnauthenticated()) {
      // 获取openid
      if (req.session.userAccessToken && req.session.userAccessToken.access_token) {
        let userinfo 
        try {
          userinfo = await getUserInfo()
        } catch (e) {
          console.log('查询用户用户错误 :', e, `${req.session.userAccessToken}`)
        }
        
        if (userinfo && userinfo.errcode) {
          console.error(`查询用户信息失败,${userinfo.errcode},${JSON.stringify(req.session.userAccessToken)}`)
          return next()
        }
        if (userinfo) {
          if (req.login) {
            req.login({ wxinfo: userinfo }, (err) => {
              err ? console.log(`ERROR>> 查询用户信息失败,${err.message}`) : console.log(`INFO>> 查询用户成功,${JSON.stringify(userinfo)}`)
              next()
            })
          } else {
            console.log(`INFO>> 未发现login`)
            next()
          }
        } else {
          console.log(`WARNING>> 查询用户信息失败`)
          next()
        }
      }
    } else {
      next()
    }
  }
}

module.exports = ({ wechatapi, service, cache }) => {
  return {
    incept: incept({wechatapi, cache}),
    authAccess: authAccess({wechatapi, service, cache}),
    authWxInfo: authWxInfo({wechatapi, service, cache})
  }
}