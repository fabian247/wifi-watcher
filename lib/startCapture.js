const pcap = require('pcap')
const exposeWebsites = require('./expose_websites')
const database = require('./database')

var spawn = require('child_process').spawn
var fork = require('child_process').fork

const pcapStream = './lib/createPcapStreamSession'
const cmd = './bin/loginAndGetDataFromFritz.sh'

// TODO: check config, check stream,
// TODO: return emitter, remove event handling
function captureFromFitzbox (config) {
  try {
    var captureChild = startFritzboxCapture(config)

    captureChild.stdout.pause()
    var forkOpts = {stdio: [ 'pipe', 'inherit', 'pipe', 'ipc' ]}
    var pcapStreamChild = fork(pcapStream, [], forkOpts)
    captureChild.stdout.pipe(pcapStreamChild.stdin)

    pcapStreamChild.on('message', (rawPacket) => {
      console.log('startCapture: got Packet')
      if (pcapStreamChild.send({ item: 'Reply' })) {
        console.log('sent reply to child')
      }
      var packet = rawPacket
      handlePacket(packet)
    })
    pcapStreamChild.on('close', () => {
      console.log('startCapture: Child closed')
    })
    pcapStreamChild.stderr.on('data', (err) => {
      console.log('Error on ipc stream: ', err)
    })
  } catch (err) {
    console.log('Failed to capture from Fritzbox.')
    throw err
  }
}

function startFritzboxCapture (config) {
  var child = spawn('bash', [cmd].concat(config))
  child.on('error', (err) => {
    console.log('Failed to start capturing.')
    throw err
  })
  return child
}

function handlePacket (rawPacket) {
  rawPacket.header = Buffer.from(rawPacket.header)
  rawPacket.buf = Buffer.from(rawPacket.buf)
  try {
    var decodedPacket = pcap.decode.packet(rawPacket)
    var route = exposeWebsites.getRouteFromPacket(decodedPacket)
    database.writeConnectionToDatabase(route)
  } catch (err) {
    console.log(err)
  }
  console.log(route)
}

module.exports = {
  captureFromFitzbox,
  startFritzboxCapture,
  handlePacket
}
