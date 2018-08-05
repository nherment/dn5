const db = require('../../common/db')()
const logger = require('logacious')()

function searchMonitors(searchTerm, limit, callback) {

  logger.info('searchMonitors', searchTerm, limit)
  db.searchMonitors(searchTerm || '', limit, (err, monitors) => {
    if(err) {
      logger.error(err)
    }
    callback(err, monitors)
  })
}

function createMonitor(monitor, callback) {

  logger.info('createMonitor', monitor)
  db.createMonitor(monitor.name, 
                   monitor.url,
                   monitor.expectedStatusCode,
                   monitor.frequencySeconds,
                   monitor.validationLogic, 
                   (err, createdMonitor) => {
    if(err) {
      logger.error(err)
    }
    callback(err, createdMonitor)
  })
}

function updateMonitor(monitor, callback) {

  logger.info('updateMonitor', monitor)
  db.updateMonitor(monitor.id, 
                   monitor.name,
                   monitor.url,
                   monitor.expectedStatusCode,
                   monitor.frequencySeconds,
                   monitor.validationLogic,
                   monitor.isPublic,
                   monitor.isActive, (err, updatedMonitor) => {
    if(err) {
      logger.error(err)
    }
    callback(err, updatedMonitor)
  })
}

function deleteMonitor(monitor, callback) {

  logger.info('deleteMonitor', monitor)
  db.deleteMonitor(monitor.id, (err) => {
    if(err) {
      logger.error(err)
    }
    callback(err)
  })
}

function fetchMonitorsStatuses(fetchPrivateMonitors, callback) {

  db.fetchMonitorsStatuses(fetchPrivateMonitors, (err, statuses) => {
    if(err) {
      logger.error(err)
    }
    callback(err, statuses)
  })
}

function fetchMonitorDetailedStatus(monitorId, callback) {
  db.fetchMonitorDetailedStatus(monitorId, (err, results) => {
    if(err) {
      logger.error(err)
    }
    callback(err, results ? results[0] : null)
  })
}

module.exports = {
  searchMonitors,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  fetchMonitorsStatuses,
  fetchMonitorDetailedStatus
}