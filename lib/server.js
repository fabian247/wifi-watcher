import { makeServer, killServer } from '../lib/router'

const startServer = (port) => {
    var server = makeServer(port)
    return server
}

const stopServer = (server) => {
    killServer(server)
}

module.exports = {
    startServer,
    stopServer
}
