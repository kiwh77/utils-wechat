
const assert = require('assert')

const authSceneid = (sceneid) => {
  if (typeof sceneid === 'number' && (sceneid > 100000 || sceneid < 1)) return false
  if (typeof sceneid === 'string' && (sceneid === '' || sceneid.length > 64)) return false
  return true  
}

const createTempQrcode = ({ wechatapi }) => {
  return async (req, res, next) => {
    try {
      const sceneid = req.body.sceneid
      const expire = req.body.expire || 1800
      assert(sceneid, '场景参数不能为空')
      assert(authSceneid(sceneid), '场景参数不合规，数字大于1且小于100000或字符长度大于1小于64')
      const qrcodeInfo = await wechatapi.createTmpQRCodeAsync(sceneid, expire)
      if (qrcodeInfo && qrcodeInfo.ticket) {
        const qrcodeUrl = await wechatapi.showQRCodeURL(qrcodeInfo.ticket)
        qrcodeInfo.url = qrcodeUrl
      }
      return res.status(200).send({data: qrcodeInfo})
    } catch(e) {
      return res.status(500).send({error: e.message || e})
    }
  }
}
const createLimitQrcode = ({ wechatapi }) => {
  return async (req, res, next) => {
    try {
      const sceneid = req.body.sceneid
      assert(sceneid, '场景参数不能为空')
      assert(authSceneid(sceneid), '场景参数不合规，数字大于1且小于100000或字符长度大于1小于64')
      const qrcodeInfo = await wechatapi.createLimitQRCode(sceneid)
      if (qrcodeInfo && qrcodeInfo.ticket) {
        const qrcodeUrl = await wechatapi.showQRCodeURL(qrcodeInfo.ticket)
        qrcodeInfo.url = qrcodeUrl
      }
      return res.status(200).send({data: qrcodeInfo})
    } catch(e) {
      return res.status(500).send({error: e.message || e})
    }
  }
}


module.exports = ({ wechatapi }) => {
  return {
    createTempQrcode: createTempQrcode({ wechatapi }),
    createLimitQRCode: createLimitQrcode({ wechatapi })
  }
}