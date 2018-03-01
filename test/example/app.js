
const app = require('express')
// ...
const wxutil = require('./wx')

//...

app.use('/', wxutil.server.access.authAccess, wxutil.server.access.authWxInfo, (req, res, next) => {
  // do something
})

//...

