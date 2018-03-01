

module.exports = ({ wechatapi, service, cache }) => {
  return {
    access: require('./access')({ wechatapi, service, cache }),
    signature: require('./signature')({ wechatapi, cache})
  }
}