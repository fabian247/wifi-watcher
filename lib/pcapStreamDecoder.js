const pcap = require('pcap')
const exposeWebsites = require('./expose_websites')
const database = require('./database')

process.on('message', (message) => {
  console.log('pcapStreamDecoder got message: ', message)
})

function pcapStreamDecoder () {
  try {
    var pcapStreamSession = module.exports.createPcapSessionFromStdin()
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
      writeOnStream(route)
    } catch (e) {
      console.log('Error decoding and sending: ', e)
    }
  })
  .on('complete', () => {
    console.log('pcapStream: complete')
  })
}

function writeOnStream (data) {
  var jsonPacket = JSON.stringify(data, null, 2)
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
