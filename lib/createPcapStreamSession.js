const pcap = require('pcap')
const fs = require('fs')

try {
  var pcapStreamSession = createPcapSessionFromStream()

  console.log('Session created.')

  var outStreamToParent = fs.createWriteStream(null, {fd: 3})
  // outStreamToParent.objectMode = true

  var counter = 0
  pcapStreamSession
  .on('packet', (rawPacket) => {
    try {
      counter++
      var jsonPacket = JSON.stringify(rawPacket, null, 2)
      var rebuiltPacket = JSON.parse(jsonPacket)
      // console.log(jsonPacket)
      outStreamToParent.write(jsonPacket)
      // file too big for buffer!
      console.log('pcapStream: Sending ', counter, jsonPacket.length)
    } catch (e) {
      console.log('Error sending: ', e)
    }
  })
} catch (error) {
  console.log('Error creating a pcapStreamSession: ', error)
}

process.on('message', (message) => {
  console.log('CHILD Got reply: ', message)
})

function createPcapSessionFromStream () {
  var pcapSession = pcap.createOfflineSession('-', '')
  return pcapSession
}
