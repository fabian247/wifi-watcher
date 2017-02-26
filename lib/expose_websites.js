const pcap = require('pcap')

/**
 *
 **/
function addPacketToDecodedPackets (decodedPackets, packet) {
  decodedPackets.packets.push(packet)
}

/**
 *
 **/
function waitForFileProcessing (pcapSession) {
  return new Promise((resolve, reject) => {
    pcapSession.on('complete', () => {
      // console.log('Complete.')
      resolve(true)
    })
  })
}

/**
 *
 **/
async function getDecodedPackets (filename) {
  const pcapSession = pcap.createOfflineSession(filename, '')
  var decodedPackets = { packets: [] }
  pcapSession.on('packet', (rawPacket) => {
    // console.log(pcap.decode.packet(rawPacket))
    addPacketToDecodedPackets(decodedPackets, pcap.decode.packet(rawPacket))
  })

  // wait until file is processed
  await waitForFileProcessing(pcapSession)
  console.log('Reading file done.')
  console.log('Read %d packages', decodedPackets.packets.length)
  return new Promise((resolve, reject) => {
    resolve(decodedPackets)
  })
}

/**
 *
 **/
function getWebsites (decodedPackets) {
  return new Promise((resolve, reject) => {
    resolve(decodedPackets)
  })
}

module.exports = { getDecodedPackets, getWebsites }
