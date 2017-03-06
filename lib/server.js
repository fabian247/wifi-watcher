const express = require('express')

const io = require('./fileIO')

const dbFilename = 'database.json'

var app = express()

app.use('/images', express.static('../website/public/images'))
app.use('/styles', express.static('../website/public/styles'))
app.set('view engine', 'pug')

/**
 * set response for all routes
 * load database from file, filter for IP address of request, return values if any
 */
app.all('*', (req, res) => {
  var myIP = req.connection.remoteAddress
  console.log(myIP)
  var db = io.loadDatabase('../' + dbFilename)
  var ipList = io.getEntriesFromDB(db, myIP)
  res.render('template', {myIP, ipList})
})

/**
 * Returns basic express server rensponding on every request with the same page
 * @param port - Number representing the port the server will listen for connections
 * @return express - running express server
 */
function startServer (port) {
  app = app.listen(port, () => {
    console.log('Server listening on port %d.', port)
  })
  return app
}

/**
 * Stops the express server
 */
function stopServer () {
  app.close(() => {
    console.log('Server closing.')
  })
}

module.exports = {
  startServer,
  stopServer
}
