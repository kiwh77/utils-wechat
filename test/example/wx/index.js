

// const WxUtil = require('utils-wechat')
const WxUtil = require("../../src")

const wxutil = new WxUtil({
  WXAPPID: 'APPID',
  WXAPPSECRET: 'APPSECRET'
})

// 载入的模块
wxutil.load([ 'server', 'events' ])

// 回调事件处理
wxutil.registerEvent({
  click: __dirname + '/click.js'
})

module.exports = wxutil


