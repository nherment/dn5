var Postgrator = require('postgrator')
var logger = require('logacious')()
var conf = require('./conf.js')

module.exports = () => {

  console.log('migration')
  conf.db.username = conf.db.user
  postgrator = new Postgrator(conf.db)
    
  postgrator.on('migration-started', migration => logger.info('Starting migration', migration))
  postgrator.on('migration-finished', migration => logger.info('Finished migration', migration))

  console.log('postgrator.migrate', conf.db.versionNumber)
  return postgrator.migrate(conf.db.versionNumber)
    .then(() => {
      logger.info('Migration successful')
      return Promise.resolve({})
    })
    .catch((err) => {
      logger.error('Migration failed', err)
      return Promise.reject(err)
    })

}