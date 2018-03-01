
/**
 * 获取永久素材列表
 * 详情请见： http://mp.weixin.qq.com/wiki/12/2108cd7aafff7f388f41f37efa710204.html
 */
const getMaterials = (wechatapi, cache) => {
  return async (req, res, next) => {
    let count = req.query.count || 20
    if (typeof count === 'string') count = parseInt(count)
    count = count > 20 ? 20 : count
    const offset = req.query.offset || 0
    const type = req.query.type || 'news'
    try {
      const reuslt = await wechatapi.getMaterialsAsync(type, offset, count)
      res.send({ message: 'ok', data: result })
    } catch(e) {
      return res.status(500).send({ error: e.message })
    }
  }
}

module.exports = ({ wechatapi, cache }) => {
  return {
    getMaterials: getMaterials(wechatapi)
  }
}

