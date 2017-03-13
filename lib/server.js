const router = require('../lib/router')

function startServer (port) {
  var server = router.makeServer(port)
  return server
}

function stopServer (server) {
  router.stopServer(server)
}

module.exports = {
  startServer,
  stopServer
}
