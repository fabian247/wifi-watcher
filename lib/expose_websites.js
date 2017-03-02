const pcap = require('pcap')
const dns = require('dns')
/**
 *
 **/
function getDecodedPacketsFromFile (filename) {
  try {
    var pcapSession = pcap.createOfflineSession(filename, '')
  } catch (err) {
    var error
    if (err.message.includes('No such file')) {
      // console.log('No file')
      error = new Error('No such file')
    } else if (err.message.includes('truncated dump file')) {
      // console.log('truncated')
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
        // console.log('Reading file done.')
        // console.log('Read %d packages', decodedPackets.packets.length)
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
  var result = {
    senderIP: packet.saddr.toString(),
    receiverIP: packet.daddr.toString()
  }
  // console.log('IPv4: ', result)
  return result
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
function lookupWebsites (a) {
  return new Promise((resolve, reject) => {
    dns.reverse(a, (err, domains) => {
      if (err) {
        reject(err)
      }
      console.log('reverse for ' + a + ': ' +
      domains)
      resolve(domains)
    })
  })
}

module.exports = {
  getDecodedPacketsFromFile,
  lookupWebsites,
  processPacket,
  handleIPv4Packet,
  handleIPv6Packet
}
