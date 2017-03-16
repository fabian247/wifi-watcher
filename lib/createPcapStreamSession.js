const pcap = require('pcap')

try {
  var pcapStreamSession = createPcapSessionFromStream()

  console.log('Session created.')

  pcapStreamSession
  .on('packet', (rawPacket) => {
    if (process.send(rawPacket)) {
      console.log('pcapStream: Sending')
    }
  })
} catch (error) {
  console.log('Error creating a pcapStreamSession: ', error)
}

// process.on('message', (message) => {
//   console.log('CHILD Got reply: ', message)
// })

function createPcapSessionFromStream () {
  var pcapSession = pcap.createOfflineSession('-', '')
  return pcapSession
}
