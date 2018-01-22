
const schedule = require('node-schedule')
const wxinfo = require('./index')

// 定时查询acces_token
const queryAccessToken = (appid, appsecret) => {
  console.info('INFO> 开始查询access_token')
  return wxinfo.service.getAccessToken({
    appid, appsecret
  })
  .then(access => {
    console.info('INFO> 查询access_token成功,' + access.data.access_token)
    access.data.expires_in = Date.now() + (parseInt(access.data.expires_in) - 200) * 1000
    wxinfo.cache.wxinfo.access = access.data
    return Promise.resolve(wxinfo.cache.wxinfo.access.access_token)
  })
}
// 定时刷新js_api_ticket
const queryJSApiTicket = (accesstoken) => {
  if (accesstoken) {
    console.info(`INFO> 开始查询js_api_ticket`)
    return wxinfo.service.getJsApiTicket({
      accesstoken
    })
    .then(jsapi => {
      console.info(`INFO> 查询js_api_ticket成功，${jsapi.data.ticket}`)
      jsapi.data.expires_in = Date.now() + (parseInt(jsapi.data.expires_in) - 200) * 1000
      wxinfo.cache.wxinfo.jsapi = jsapi.data
      return wxinfo.cache.wxinfo
    })
  } else {
    return Promise.reject(`access not found !`)
  }
}

module.exports = (app) => {
  const rule = new schedule.RecurrenceRule()
  rule.minute = 110

  const jobFunc = () => {
    queryAccessToken(process.env.WXAPPID, process.env.WXAPPSECRET)
    .then(queryJSApiTicket)
    .catch(error => {
      console.error(`>> 更新access_token、JSApiTicket失败,${error}`)
    })
  }
  jobFunc()

  const job = schedule.scheduleJob(rule, jobFunc)
  app.scheduleJobs = [job]
}
