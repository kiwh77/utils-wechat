
const WechatApi = require('wechat-api')
const BB = require('bluebird').Promise

/** 
 * env： 环境，获取access_token和jsapi_ticket
 * service: 提供功能块
 * authOpenid: 获取openid等微信信息
 * authAccessToken: 获取用户access_token等信息
 * server: 接口处理中间件
 * events: 微信官文事件处理
 * notify: 消息发送封装
 */
function WxUtil ({ config }) {
  this.cache = {
    wxinfo: {},
    eventRegister: {},
    config
  }
  this.service = require('./service')
  this.asyncWechatapi = new WechatApi(config.WXAPPID, config.WXAPPSECRET)
  this.wechatApi = BB.promisifyAll(this.asyncWechatapi)
  /**
   * 加载所需模块
   * @param components [{name: '模块名', params: '模块所需依赖'}]
   *        server.access 环境及验证
   *        server.schedule 定时器
   *        server.signature 签名接口
   *        events.menu 菜单相关接口
   *        events.materials 素材相关接口
   *        events.message 消息相关接口
   */
  this.load = (components) => {
    if (Array.isArray(components)) {
      components.forEach(component => {
        const cominstance = require(`./${component}`)
        cominstance ? (this[component] = cominstance({
          wechatapi: this.wechatApi,
          service: this.service,
          cache: this.cache
        })) : console.info(`component ${component} can't find!`)
      })
    }
  }

  this.registerEvent = (events) => {
    Object.keys(events).forEach(key => {
      this.cache.eventRegister[key] = events[key]
    })
  }
}

module.exports = WxUtil

