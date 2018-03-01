

const handler = {
  EVENT_KEY: () => {
    // 处理方式
  }
}


module.exports = () => {
  return async (openid, eventData) => {
    const eventKey = eventData.eventkey && eventData.eventkey.length ? eventData.eventkey[0] : ''
    const eventHandler = handler[eventKey]
    if (eventHandler) {
      const handlerResult = await eventHandler(openid)
      return handlerResult
    }
    return `${eventkey} no register`
  }
}