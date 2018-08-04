
const app = require('express').Router()
const monitors = require('./services/monitors')

app.use(require('./util/error-response.js'))
app.use(require('./util/callback-response.js'))

app.get('/monitors', (req, res) => {

  monitors.searchMonitors(req.query.searchTerm, 10, res.handleCallback)

})


module.exports = () => {
  return app
}