
const app = require('express').Router()
const monitors = require('./services/monitors')

app.use(require('./util/error-response.js'))
app.use(require('./util/callback-response.js'))

app.get('/monitors', (req, res) => {
  monitors.searchMonitors(req.query.searchTerm, 10, res.handleCallback)
})
app.get('/monitors-statuses', (req, res) => {
  monitors.fetchMonitorsStatuses(/*incl. private*/false, res.handleCallback)
})
app.post('/monitor', (req, res) => {

  const monitor = req.body;
  if(monitor && monitor.id) {
    monitors.updateMonitor(monitor, res.handleCallback)
  } else {
    monitors.createMonitor(monitor, res.handleCallback)
  }
})
app.delete('/monitor/:monitorId', (req, res) => {
  monitors.deleteMonitor(req.params.monitorId, res.handleCallback)
})


module.exports = () => {
  return app
}