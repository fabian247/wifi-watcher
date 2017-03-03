const pcap = require('pcap')
const dns = require('dns')

/**
 * Return all packets from a capture file captured with fritzbox or wireshark
 * packets in file must be coded in pcap format
 * @param filename - String representing the filename on the computer
 * @return decodedPackets - object with array 'packets' of decoded pcap packets
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
 * Return sender and receiver ip adresses of all pcap packets in decodedPackets
 * @param decodedPackets - object with array 'packets' of type pcap packet
 * @return ipAdresses - array of objects holding sender and receiver IP adress
 * as strings {senderIP: 'String', receiverIP: 'String'}
 **/
function getWebsitesFromPackets (decodedPackets) {
  var ipAdresses = []
  for (var packet of decodedPackets.packets) {
    ipAdresses.push(processPacket(packet))
  }
  return ipAdresses
}

/**
 * Returns processing of a packet according to its type. IPv4 and IPv6 supported
 * @param packet - single decoded pcap packet
 * @return returns the method to process the packet, which returns the sender
 * and receiver IP adress
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
      return String('Don\'t know how to handle this packet of ethertype ' + packet.payload.ethertype)
  }
}

/**
 * Returns the sender and receiver IP adress of a IPv4 packet
 * @param packet - IPv4 packet
 * @return result - Object {senderIP: 'String', receiverIP: 'String'}
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
 *  TODO
 * Returns the sender and receiver IP adress of a IPv6 packet
 * @param packet - IPv6 packet
 * @return result - Object {senderIP: 'String', receiverIP: 'String'}
 **/
function handleIPv6Packet (packet) {
  console.log('Ipv6 in function')
}

/**
 * Returns the domain according to a reverse dns lookup of an IP Adress
 * @param ipAdress - IP Adress as String e.g. '192.0.0.1'
 * @return domains - domains found by dns.reverse
 **/
function lookupWebsites (ipAdress) {
  return new Promise((resolve, reject) => {
    dns.reverse(ipAdress, (err, domains) => {
      if (err) {
        reject(err)
      }
      console.log('reverse for ' + ipAdress + ': ' +
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
  handleIPv6Packet,
  getWebsitesFromPackets
}
