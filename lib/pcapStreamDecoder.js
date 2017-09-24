const pcap = require('pcap')
const exposeWebsites = require('./expose_websites')
const database = require('./database')

process.on('message', (message) => {
  console.log('pcapStreamDecoder got message: ', message)
})

pcapStreamDecoder()

function pcapStreamDecoder () {
  try {
    var pcapStreamSession = createPcapSessionFromStdin()
    console.log('Session created.')
  } catch (error) {
    console.error('Error creating a pcapStreamSession: ', error)
  }

  pcapStreamSession
  .on('packet', (rawPacket) => {
    try {
      const decodedPacket = pcap.decode.packet(rawPacket)
      const route = exposeWebsites.getRouteFromPacket(decodedPacket)
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
}
