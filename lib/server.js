const expressPkg = require('express')

var express = expressPkg()

express.all('/*', (req, res) => {
  res.send('Your IP will be monitored.')
})

/**
 * Returns basic express server rensponding on every request with the same page
 * @param port - Number representing the port the server will listen for connections
 * @return express - running express server
 */
function startServer (port) {
  express = express.listen(port, () => {
    console.log('Server listening on port %d.', port)
  })
  return express
}

/**
 * Stops the express server
 */
function stopServer () {
  express.close(() => {
    console.log('Server closing.')
  })
}

module.exports = {
  startServer,
  stopServer
}
