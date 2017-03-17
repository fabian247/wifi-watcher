const pcap = require('pcap')
const exposeWebsites = require('./expose_websites')
const database = require('./database')

process.on('message', (message) => {
  console.log('pcapStreamDecoder got message: ', message)
})

function pcapStreamDecoder () {
  try {
    var pcapStreamSession = module.exports.createPcapSessionFromStream()
    console.log('Session created.')
  } catch (error) {
    console.error('Error creating a pcapStreamSession: ', error)
  }

  pcapStreamSession
  .on('packet', (rawPacket) => {
    try {
      var decodedPacket = pcap.decode.packet(rawPacket)
      var route = exposeWebsites.getRouteFromPacket(decodedPacket)
      database.writeConnectionToDatabase(route)
      var jsonPacket = JSON.stringify(route, null, 2)
      writeOnStream(jsonPacket)
    } catch (e) {
      console.log('Error decoding and sending: ', e)
    }
  })
  .on('complete', () => {
    console.log('pcapStream: complete')
  })
}

function writeOnStream (jsonPacket) {
  if (!process.send(jsonPacket)) {
    // TODO
  }
}

function createPcapSessionFromStdin () {
  var pcapSession = pcap.createOfflineSession('-', '')
  return pcapSession
}

module.exports = {
  createPcapSessionFromStdin,
  writeOnStream,
  pcapStreamDecoder
}
