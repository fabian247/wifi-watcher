const pcap = require('pcap')

/**
 *
 **/
function getDecodedPackets (filename) {
  const pcapSession = pcap.createOfflineSession(filename, '')
  var decodedPackets = pcapSession.on('packet', (rawPacket) => {
    // console.log(pcap.decode.packet(rawPacket))
    return pcap.decode.packet(rawPacket)
  })
  return decodedPackets
}

module.exports = { getDecodedPackets }
