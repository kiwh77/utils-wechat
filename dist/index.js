
/**
 * 获取access_token中间件, 缓存在cache中
 */
module.exports.config = require('./config')

/**
 * 方法合集，封装获取access_token、ticket等的函数
 */
module.exports.service = require('./service')

/**
 * 进入页面获得openid中间件
 */
module.exports.info = require('./info')

/** 缓存 */
module.exports.cache = require('./cache')

/** 前端获取签名中间件 */
module.exports.signature = require('./signature')

/** 微信服务器回调 */
module.exports.wxserver = require('./wxserver')

/** access_token,api_ticket 管理定时器 */
module.exports.schedule = require('./schedule')
