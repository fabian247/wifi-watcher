const dns = require('dns')

const localIP = '192.168.178.0'
// TODO: make local IP a variable or in config file

function getRoutesFromPacketArray (packetArray) {
  var routesArray = []
  for (var packet in packetArray) {
    try {
      routesArray.push(getRouteFromPacket(packet))
    } catch (exception) {
      console.log(exception)
    }
  }
}

function getRouteFromPacket (decodedPacket) {
  return processPacket(decodedPacket)
}

// TODO: check if packet is valid
function processPacket (packet) {
  switch (packet.payload.ethertype) {
    case 0x800:
      // console.log('Ipv4')
      // use module.exports.function for testability
      return module.exports.handleIPv4Packet(packet.payload.payload)
    case 0x86dd:
      // console.log('Ipv6')
      return module.exports.handleIPv6Packet(packet.payload.payload)
    default:
      throw new Error('Don\'t know how to handle this packet of ethertype ' + packet.payload.ethertype)
  }
}

// TODO: check if packet is valid, check if IPs are valid
function handleIPv4Packet (packet) {
  var route = {
    senderIP: packet.saddr.toString(),
    receiverIP: packet.daddr.toString()
  }
  // console.log('IPv4: ', result)
  return route
}

// TODO: same as IPv4
function handleIPv6Packet (packet) {
  console.log('Ipv6 in function')
  return 'IPv6 Packet'
}

// TODO: check if IP valid, return ipAddress if dns.reverse fails
function reverseLookupOfIP (ipAddress) {
  // console.log(ipAddress)
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

// TODO: check if IPs valid
function getLocalAddress (sender, receiver) {
  if (getNetworkPartOfIP(sender) === getNetworkPartOfIP(localIP)) {
    return {local: sender, receiver}
  } else {
    // if sender is not local, then receiver must be local
    return {local: receiver, receiver: sender}
  }
}

// TODO: check if IP valid
function getNetworkPartOfIP (ipAddress) {
  return ipAddress.substring(0, ipAddress.lastIndexOf('.'))
}

module.exports = {
  reverseLookupOfIP,
  processPacket,
  handleIPv4Packet,
  handleIPv6Packet,
  getRoutesFromPacketArray,
  getRouteFromPacket,
  getLocalAddress
}
