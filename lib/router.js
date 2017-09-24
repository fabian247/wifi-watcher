import express from 'express'

const db = require('./database')

// TODO: filename in config file --> same everywhere
const dbFilename = 'database.json'

const router = express()

router.use('/images', express.static('../website/public/images'))
router.use('/styles', express.static('../website/public/styles'))
router.set('view engine', 'pug')

 // TODO: make work with IPv6 space
 // TODO: add more information for connections
router.all('*', (req, res) => {
  var myIP = req.connection.remoteAddress
  myIP = removeIPv6Preface(myIP)
  var database = db.loadDatabase('../' + dbFilename)
  var ipArray = []
  if (database) {
    ipArray = db.getEntriesFromDatabase(database, myIP)
  }
  res.render('template', {myIP, ipList: ipArray})
})

const removeIPv6Preface = (myIP) => {
  return myIP.replace('::ffff:', '')
}

const makeServer = (port) => {
  var server = router.listen(port, () => {
    console.log('Server listening on port %d.', port)
  })
  return server
}

const killServer = (server) => {
  server.close(() => {
    console.log('Server closing.')
  })
}

module.exports = {
  makeServer,
  killServer,
  removeIPv6Preface
}
