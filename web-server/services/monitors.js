const db = require('../../common/db')()
const logger = require('logacious')()

function searchMonitors(searchTerm, limit, callback) {

  logger.info('searchMonitors', searchTerm, limit)
  db.searchMonitors(searchTerm || '', limit, (err, monitors) => {
    if(err) {
      logger.error(err)
    } else {
      logger.info('searchMonitors result',
      searchTerm,
      limit,
      monitors ? monitors.length : 0)
    }
    callback(err, monitors)
  })
}

module.exports = {
  searchMonitors
}