const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const conf = require('../common/conf')
const app = next({ dev: !conf.isProduction })
const handle = app.getRequestHandler()
const migration = require('../common/migration')
const api = require('./api.js')
const monitors = require('./services/monitors.js')

const bodyParser = require('body-parser')

app.prepare()
  .then(migration)
  .then(() => {
    console.log('starting up server')
    const server = express()

    server.use(bodyParser.json())
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