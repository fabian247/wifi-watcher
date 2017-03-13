const pcap = require('pcap')
const pcapParser = require('./pcap-parser')
const exposeWebsites = require('./expose_websites')
const io = require('./decodeCaptureFile')

var spawn = require('child_process').spawn

const cmd = './bin/loginAndGetDataFromFritz.sh'

// TODO: check config, check stream,
// TODO: return emitter, remove event handling
function captureFromFitzbox (config) {
  try {
    var stream = startCapture(config)
    var parser = pcapParser.parse(stream.stdout)
    parser.on('packet', (rawPacket) => {
      handlePacket(rawPacket)
    })
    parser.on('complete', () => {
      console.log('complete')
    })
  } catch (err) {
    console.log('Failed to capture from Fritzbox.')
    throw err
  }
}

function startCapture (config) {
  var child = spawn('bash', [cmd].concat(config))
  child.on('error', (err) => {
    console.log('Failed to start capturing.')
    throw err
  })
  return child
}

function handlePacket (rawPacket) {
  var decodedPacket = pcap.decode.packet(rawPacket)
  var route = exposeWebsites.getRouteFromPacket(decodedPacket)
  io.writeConnectionToDatabase(route)
}

module.exports = {
  captureFromFitzbox,
  startCapture,
  handlePacket
}
