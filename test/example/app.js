
const express = require('express')
const app = express()
// ...
const wxutil = require('./wx')

//...

app.use('/', wxutil.server.access.authAccess, wxutil.server.access.authWxInfo, (req, res, next) => {
  // do something
})

const params = {
  'appid': 'APPID', 
  'attach': '支付测试',
  'body': '支付测试内容',
  'mch_id': 'MCH_ID',
  'nonce_str': '' + new Date().valueOf(),
  'notify_url': 'NOTIFY_URL', 
  'openid': 'o-HgKxCqizyRQVkJ-U-6we0YOwdw', 
  'out_trade_no': '100021',
  'spbill_create_ip': '172.0.0.1',
  'total_fee': "1",
  'trade_type': 'JSAPI',
  key: 'KEY'
}
wxutil.service.prepay(params).then((result) => {
  console.log("SUCCESS:",result)
}).catch((err) => {
  console.log('FAIL:', err)
});


app.listen(9999, function() {
  console.log('example start on 9999')
})

//...

