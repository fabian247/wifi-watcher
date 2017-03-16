const pcap = require('./wifi_watcher/node_modules/pcap')
const fs = require('fs')
const util = require('util')
const exposeWebsites = require('./wifi_watcher/lib/expose_websites')

var childProcess = require('child_process')
var spawn = childProcess.spawn

const cmd = './bin/loginAndGetDataFromFritz.sh'

var fileStream = fs.createReadStream('./iad-if-wlan_24.02.17_2029.eth')
fileStream.pause()
var testReader = fs.createReadStream('./iad-if-wlan_24.02.17_2029.eth')

var pcapSessionHandlerChild
fileStream.on('open', function(){
  fileStream.pause()
  pcapSessionHandlerChild = childProcess.fork('./pcapSessionHandler', [], { stdio: ['pipe', 'inherit', 'pipe', 'ipc' ]})
  // console.log('opened, got child')
  fileStream.pipe(pcapSessionHandlerChild.stdin)
  pcapSessionHandlerChild
  .on('message', (rawPacket) => {
    console.log('Handling Packet')
    handlePacket(rawPacket)
  })
})
testReader.addListener('data', (data) => {
  counter++
  console.log('Data sender: %d ',counter , data)
})
var counter = 0
setTimeout(function () {

}, 5000);


function startFritzboxCapture (config) {
  var child = spawn('bash', [cmd].concat(config))
  child.on('error', (err) => {
    console.log('Failed to start capturing.')
    throw err
  })
  return child
}

function handlePacket (rawPacket) {
  console.log(util.inspect((rawPacket), { depth: 1 }))
  rawPacket.header = Buffer.from(rawPacket.header)
  rawPacket.buf = Buffer.from(rawPacket.buf)
  try {
    var decodedPacket = pcap.decode.packet(rawPacket)
    var route = exposeWebsites.getRouteFromPacket(decodedPacket)
  } catch (err) {
    console.log(err)
  }
  console.log(route)
  // console.log(util.inspect((decodedPacket), { depth: 1 }))
}

module.exports = {
  startFritzboxCapture,
  handlePacket
}
