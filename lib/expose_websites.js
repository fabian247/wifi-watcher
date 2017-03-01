const pcap = require('pcap')

/**
 *
 **/
function getDecodedPacketsFromFile (filename) {
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
        decodedPackets.packets.push(pcap.decode.packet(rawPacket))
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
function processPacket (packet) {
  // console.log('Packet:', packet)
  switch (packet.payload.ethertype) {
    case 0x800:
      // console.log('Ipv4')
      // use module.exports.function for testability
      return module.exports.handleIPv4Packet(packet.payload.payload)
    case 0x86dd:
      // console.log('Ipv6')
      return module.exports.handleIPv6Packet(packet.payload.payload)
    default:
      return String('Don\'t know how to handle this packet of ethertype + %x', packet.payload.ethertype)
  }
}

/**
 *
 **/
function handleIPv4Packet (packet) {
  console.log('Ipv4 in function')
}

/**
 *
 **/
function handleIPv6Packet (packet) {
  console.log('Ipv6 in function')
}

/**
 *
 **/
function getWebsites (decodedPackets) {
  if ((!decodedPackets.packets) || (!Array.isArray(decodedPackets.packets))) {
    throw new Error('Wronge input.')
  }
  var websites = { dhosts: [], shosts: [] }
  // console.log(decodedPackets.packets[4].payload.payload)
  // console.log(decodedPackets.packets[7].payload.payload)
  // console.log(decodedPackets.packets[15].payload.payload)
  for (let pkg of decodedPackets.packets) {
    // console.log(pkg.payload)
    if (pkg.payload) {
      if (pkg.payload.dhost) {
        websites.dhosts.push(pkg.payload.dhost.toString())
      }
      if (pkg.payload.shost) {
        websites.shosts.push(pkg.payload.shost.toString())
      }
    }
  }
  console.log('Get Websites:')
  console.log('Get Websites: dhosts %d shosts %d', websites.dhosts.length, websites.shosts.length)
  return websites
}

/**
 *
 **/
function lookupWebsites (websiteIPs) {
  return websiteIPs
}

module.exports = {
  getDecodedPacketsFromFile,
  getWebsites,
  lookupWebsites,
  processPacket,
  handleIPv4Packet,
  handleIPv6Packet
}
