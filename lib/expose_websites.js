const dns = require('dns')

const localIP = '192.168.178.0' // TODO: make local IP a variable

/**
 * Return sender and receiver ip addresses of all pcap packets in decodedPackets
 * @param decodedPackets - object with array 'packets' of type pcap packet
 * @return ipAddresses - array of objects holding sender and receiver IP address
 * as strings {senderIP: 'String', receiverIP: 'String'}
 **/
function getWebsitesFromPackets (decodedPackets) {
  var ipAddresses = []
  for (var packet of decodedPackets.packets) {
    var processedPkt = processPacket(packet)
    // console.log(processedPkt)
    if (processedPkt.hasOwnProperty('senderIP') && processedPkt.hasOwnProperty('receiverIP')) {
      // console.log('push ', processedPkt)
      ipAddresses.push(processedPkt)
    }
  }
  return ipAddresses
}

/**
 * Returns processing of a packet according to its type. IPv4 and IPv6 supported
 * @param packet - single decoded pcap packet
 * @return returns the method to process the packet, which returns the sender
 * and receiver IP address
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
 * Returns the sender and receiver IP address of a IPv4 packet
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
 * Returns the sender and receiver IP address of a IPv6 packet
 * @param packet - IPv6 packet
 * @return result - Object {senderIP: 'String', receiverIP: 'String'}
 **/
function handleIPv6Packet (packet) {
  console.log('Ipv6 in function')
  return 'IPv6 Packet'
}

/**
 * Returns the domain according to a reverse dns lookup of an IP address
 * @param ipAddress - IP address as String e.g. '192.0.0.1'
 * @return domains - domains found by dns.reverse
 **/
function lookupWebsites (ipAddress) {
  return new Promise((resolve, reject) => {
    dns.reverse(ipAddress, (err, domains) => {
      if (err) {
        reject(err)
      }
      // console.log('reverse for ' + ipAddress + ': ' + domains)
      resolve(domains)
    })
  })
}

 /**
  * Returns Object with local IP address and receiving IP address
  * @param sender - IP address as String
  * @param receiver - IP address as String
  * @result Object - local IP address, receiving IP address
  **/
function getLocalAddress (sender, receiver) {
  if (getNetworkPartOfIP(sender) === getNetworkPartOfIP(localIP)) {
    // console.log('sender is local')
    return {local: sender, receiver}
  } else {
    // if sender is not local, then receiver must be local
    // console.log('receiver is local')
    return {local: receiver, receiver: sender}
  }
}

/**
 * Returns network part of IP address
 **/
function getNetworkPartOfIP (ipAddress) {
  return ipAddress.substring(0, ipAddress.lastIndexOf('.'))
}

module.exports = {
  lookupWebsites,
  processPacket,
  handleIPv4Packet,
  handleIPv6Packet,
  getWebsitesFromPackets,
  getLocalAddress
}
