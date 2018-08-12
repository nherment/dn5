

const stream = require('stream')
const moment = require('moment')

module.exports = (auth) => {
  const app = require('express').Router()
  const monitors = require('./services/monitors')
  const exporter = require('./services/exporter')

  app.use(require('./util/error-response.js'))
  app.use(require('./util/callback-response.js'))

  app.get('/monitors', (req, res) => {
    monitors.searchMonitors(req.query.searchTerm, 10, res.handleCallback)
  })

  app.get('/monitors-statuses', (req, res) => {
    monitors.fetchMonitorsStatuses(/*incl. private*/!!req.user, res.handleCallback)
  })

  app.get('/excel/:monitorId', function(req, res) {
    exporter.exportMonitorToExcel(req.user, req.params.monitorId, (err, data) => {
      if(err) {
        res.error(err)
      } else {
        res.set('Content-disposition', `attachment; filename="monitoring_report_${data.monitor.name}_${moment(data.monitor.maxDate).format('YYYY-MM-DD_HHMM')}.xlsx"`)
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        var readStream = new stream.PassThrough()
        readStream.end(data.xlsx)
        readStream.pipe(res)
      }
    })
  })

  app.get('/monitor/:monitorId', (req, res) => {
    monitors.fetchMonitorDetailedStatus(req.params.monitorId, res.handleCallback)
  })

  app.use(auth.requireAuthentication())

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
  return app
}