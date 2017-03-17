const server = require('./server')
const capture = require('./startCapture')

const config = require('../../config.json')

capture.captureFromFitzbox(config)

server.startServer(3000)
