

module.exports = ({ wechatapi, cache }) => {
  return {
    menu: require('./menu')( {wechatapi, cache }),
    materials: require('./materials')({ wechatapi, cache }),
    message: require('./message')({ wechatapi })
  }
}