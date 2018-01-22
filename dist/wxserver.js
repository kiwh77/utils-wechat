/**
 * 接收微信发送过来的消息
 */
module.exports = (req, res, next) => {
  if (req.query.signature && req.query.echostr && req.query.timestamp && req.query.nonce) {
    // 如果是验证服务器的，则直接返回要求字符串
    res.send(req.query.echostr)
    res.end()
  }
}
