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
async function getDecodedPackets (filename) {
  const pcapSession = pcap.createOfflineSession(filename, '')
  var decodedPackets = { packets: [] }
  pcapSession.on('packet', (rawPacket) => {
    addPacketToDecodedPackets(decodedPackets, pcap.decode.packet(rawPacket))
  })

  // wait until file is processed
  return new Promise((resolve, reject) => {
    pcapSession.on('complete', () => {
      console.log('Reading file done.')
      console.log('Read %d packages', decodedPackets.packets.length)
      resolve(decodedPackets)
    })
  })
}

/**
 *
 **/
function getWebsites (decodedPackets) {
  var websites = { route: [], dhosts: [], shosts: [] }
  console.log('Get Websites: ')
  for (let pkg of decodedPackets.packets) {
    // console.log(pkg.payload)
    if (pkg.payload.dhost) {
      websites.dhosts.push(pkg.payload.dhost)
    }
    if (pkg.payload.shost) {
      websites.shosts.push(pkg.payload.shost)
    }
  }
  console.log('Get Websites after for:')
  console.log('Get Websites: dhosts %d shosts %d', websites.dhosts.length, websites.shosts.length)
  return websites
}

module.exports = { getDecodedPackets, getWebsites }
