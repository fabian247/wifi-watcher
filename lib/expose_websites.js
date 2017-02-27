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
  try {
    var pcapSession = pcap.createOfflineSession(filename, '')
  } catch (err) {
    var error
    if (err.message.includes('No such file')) {
      console.log('No file')
      error = new Error('No such file')
    } else if (err.message.includes('truncated dump file')) {
      console.log('truncated')
      error = new Error('File is empty or truncated')
    }
  }

  // wait until file is processed
  return new Promise((resolve, reject) => {
    if (error) {
      reject(error)
    } else {
      var decodedPackets = { packets: [] }
      pcapSession.on('packet', (rawPacket) => {
        addPacketToDecodedPackets(decodedPackets, pcap.decode.packet(rawPacket))
      })
      pcapSession.on('complete', () => {
        console.log('Reading file done.')
        console.log('Read %d packages', decodedPackets.packets.length)
        pcapSession.close()
        resolve(decodedPackets)
      })
    }
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
