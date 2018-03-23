/**
 * 自定义菜单事件
 * 用户点击自定义菜单后，微信会把点击事件推送给开发者，请注意，点击菜单弹出子菜单，不会产生上报。
 * https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140454
 * 点击菜单拉取消息时的事件推送
 * 点击菜单跳转链接时的事件推送
 */


const assert = require('assert')

// 创建菜单
const createMenu = (wechatapi) => {
  return async (req, res, next) => {
    const menuData = req.body.menuData
    try {
      assert(menuData, '菜单信息不能为空')
      const result = await wechatapi.createMenuAsync(menuData)
      return res.status(200).send({message: result.errmsg})
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }  
}

// 获取菜单
const getMenu = (wechatapi) => {
  return async (req, res, next) => {
    try {
      const result = await wechatapi.getMenuAsync()
      return res.status(200).send({message: 'ok', data: result})  
    } catch(e) {
      return res.status(500).send({error: e.message })
    }
  }
}

module.exports = ({ wechatapi, cache }) => {
  return {
    createMenu: createMenu(wechatapi),
    getMenu: getMenu(wechatapi)
  }
}
