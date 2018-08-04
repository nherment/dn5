const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const conf = require('../common/conf')
const app = next({ dev: !conf.isProduction })
const handle = app.getRequestHandler()
const migration = require('../common/migration')
const api = require('./api.js')


app.prepare()
  .then(migration)
  .then(() => {
    console.log('starting up server')
    const server = express()

    // server.get('/', (req, res) => {
    //   return app.render(req, res, '/', req.query)
    // })

    server.use('/api', api())
    
    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
      require('../monitor-worker')
    })
  })