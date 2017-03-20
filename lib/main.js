const server = require('./server')
const capture = require('./startCapture')

const config = require('../../config.json')

try {
  capture.captureFromFitzbox(config)
  server.startServer(3000)
} catch (e) {
  console.log('Erorr in main: ', e)
}
