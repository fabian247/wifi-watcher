const pcap = require('pcap')
const net = require('net')
const exposeWebsites = require('./expose_websites')
const database = require('./database')

try {
  var pcapStreamSession = createPcapSessionFromStream()

  console.log('Session created.')

  process.on('message', (message) => {
    console.log('CHILD Got reply: ', message)
  })

  var counter = 0
  pcapStreamSession
  .on('packet', (rawPacket) => {
    try {
      counter++
      var decodedPacket = pcap.decode.packet(rawPacket)
      var route = exposeWebsites.getRouteFromPacket(decodedPacket)
      database.writeConnectionToDatabase(route)
      var jsonPacket = JSON.stringify(route, null, 2)
      writeOnStream(jsonPacket)
    } catch (e) {
      console.log('Error sending: ', e)
    }
  })
  .on('complete', () => {
    console.log('pcapStream: complete')
  })
} catch (error) {
  console.log('Error creating a pcapStreamSession: ', error)
}

function writeOnStream (jsonPacket) {
  if (process.send(jsonPacket)) {
    console.log('Counter: ', counter, jsonPacket.length)
  }
}

function createPcapSessionFromStream () {
  var pcapSession = pcap.createOfflineSession('-', '')
  return pcapSession
}
