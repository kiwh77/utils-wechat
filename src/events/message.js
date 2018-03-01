


const wxutil = require('./index')

/**
 * 发送普通消息
 * @param template 消息模板
 * @param params 替换参数
 * @param recipient 接收的openid, 数组
 */
const sendMessage = ({wechatapi}) => {
  return async (notify) => {
    // 推送模板
    const template = notify.template;

    // 推送参数替换
    if (notify.params) {
      for (var key in notify.params) {
        var reg = '{{' + key + '}}';
        template = template.replace(reg, params[key]);
      }
    }

    // 推送openid
    const recipient = notify.recipient;
    if (recipient && recipient.length) {
      try {
        const result = await Promise.all(recipient.map(oid => wechatapi.sendTextAsync(oid, template)))
        recipient.forEach((oid, index) => console.log(`${oid} : ${result[index] && result[index].errmsg}`))
        return Promise.resolve(result)
      } catch (e) {
        console.error('发送反馈信息时失败' + e.message);
        return Promise.reject(e)
      }
    } else {
      return Promise.resolve('未设置推送对象openid,recipient')
    }
  }
}

/**
 * 发送模板消息
 * @param {openid} templateid 
 */
const sendTemplateMessage = ({wechatapi}) => {
  return async ({ openid, templateid, url, data }) => {
    try {
      const result = await wechatapi.sendTemplateAsync(openid, templateid, url, data)    
      return Promise.resolve(result)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = ({ wechatapi, cache }) => {
  return {
    sendMessage: sendMessage({wechatapi}),
    sendTemplateMessage: sendTemplateMessage({wechatapi})
  }
} 